import os
from rag.pipeline import get_chat_llm
from agents.invoice_agent import InvoiceAgent
from dotenv import load_dotenv

load_dotenv()
agent = InvoiceAgent()

prompt = """
You are an expert Indian Chartered Accountant AI analyzing extracted text from an invoice. 
Do NOT comment on the quality of the text extraction or mention "OCR". 

Your job is to return a JSON object with the following strict structure:
{
  "total_invoice_value": 100300, 
  "total_tax_amount": 15300, 
  "eligible_itc": 15300
}

Rules:
1. MUST BE JSON.

Extracted invoice text:
GSTIN: 29ABCDE1234F1Z5 INVOICE TOTAL: 500

CRITICAL: You must respond with ONLY a raw, valid JSON object. Do NOT wrap the response in markdown blocks (e.g., do not use ```json). Do NOT include any conversational text, pleasantries, or explanations before or after the JSON. If you output anything other than the raw JSON object, the system will crash.
""".strip()

response = agent.llm.invoke(prompt)
print("Raw Response Length:", len(response.content if hasattr(response, "content") else str(response)))
print("Raw Response:", repr(response.content if hasattr(response, "content") else str(response)))
