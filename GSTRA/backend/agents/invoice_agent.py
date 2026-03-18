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
        return {
            "hsn": "unknown",
            "gst_rate": "unknown",
            "errors": ["Could not parse model output as JSON."],
            "suggestions": ["Retry analysis or provide a clearer invoice image."],
        }

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return {
            "hsn": "unknown",
            "gst_rate": "unknown",
            "errors": ["Invalid JSON returned by model."],
            "suggestions": ["Retry analysis or verify OCR text quality."],
        }


def _looks_like_valid_hsn(hsn: str) -> bool:
    hsn_digits = re.sub(r"\D", "", hsn or "")
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
            images = convert_from_bytes(content, fmt="png")
            for page_img in images:
                texts.append(pytesseract.image_to_string(page_img))
        else:
            image = Image.open(BytesIO(content))
            texts.append(pytesseract.image_to_string(image))

        return "\n".join(part.strip() for part in texts if part and part.strip())

    def analyze_invoice_text(self, extracted_text: str, language: str) -> Dict[str, Any]:
        language_hint = LANGUAGE_GUIDANCE.get(language, LANGUAGE_GUIDANCE["en"])
        prompt = f"""
You are an expert Indian GST invoice auditor.
{language_hint}

Analyze this OCR text from an invoice and return strict JSON only with this schema:
{{
  "hsn": "string",
  "gst_rate": "string or number",
  "errors": ["string"],
  "suggestions": ["string"]
}}

Validation tasks:
1) Identify HSN code and check if it appears valid.
2) Determine likely GST rate for identified HSN.
3) Check consistency where CGST + SGST should match IGST equivalent split logic.
4) Flag possible ITC eligibility issues.
5) Add actionable compliance suggestions.

OCR text:
{extracted_text}
""".strip()

        response = self.llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        data = _extract_first_json_block(content)

        hsn = str(data.get("hsn", ""))
        if hsn and not _looks_like_valid_hsn(hsn):
            data.setdefault("errors", []).append("HSN code format appears invalid. Expected 4, 6, or 8 digits.")
            data.setdefault("suggestions", []).append("Verify the HSN code against the GST rate schedule.")

        data.setdefault("hsn", "unknown")
        data.setdefault("gst_rate", "unknown")
        data.setdefault("errors", [])
        data.setdefault("suggestions", [])
        return data
