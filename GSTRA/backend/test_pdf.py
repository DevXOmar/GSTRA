import requests
with open("test.txt", "w") as f:
    f.write("This is a simple text file with GST IN: 29ABCDE1234F1Z5, HSN: 1234 expected to be ignored or act as an invoice.")

with open("test.txt", "rb") as f:
    files = {"file": ("test.txt", f, "text/plain")}
    data = {"language": "en"}
    response = requests.post("http://localhost:8000/api/invoice/analyze", files=files, data=data)
    print(response.json())
