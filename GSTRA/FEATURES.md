# GSTRA: GenAI GST Compliance for MSMEs

**GSTRA** is a comprehensive, AI-powered platform designed to simplify Goods and Services Tax (GST) compliance for Micro, Small, and Medium Enterprises (MSMEs) in India. Built with a modern tech stack and leveraging generative AI, the application acts as a smart, 24/7 financial advisor to ensure businesses file on time, avoid penalties, and understand complex tax requirements.

---

## 🚀 Core Features

### 1. 💬 Multilingual Chat Advisor 
An intelligent AI chat interface tailored specifically to answer GST-related queries, deeply integrated with the business's specific context.
* **Context-Aware Assistance**: Adapts answers based on the user's specific business profile (e.g., Turnover, Sector, State).
* **Multilingual Support**: Breaks down language barriers by providing advice in English, Hindi, Telugu, Tamil, and Bengali.
* **Generative RAG Backend**: Uses Retrieval-Augmented Generation (RAG) powered by LangChain and ChromaDB for highly accurate, up-to-date GST law referencing.

### 2. 📄 Smart Invoice Analyzer (OCR)
A drag-and-drop utility that automatically extracts and analyzes invoice data to ensure GST compliance.
* **Seamless Drag-and-Drop**: Built using modern Next.js and Framer Motion for a fluid user experience.
* **Automated Data Extraction**: Powered by pytesseract and custom AI agents, it detects key fields, GSTIN validity, and missing compliance elements from uploaded invoices.
* **Immediate Feedback**: Flags formatting issues or missing data that could lead to Input Tax Credit (ITC) rejection.

### 3. 📊 Compliance & Penalty Dashboard
A comprehensive visual tracker allowing MSMEs to monitor their overall health regarding tax filings and regulations.
* **Profile Customization**: Users can easily adjust their turnover, sector, and state to see real-time shifts in their compliance obligations.
* **Dynamic Form & Deadline Tracking**: Clearly outlines exactly which forms (e.g., GSTR-1, GSTR-3B) are applicable and lists immediate upcoming due dates.
* **Composition Scheme Eligibility**: Automatically calculates and informs the user if they qualify for the simpler composition scheme based on their financial metrics.
* **Risk & Penalty Visualization**: Visually charts out estimated late fee impacts and displays actionable alerts/notes mitigating risk using interactive React charts.

---

## 🛠️ Technology Stack

### Frontend (Next.js 14)
* **Framework**: Next.js App Router
* **Styling**: Tailwind CSS (Premium Ruby/Crimson and Slate theme) + Framer Motion for animations.
* **State Management & Fetching**: React Query, Axios.
* **Components**: Responsive layout shell, drag-and-drop zones, Recharts for data visualization, and Sonner for toast notifications.

### Backend (Python FastAPI)
* **API Engine**: FastAPI serving strict JSON contracts.
* **AI & Machine Learning**: LangChain, Ollama/OpenRouter, and custom multi-agent structures for invoice and compliance generation.
* **Vector Database**: ChromaDB for document storage and search.
* **OCR**: Pytesseract for invoice parsing.
* **Robust Error Handling**: Standardized exception handling to prevent LLM hallucination crashes on the frontend.

---

## 🎯 The Goal
GSTRA acts as a bridge between complex Indian tax structures and the everyday business owner. By offering an accessible UI, instant document parsing, and localized AI guidance, it eliminates the guesswork and stress from GST compliance.