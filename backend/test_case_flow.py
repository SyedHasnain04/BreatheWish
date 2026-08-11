import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def login(email, password):
    data = {"username": email, "password": password}
    response = requests.post(f"{BASE_URL}/auth/login", data=data)
    response.raise_for_status()
    return response.json()["access_token"]

def main():
    print("1. Logging in as Patient (ravi@patient.com)...")
    patient_token = login("ravi@patient.com", "patient123")
    patient_headers = {"Authorization": f"Bearer {patient_token}"}
    
    # Get patient ID
    me_resp = requests.get(f"{BASE_URL}/auth/me", headers=patient_headers).json()
    patient_id = me_resp["id"]
    print(f"   Patient ID: {patient_id}")

    print("\n2. Creating a new case...")
    symptoms = {
        "age": 45,
        "weight": 70.5,
        "sex": "male",
        "date_of_birth": "1981-05-12",
        "blood_group": "O+",
        "existing_conditions": ["Asthma"],
        "fever": True,
        "fever_days": 3,
        "cough_type": "Wet",
        "breathing_difficulty": 3,
        "chest_pain": True,
        "symptom_duration_days": 5
    }
    
    with open("../frontend/public/chest-xray.png", "rb") as f:
        files = {"xray": ("chest-xray.png", f, "image/png")}
        data = {"symptoms": json.dumps(symptoms)}
        case_resp = requests.post(f"{BASE_URL}/cases/", headers=patient_headers, data=data, files=files)
        
    case_resp.raise_for_status()
    case_id = case_resp.json()["case_id"]
    print(f"   Case created! ID: {case_id}")
    
    print("\n3. Patient fetching case details (AI fields should be hidden)...")
    patient_case = requests.get(f"{BASE_URL}/cases/{case_id}", headers=patient_headers).json()
    print("   Patient sees:", json.dumps(patient_case, indent=2))
    assert "ai_confidence" not in patient_case, "Patient should not see AI confidence!"
    assert "gradcam_url" not in patient_case, "Patient should not see Grad-CAM!"

    print("\n4. Logging in as Doctor (arun@hospital.com)...")
    doctor_token = login("arun@hospital.com", "doctor123")
    doctor_headers = {"Authorization": f"Bearer {doctor_token}"}
    
    print("\n5. Doctor fetching case details (AI fields should be present)...")
    doctor_case = requests.get(f"{BASE_URL}/cases/{case_id}", headers=doctor_headers).json()
    print("   Doctor sees:", json.dumps({k: v for k, v in doctor_case.items() if k != 'symptoms'}, indent=2))
    assert "ai_confidence" in doctor_case, "Doctor must see AI confidence!"
    assert "gradcam_url" in doctor_case, "Doctor must see Grad-CAM!"
    
    print("\n✅ End-to-end flow successful!")

if __name__ == "__main__":
    main()
