export type LanguageCode = "en" | "hi" | "te" | "ta" | "bn";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }
  return response.json() as Promise<T>;
}

export async function sendChat(payload: {
  message: string;
  language: LanguageCode;
  business_type: string;
}) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return parseResponse<{ status: string; data: { answer: string }; language: LanguageCode }>(res);
}

export async function analyzeInvoice(file: File, language: LanguageCode) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);

  const res = await fetch(`${API_BASE}/api/invoice/analyze`, {
    method: "POST",
    body: formData
  });

  return parseResponse<{
    status: string;
    language: LanguageCode;
    data: {
      hsn: string;
      gst_rate: string;
      errors: string[];
      suggestions: string[];
      extracted_text_preview?: string;
    };
  }>(res);
}

export async function checkCompliance(payload: {
  turnover: number;
  sector: string;
  filing_type: string;
  language: LanguageCode;
}) {
  const res = await fetch(`${API_BASE}/api/compliance/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return parseResponse<{
    status: string;
    language: LanguageCode;
    data: {
      registration_required: string;
      applicable_forms: string[];
      due_dates: string[];
      penalties: string[];
      composition_eligible: string;
      notes: string[];
    };
  }>(res);
}
