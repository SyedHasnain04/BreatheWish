import sys
import uvicorn
import requests
import threading
import time

sys.path.append('.')
from app.main import app

def run_server():
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="error")

t = threading.Thread(target=run_server)
t.daemon = True
t.start()
time.sleep(3)

patient_data = {
    "email": "patient2@test.com",
    "password": "password123",
    "full_name": "Test Patient",
    "role": "patient",
    "date_of_birth": "1990-01-01"
}

try:
    res = requests.post("http://127.0.0.1:8001/auth/register", json=patient_data)
    print(f"Status: {res.status_code}")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Request failed: {e}")
