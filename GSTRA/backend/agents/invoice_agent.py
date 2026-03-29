import json
import re
from io import BytesIO
from typing import Any, Dict

import pytesseract
from fastapi import UploadFile
from pdf2image import convert_from_bytes
from PIL import Image

from rag.pipeline import LANGUAGE_GUIDANCE, get_chat_llm

from langchain_core.utils.json import parse_json_markdown
from pydantic import BaseModel, Field
from typing import List

class InvoiceAuditResult(BaseModel):
    total_invoice_value: float = Field(description="The grand total amount of the invoice. (Numeric only)")
    total_tax_amount: float = Field(description="The total tax charged (CGST + SGST or IGST). (Numeric only)")
    eligible_itc: float = Field(description="The amount available for Input Tax Credit. This should equal the total_tax_amount if the invoice is valid B2B. (Numeric only)")
    buyer_state_code: str = Field(description="2-digit state code of the buyer extracted from GSTIN", default="unknown")
    supplier_state_code: str = Field(description="2-digit state code of the supplier extracted from GSTIN", default="unknown")
    math_validation_status: str = Field(description="State if line item totals and tax calculations match. strictly 'valid' or 'invalid'")
    supply_routing_status: str = Field(description="State if routing is correct based on Buyer/Supplier State Codes. strictly 'valid' or 'invalid'")
    gstin_format_status: str = Field(description="State if Supplier & Buyer GSTINs are valid. strictly 'valid' or 'invalid'")
    extracted_hsn: List[str] = Field(description="List of all HSN codes found in the line items", default=[])
    effective_tax_slab: str = Field(description="The effective total tax percentage (e.g., '18%'). Calculate by adding CGST% + SGST% if split.", default="unknown")
    actionable_alerts: List[str] = Field(description="List strictly specific tax-related warnings (e.g., 'Missing signature', 'Tax totals do not match item rates'). Do NOT give generic advice.", default=[])
    quick_actions: List[Dict[str, str]] = Field(description="List of dicts with label and url for fixes", default=[])

def clean_llm_json(response_string: str) -> dict:
    try:
        return parse_json_markdown(response_string)
    except Exception as e:
        print(f"JSON Parsing Error: {e} - Raw output: {response_string}")
        return { 
            "total_invoice_value": 0, 
            "total_tax_amount": 0, 
            "eligible_itc": 0, 
            "error": "Failed to parse invoice data." 
        }

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

        import asyncio
        return await asyncio.to_thread(self._sync_extract, content, filename, content_type)

    def _sync_extract(self, content: bytes, filename: str, content_type: str) -> str:
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
                    images = convert_from_bytes(content, fmt="png", first_page=1, last_page=2)
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
        
        # Enforce the structured output so LangChain directly handles system prompts and guaranteed schema layout.
        structured_llm = self.llm.with_structured_output(InvoiceAuditResult, include_raw=False)
        
        prompt = f"""
You are an expert Indian Chartered Accountant AI analyzing OCR text from an invoice.
Extract the data and strictly conform to the provided schema. {language_hint}
Do NOT comment on the quality of the text extraction or mention "OCR" outside of extraction logic.

CRITICAL LOGIC RULES:
1. "eligible_itc": If the invoice contains both a Supplier GSTIN and a Buyer GSTIN, the buyer can claim ITC. Set this equal to the "total_tax_amount".
2. "detected_hsn": Look for 4, 6, or 8 digit numbers in the HSN column and return them as a list of strings.
3. "tax_slab": Look at the tax columns. If you see CGST 9% and SGST 9%, the effective tax_slab is "18%". Do not just return "9%".

Extracted invoice text:
{extracted_text}
""".strip()

        try:
            # invoke returns a parsed Pydantic object
            structured_data = structured_llm.invoke(prompt)
            data = structured_data.model_dump()
        except Exception as e:
            print(f"Structured Output Parsing Error: {e}")
            # Use original fallback if the structured tool fails
            data = _default_response("Failed to generate correct schema structure.")

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
