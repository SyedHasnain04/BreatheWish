from anthropic import Anthropic
from app.config import settings
import json

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

def generate_prescription_draft(symptoms: dict, ml_result: dict, patient_age: int, patient_weight: float) -> str:
    """Generate a prescription draft using Claude based on symptoms and AI analysis."""
    if not settings.ANTHROPIC_API_KEY:
        return "Amoxicillin 500mg - 3x daily\nRest and fluids"

    prompt = f"""
    You are an AI assistant helping a pulmonologist draft a prescription and advice for a pneumonia case.
    
    Patient Info:
    Age: {patient_age}
    Weight: {patient_weight}kg
    Symptoms: {json.dumps(symptoms)}
    
    AI Analysis (DenseNet-121):
    Confidence: {ml_result['confidence']}%
    Severity: {ml_result['severity']}
    Type: {ml_result['type']}
    
    Draft a concise prescription and general advice. Do not output anything else.
    Format exactly as:
    Medications:
    - [medication 1]
    - [medication 2]
    
    General Advice:
    - [advice]
    
    Follow-up:
    - [follow-up recommendation]
    """

    try:
        model_name = getattr(settings, "ANTHROPIC_MODEL", None) or "claude-3-5-haiku-20241022"
        response = client.messages.create(
            model=model_name,
            max_tokens=300,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text
    except Exception as e:
        print(f"LLM Error: {e}")
        # Standard clinical template fallback
        return (
            "Medications:\n"
            "- Amoxicillin 500mg (1 capsule every 8 hours for 7 days)\n"
            "- Paracetamol 500mg (as needed for fever/discomfort)\n\n"
            "General Advice:\n"
            "Ensure adequate hydration and bed rest. Monitor temperature and pulse oximetry.\n\n"
            "Follow-up:\n"
            "Clinical reassessment in 48 to 72 hours, or sooner if symptoms worsen."
        )
