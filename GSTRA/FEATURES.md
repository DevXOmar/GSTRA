# GSTRA: GenAI GST Compliance for MSMEs

**GSTRA** is a comprehensive, centralized "Command Center" designed to simplify Goods and Services Tax (GST) compliance for Micro, Small, and Medium Enterprises (MSMEs), freelancers, and accountants in India. Built with a modern, cinematic "Slate & Ruby Red" aesthetic, the platform shifts tax compliance from a confusing, fear-based chore into an effortless, transparent, and rewarding experience.

---

## 🚀 Core Features & UI Walkthrough

### 1. 💬 "Trust & Verify" Multilingual Chat Advisor 
*An intelligent AI Tax Associate tailored to answer GST queries, ground responses in actual law, and bridge the language gap for Tier 2/3 business owners.*

**Key UI Elements & Capabilities:**
* **Instant Profile Insights (Left Sidebar):** A dynamic, reactive business profile engine. Instead of generic advice, users set their *Annual Turnover* (via a fluid slider), *State*, *Sector*, and *GST Status*. Using Framer Motion, the UI instantly generates animated "Live Insight" badges (e.g., alert tags for exceeding 20 Lakh turnover thresholds for registration), actively adapting to the user's business context.
* **Voice-First Input Mode:** A "WhatsApp-style" pulsing microphone icon allows shopkeepers to dictate complex queries naturally, rendering a dynamic audio waveform UI while transcribing the query.
* **"Trust & Verify" Citation Drawer:** To eliminate AI hallucination fears, legal claims generate clickable Ruby-Red source pills. Clicking these triggers a sleek right-hand drawer displaying the exact legal excerpt (e.g., GST Circulars) retrieved by our RAG pipeline.
* **Smart CA Export Utility:** A one-click "Export to CA" button that triggers a specialized LLM pipeline. Instead of a raw chat dump, it parses the history to instantly generate a professionally formatted, actionable HTML/PDF _Tax Advisory Report_ to be sent directly to an accountant.

### 2. 📊 Gamified Compliance Dashboard
*A comprehensive visual tracker that reframes compliance as a positive habit rather than a looming punishment.*

**Key UI Elements & Capabilities:**
* **Zero Penalty Streak Widget:** A highly visible, gamified dark-mode banner featuring a pulsing flame icon (resembling streak mechanics in apps like Duolingo). It tracks the number of days the business has remained penalty-free, encouraging positive reinforcement.
* **Upcoming Missions Tracker:** Deadlines are no longer intimidating alerts. They are visually reframed as "Upcoming Missions" (e.g., "File GSTR-3B by 20th") attached with gamified point multipliers (+100pts).
* **Live Compliance Status Modules:** Quick-glance cards indicating whether GST Registration is legally required, which specific forms apply, and Composition Scheme eligibility based dynamically on the user's active UI sliders.
* **Late Fee Impact Visualization:** An interactive Recharts-powered Bar Chart natively estimating financial risk/late fees scaling across varying delay periods (1 month, 3 months, etc.), showing business owners the exact cost of non-compliance.

### 3. 📄 "Action-Oriented" Invoice Analyzer (Hybrid Parser)
*More than just extraction—this module proactively flags ITC (Input Tax Credit) risks and formatting errors before they result in governmental penalties. It utilizes a robust hybrid parsing engine that primarily natively extracts embedded text via `pypdf`, falling back gracefully to Tesseract OCR for flat images to prevent system crashes across different OS environments.*

**Key UI Elements & Capabilities:**
* **Framer Motion Dropzone:** A smooth, interactive drag-and-drop area that gives immediate visual feedback upon file upload.
* **Original Document View (Left Pane):** Renders the uploaded invoice directly with bounding boxes highlighting detected, missing, or problematic fields.
* **Actionable Correction Engine (Right Pane):** Instead of simply dumping extracted text, it generates a holistic "Compliance Score" (e.g., 85/100). It highlights standard alerts in bright red and offers "One-Click Fixes" (e.g., providing an inline search to fix a missing HSN code).

---

## 🛠️ Technology Stack

* **Frontend (Next.js 14 App Router):** 
  * *Styling:* Tailwind CSS utilizing a modern minimalist Slate/Charcoal base paired with deep Ruby/Crimson accents.
  * *Animations & Data Viz:* Framer Motion for liquid layout transitions, Recharts for financial graphing.
  * *State Handling:* React Query, Sonner.
* **Backend (Python FastAPI):** 
  * *Architecture:* Fast, async-first endpoints serving strict JSON error-handled contracts.
  * *AI Generation:* LangChain orchestrated with OpenRouter/Ollama powering the business logic.
  * *Knowledge Base (RAG):* ChromaDB for indexing and querying complex GST laws and governmental circulars.
  * *Computer Vision & Parsing:* `pypdf` for fast, native text extraction from structured PDFs, and `pytesseract`/`pdf2image` integrated for secondary image OCR—orchestrated via adaptive backends.

---

## 🎯 The Philosophy
GSTRA is designed to act as the ultimate MSME Tax Assistant. By prioritizing transparency (legal citations), accessibility (voice + multilingual UI), and positive reinforcement (penalty streaks), everyday business owners no longer have to blindly trust an AI or live in fear of unnoticed tax penalties.
