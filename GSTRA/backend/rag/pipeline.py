import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from langchain_ollama import ChatOllama

load_dotenv()


LANGUAGE_GUIDANCE = {
    "en": "Respond in English.",
    "hi": "Respond in Hindi.",
    "te": "Respond in Telugu.",
    "ta": "Respond in Tamil.",
    "bn": "Respond in Bengali.",
}


def get_chat_llm():
    provider = os.getenv("LLM_PROVIDER", "openrouter").strip().lower()
    if provider == "ollama":
        return ChatOllama(
            model="llama3",
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            temperature=0.2,
        )

    return ChatOpenAI(
        model="mistralai/mixtral-8x7b-instruct",
        api_key=os.getenv("OPENROUTER_API_KEY", ""),
        base_url="https://openrouter.ai/api/v1",
        default_headers={
            "HTTP-Referer": "https://gstra.local",
            "X-Title": "GSTRA",
        },
        temperature=0.2,
    )


class GSTRagPipeline:
    def __init__(self):
        self.persist_path = os.getenv("CHROMA_PERSIST_PATH", "./chroma_db")
        self.data_dir = Path(os.getenv("GST_DATA_PATH", "../data"))
        self.embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        self.vectorstore = Chroma(
            collection_name="gst_docs",
            embedding_function=self.embedding_model,
            persist_directory=self.persist_path,
        )
        self.llm = get_chat_llm()

    def _load_pdf_docs(self) -> List[Document]:
        documents: List[Document] = []
        if not self.data_dir.exists():
            return documents

        for pdf_path in self.data_dir.glob("*.pdf"):
            loader = PyPDFLoader(str(pdf_path))
            documents.extend(loader.load())

        return documents

    def ingest_if_needed(self) -> None:
        should_force = os.getenv("FORCE_REINDEX", "false").lower() == "true"

        if not should_force:
            try:
                if self.vectorstore._collection.count() > 0:
                    return
            except Exception:
                pass

        docs = self._load_pdf_docs()
        if not docs:
            return

        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_documents(docs)
        self.vectorstore.add_documents(chunks)

    def answer_gst_query(self, message: str, language: str, business_type: str) -> str:
        language_hint = LANGUAGE_GUIDANCE.get(language, LANGUAGE_GUIDANCE["en"])
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": 4})
        retrieved_docs = retriever.invoke(message)
        context = "\n\n".join(doc.page_content for doc in retrieved_docs)

        prompt = ChatPromptTemplate.from_template(
            """
You are GSTRA, an empathetic, highly knowledgeable, and easy-to-understand GST compliance assistant for Indian MSMEs, shopkeepers, and freelancers.
Your goal is to make business compliance approachable and less intimidating. Provide clear, simple, and direct answers without legal jargon.
Only answer questions related to GST law, GST procedures, GST returns, ITC, e-invoicing, HSN/SAC, GST rates, penalties, and compliance.
If the query is not GST related, politely refuse and ask the user to ask a GST question in a friendly manner.

Business type: {business_type}
{language_hint}

Knowledge context:
{context}

User message:
{message}

Instructions:
1. Be empathetic and supportive to small business owners.
2. Provide a practical, compliance-safe answer.
3. Use short bullet points for readability.
4. If you are unsure or the context is missing, clearly state that the user should consult a CA or tax professional.
""".strip()
        )

        chain = prompt | self.llm
        response = chain.invoke(
            {
                "business_type": business_type,
                "language_hint": language_hint,
                "context": context if context else "No GST documents were retrieved.",
                "message": message,
            }
        )
        return response.content if hasattr(response, "content") else str(response)
