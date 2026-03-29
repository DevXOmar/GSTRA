import os
from rag.pipeline import get_chat_llm
from dotenv import load_dotenv

load_dotenv()
llm = get_chat_llm()
prompt = """
You are an expert Indian Chartered Accountant AI analyzing extracted text from an invoice. 
Respond in English.

Your job is to return a JSON object.
"""
print(llm.invoke(prompt))
