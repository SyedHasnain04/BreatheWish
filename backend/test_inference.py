import urllib.request
import os
from app.services.ml_service import run_inference
import sys

def main():
    print("Downloading sample X-ray...")
    # A sample chest X-ray from Wikimedia Commons
    url = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg/512px-Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg"
    image_path = "sample_xray.jpg"
    
    urllib.request.urlretrieve(url, image_path)
    
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    
    print("Running inference pipeline...")
    try:
        result = run_inference(image_bytes)
        print(f"✅ Inference successful!")
        print(f"Confidence: {result['confidence']}%")
        print(f"Severity: {result['severity']}")
        print(f"Type: {result['type']}")
        
        # Save Grad-CAM output
        gradcam_path = "test_gradcam.png"
        with open(gradcam_path, "wb") as f:
            f.write(result['gradcam_image'])
        print(f"✅ Grad-CAM saved to {gradcam_path}")
        
    except Exception as e:
        print(f"❌ Pipeline failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Ensure working directory is correct so settings can load .env
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    main()
