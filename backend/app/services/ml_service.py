import torch
import torch.nn.functional as F
from app.ml.model import load_model, PneumoniaModel
from app.ml.preprocess import preprocess_image
from app.ml.gradcam import generate_gradcam

# Singleton model instance
_model: PneumoniaModel = None

def get_model() -> PneumoniaModel:
    global _model
    if _model is None:
        _model = load_model()
    return _model

def classify_severity(confidence: float) -> str:
    if confidence >= 80:
        return "severe"
    elif confidence >= 50:
        return "moderate"
    elif confidence >= 20:
        return "mild"
    return "none"

def classify_type(confidence: float) -> str:
    if confidence >= 75:
        return "bacterial"
    elif confidence >= 20:
        return "viral"
    return "none"

def run_inference(image_bytes: bytes) -> dict:
    """Run full inference pipeline: preprocess -> model -> confidence -> gradcam."""
    model = get_model()
    input_tensor = preprocess_image(image_bytes)

    with torch.no_grad():
        output = model(input_tensor)
        probabilities = F.softmax(output, dim=1)
        confidence = probabilities[0][1].item() * 100  # class 1 = pneumonia

    severity = classify_severity(confidence)
    pneumonia_type = classify_type(confidence)

    # Generate Grad-CAM
    gradcam_bytes = generate_gradcam(model, input_tensor, image_bytes)

    return {
        "confidence": round(confidence, 2),
        "severity": severity,
        "type": pneumonia_type,
        "gradcam_image": gradcam_bytes,
        "raw_output": output.tolist(),
    }
