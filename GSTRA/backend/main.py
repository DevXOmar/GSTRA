import json
import re
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from agents.invoice_agent import InvoiceAgent
from rag.pipeline import LANGUAGE_GUIDANCE, GSTRagPipeline, get_chat_llm


class ChatRequest(BaseModel):
    message: str
    language: str = Field(default="en")
    business_type: str = Field(default="general")


class ComplianceRequest(BaseModel):
    turnover: float
    sector: str
    filing_type: str
    language: str = Field(default="en")


def api_response(data: Any, language: str, status: str = "success") -> Dict[str, Any]:
    return {"status": status, "data": data, "language": language}


def extract_first_json(text: str) -> Dict[str, Any]:
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        return {
            "registration_required": "unknown",
            "applicable_forms": [],
            "due_dates": [],
            "penalties": [],
            "composition_eligible": "unknown",
            "notes": ["Unable to parse LLM output."],
        }

    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError:
        return {
            "registration_required": "unknown",
            "applicable_forms": [],
            "due_dates": [],
            "penalties": [],
            "composition_eligible": "unknown",
            "notes": ["Invalid JSON from LLM."],
        }


app = FastAPI(title="GSTRA Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_pipeline = GSTRagPipeline()
invoice_agent = InvoiceAgent()
compliance_llm = get_chat_llm()


@app.on_event("startup")
def startup() -> None:
    rag_pipeline.ingest_if_needed()


@app.get("/health")
def health() -> Dict[str, Any]:
    return api_response({"message": "ok"}, language="en")


@app.post("/api/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    language = request.language if request.language in LANGUAGE_GUIDANCE else "en"
    try:
        answer = rag_pipeline.answer_gst_query(
            message=request.message,
            language=language,
            business_type=request.business_type,
        )
        return api_response({"answer": answer}, language=language)
    except Exception as e:
        return api_response({"answer": f"Service unavailable. Please try again. ({str(e)})"}, language=language, status="error")


@app.post("/api/invoice/analyze")
async def analyze_invoice(
    file: UploadFile = File(...),
    language: str = Form(default="en"),
) -> Dict[str, Any]:
    lang = language if language in LANGUAGE_GUIDANCE else "en"
    try:
        extracted_text = await invoice_agent.ocr_from_upload(file)

        if not extracted_text:
            return api_response(
                {
                    "hsn": "unknown",
                    "gst_rate": "unknown",
                    "errors": ["No text could be extracted from invoice."],
                    "suggestions": ["Upload a clearer invoice image/PDF and try again."],
                    "extracted_text_preview": "",
                },
                language=lang,
                status="error",
            )

        analysis = invoice_agent.analyze_invoice_text(extracted_text, language=lang)
        analysis["extracted_text_preview"] = extracted_text[:1000]
        return api_response(analysis, language=lang)
    except Exception as e:
        return api_response(
            {
                "hsn": "unknown",
                "gst_rate": "unknown",
                "errors": [f"Error checking invoice: {str(e)}"],
                "suggestions": ["Ensure file is a valid image/PDF."],
                "extracted_text_preview": "",
            },
            language=lang,
            status="error",
        )


@app.post("/api/compliance/check")
def compliance_check(request: ComplianceRequest) -> Dict[str, Any]:
    language = request.language if request.language in LANGUAGE_GUIDANCE else "en"
    language_hint = LANGUAGE_GUIDANCE[language]

    prompt = f"""
You are an Indian GST compliance expert. {language_hint}
Return strict JSON only with this schema:
{{
  "registration_required": "string",
  "applicable_forms": ["string"],
  "due_dates": ["string"],
  "penalties": ["string"],
  "composition_eligible": "string",
  "notes": ["string"]
}}

Input:
- turnover: {request.turnover}
- sector: {request.sector}
- filing_type: {request.filing_type}

Tasks:
1) Determine GST registration requirement.
2) Suggest applicable forms among GSTR-1, GSTR-3B, GSTR-9.
3) Mention due dates at high level.
4) Explain non-filing penalty risks.
5) Check likely composition scheme eligibility.
""".strip()

    try:
        response = compliance_llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        guidance = extract_first_json(content)
        return api_response(guidance, language=language)
    except Exception as e:
        return api_response({
            "registration_required": "Error",
            "applicable_forms": [],
            "due_dates": [],
            "penalties": [],
            "composition_eligible": "Error",
            "notes": [f"Failed to check compliance: {str(e)}"]
        }, language=language, status="error")
