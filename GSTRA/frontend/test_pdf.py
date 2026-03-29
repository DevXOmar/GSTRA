import urllib.request
import asyncio
import io
from pdf2image import convert_from_bytes
from fastapi import UploadFile
from unittest.mock import AsyncMock

async def test():
    urls = ['https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf']
    req = urllib.request.urlopen(urls[0])
    pdf_bytes = req.read()
    
    try:
        images = convert_from_bytes(pdf_bytes, fmt="png")
        print("PDF conversion successful, got", len(images), "images")
    except Exception as e:
        print("PDF conversion failed:", e)

asyncio.run(test())
