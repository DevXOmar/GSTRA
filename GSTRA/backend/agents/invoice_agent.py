import json
import re
from io import BytesIO
from typing import Any, Dict

import pytesseract
from fastapi import UploadFile
from pdf2image import convert_from_bytes
from PIL import Image

from rag.pipeline import LANGUAGE_GUIDANCE, get_chat_llm

def _extract_first_json_block(text: str) -> Dict[str, Any]:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return _default_response("Could not parse model output as JSON.")

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return _default_response("Invalid JSON returned by model.")


def _default_response(error_message: str) -> Dict[str, Any]:
    return {
        "total_invoice_value": 0,
        "total_tax_amount": 0,
        "eligible_itc": 0,
        "buyer_state_code": "unknown",
        "supplier_state_code": "unknown",
        "math_validation_status": "invalid",
        "supply_routing_status": "invalid",
        "gstin_format_status": "invalid",
        "extracted_hsn": [],
        "effective_tax_slab": "unknown",
        "actionable_alerts": [error_message] if error_message else [],
        "quick_actions": [],
    }

def _looks_like_valid_hsn(hsn: str) -> bool:
    if not hsn or hsn.lower() == "unknown":
        return False
    hsn_digits = re.sub(r"\D", "", hsn)
    return len(hsn_digits) in {4, 6, 8}

class InvoiceAgent:
    def __init__(self):
        self.llm = get_chat_llm()

    async def ocr_from_upload(self, file: UploadFile) -> str:
        content = await file.read()
        if not content:
            return ""

        filename = (file.filename or "").lower()
        content_type = (file.content_type or "").lower()

        texts = []
        if "pdf" in content_type or filename.endswith(".pdf"):
            try:
                import pypdf
                pdf_reader = pypdf.PdfReader(BytesIO(content))
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        texts.append(page_text)
            except Exception as e:
                print(f"pypdf fallback failed: {e}")
                pass
                
            # If native extraction failed or got zero text (e.g. scanned PDF)
            if not texts or not any(t.strip() for t in texts):
                try:
                    images = convert_from_bytes(content, fmt="png")
                    for page_img in images:
                        texts.append(pytesseract.image_to_string(page_img))
                except Exception as e:
                    print(f"pdf2image fallback failed: {e}")
        else:
            try:
                image = Image.open(BytesIO(content))
                texts.append(pytesseract.image_to_string(image))
            except Exception as e:
                print(f"image ocr failed: {e}")

        return "\n".join(part.strip() for part in texts if part and part.strip())

    def analyze_invoice_text(self, extracted_text: str, language: str) -> Dict[str, Any]:
        language_hint = LANGUAGE_GUIDANCE.get(language, LANGUAGE_GUIDANCE["en"])
        prompt = f"""
You are an expert Indian Chartered Accountant AI analyzing extracted text from an invoice. 
Do NOT comment on the quality of the text extraction or mention "OCR". 
{language_hint}

Your job is to return a JSON object with the following strict structure:
{{
  "total_invoice_value": 100300, 
  "total_tax_amount": 15300, 
  "eligible_itc": 15300,
  "buyer_state_code": "29", 
  "supplier_state_code": "29",
  "math_validation_status": "valid", 
  "supply_routing_status": "valid",
  "gstin_format_status": "valid",
  "extracted_hsn": ["84713010"],
  "effective_tax_slab": "18%",
  "actionable_alerts": [
    "List ONLY specific tax-related warnings (e.g., 'Missing signature', 'Tax totals do not match item rates'). Do NOT give generic advice."
  ],
  "quick_actions": [
    {{
      "label": "Verify Supplier GSTIN",
      "url": "https://services.gst.gov.in/services/searchtp"
    }}
  ]
}}

Rules:
1. `total_invoice_value`, `total_tax_amount`, `eligible_itc` MUST be NUMBERS.
2. `buyer_state_code`, `supplier_state_code` MUST be 2-digit strings (extract from GSTINs), else "unknown".
3. `math_validation_status` MUST be either "valid" or "invalid" (Check if Qty * Rate + Tax = Total approx).
4. `supply_routing_status` MUST be either "valid" or "invalid" (Check if intra-state has CGST+SGST, inter-state IGST).
5. `gstin_format_status` MUST be either "valid" or "invalid" (Check if GSTINs mentioned look structurally valid).
6. `effective_tax_slab` MUST Combine CGST + SGST to find the total rate, OR use IGST (e.g., '18%').

Extracted invoice text:
{extracted_text}
""".strip()

        response = self.llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        data = _extract_first_json_block(content)

        extracted_hsn = data.get("extracted_hsn", [])
        if isinstance(extracted_hsn, list):
            for hsn in extracted_hsn:
                if not _looks_like_valid_hsn(str(hsn)):
                    data.setdefault("actionable_alerts", []).append(f"HSN code '{hsn}' format appears invalid. Expected 4, 6, or 8 digits.")

        # Ensure all keys are populated with defaults
        defaults = _default_response("")
        for k, v in defaults.items():
            if k not in data:
                data[k] = v
        
        # Ensure numbers aren't None
        for k in ['total_invoice_value', 'total_tax_amount', 'eligible_itc']:
            if not isinstance(data.get(k), (int, float)):
                try:
                    data[k] = float(data[k]) if data[k] else 0.0
                except (ValueError, TypeError):
                    data[k] = 0.0

        return data
