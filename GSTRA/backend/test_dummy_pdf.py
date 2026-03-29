import asyncio
import os

from dotenv import load_dotenv
load_dotenv()

async def run():
    print("Testing invoice agent direct with dummy.pdf...")
    try:
        from agents.invoice_agent import InvoiceAgent
        agent = InvoiceAgent()
        
        print("Mocking file upload...")
        with open("dummy.pdf", "rb") as f:
            class MockFile:
                def __init__(self, f):
                    self.f = f
                    self.filename = "dummy.pdf"
                    self.content_type = "application/pdf"
                async def read(self):
                    return self.f.read()
            
            mock_file = MockFile(f)
            print("Calling ocr_from_upload...")
            t = await agent.ocr_from_upload(mock_file)
            print("OCR result: " + repr(t))
            
            print("Calling analyze_invoice_text...")
            ans = agent.analyze_invoice_text(t, "en")
            print("Analyze result:", ans)
    except Exception as e:
        print(f"FAILED WITH EXCEPTION: {e}")

if __name__ == "__main__":
    asyncio.run(run())
