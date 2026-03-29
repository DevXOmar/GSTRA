# GSTRA

GenAI-powered GST compliance assistant for Indian MSMEs.

## What This Includes

- `backend/` FastAPI (Python 3.12+)
  - RAG over GST PDFs using LangChain + ChromaDB + local embeddings
  - Hybrid invoice analysis (Native `pypdf` parsing + `pytesseract` OCR fallback)
  - Compliance checker for filing guidance
- `frontend/` Next.js 14 + Tailwind CSS
  - Chat interface
  - Invoice analyzer
  - Compliance dashboard
- `data/` GST Acts, CBIC notifications, and other PDFs for retrieval
- `docker-compose.yml` to run frontend + backend together

## Architecture (ASCII)

```text
                           +-----------------------------+
                           |         User (MSME)         |
                           +--------------+--------------+
                                          |
                                          v
+------------------------------------------------------------------------+
|                        Frontend (Next.js 14)                            |
|  - Chat UI  - Invoice Upload  - Dashboard  - React Query               |
+-------------------------------+----------------------------------------+
                                |
                                | HTTP/JSON
                                v
+------------------------------------------------------------------------+
|                         Backend (FastAPI)                               |
|  /health                                                               |
|  /api/chat                                                             |
|  /api/invoice/analyze                                                  |
|  /api/compliance/check                                                 |
+------------------+---------------------------+--------------------------+
                   |                           |
                   v                           v
      +-------------------------+   +--------------------------+
      | RAG Pipeline            |   | Invoice + Compliance     |
      | - LangChain             |   | Agents                   |
      | - ChromaDB (local)      |   | - Hybrid Parser (pypdf)  |
      | - all-MiniLM-L6-v2      |   | - OCR Fallback           |
      +-----------+-------------+   +------------+-------------+
                  |                              |
                  v                              v
      +--------------------------+    +--------------------------+
      | data/*.pdf (GST corpus)  |    | LLM Provider             |
      | ingested at startup      |    | OpenRouter or Ollama     |
      +--------------------------+    +--------------------------+
```

## Environment Variables

Create/update `backend/.env.example` (or copy to `.env`):

```env
OPENROUTER_API_KEY=
LLM_PROVIDER=openrouter
OLLAMA_BASE_URL=http://localhost:11434
CHROMA_PERSIST_PATH=./chroma_db
GST_DATA_PATH=../data
```

Frontend env (optional, defaults already wired in compose):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## Run With Docker Compose

From project root:

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

## Run Locally Without Docker

### 1) Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

System dependencies required for OCR fallback (if analyzing scanned images):

- `tesseract-ocr`
- `poppler` (needed by `pdf2image` for rendering image scans, but natively bypassed for text-based PDFs)

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Contracts

All API responses follow:

```json
{
  "status": "success",
  "data": {},
  "language": "en"
}
```

### Chat

`POST /api/chat`

```json
{
  "message": "Explain GSTR-3B filing",
  "language": "en",
  "business_type": "Retail"
}
```

### Invoice Analyze

`POST /api/invoice/analyze` (multipart form)

- `file`: invoice image or PDF
- `language`: `en|hi|te|ta|bn`

### Compliance Check

`POST /api/compliance/check`

```json
{
  "turnover": 2500000,
  "sector": "Retail",
  "filing_type": "regular",
  "language": "en"
}
```

## How To Add New GST Documents To Knowledge Base

1. Put GST PDFs into `data/`.
2. Restart backend service.
3. Optional: force re-index by setting `FORCE_REINDEX=true` before startup.
4. ChromaDB persists vectors under `CHROMA_PERSIST_PATH`.

Recommended document types:

- GST Act and Rules
- CBIC circulars/notifications
- Advance ruling summaries
- GST rate schedules and HSN references

## Current LLM Providers

- `LLM_PROVIDER=openrouter`
  - Model: `mistralai/mixtral-8x7b-instruct`
- `LLM_PROVIDER=ollama`
  - Model: `llama3`

## Languages Supported

- `en` English
- `hi` Hindi
- `te` Telugu
- `ta` Tamil
- `bn` Bengali

## Notes

- RAG is restricted to GST domain prompts in system instructions.
- OCR quality depends on invoice clarity and scan quality.
- Compliance results are guidance-first and should be reviewed against latest notifications for filing-critical decisions.
