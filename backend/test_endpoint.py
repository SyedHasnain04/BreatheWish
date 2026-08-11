import requests

def test_inference_endpoint():
    url = "http://127.0.0.1:8000/cases/test-inference"
    file_path = "../frontend/public/chest-xray.png"
    
    print(f"Testing {url} with {file_path}...")
    with open(file_path, "rb") as f:
        files = {"xray": ("chest-xray.png", f, "image/png")}
        response = requests.post(url, files=files)
        
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_inference_endpoint()
