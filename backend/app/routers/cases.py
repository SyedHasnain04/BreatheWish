from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
import json
import uuid

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.prescription import Prescription
from app.models.audit import AuditLog
from app.models.notification import Notification

from app.services.ml_service import run_inference
from app.services.cloudinary_service import upload_image
from app.services.doctor_assignment import assign_doctor
from app.services.llm_service import generate_prescription_draft

router = APIRouter(prefix="/cases", tags=["cases"])

@router.post("/test-inference")
async def test_inference(xray: UploadFile = File(...)) -> Dict[str, Any]:
    """Temporary endpoint to test the ML pipeline end-to-end."""
    try:
        image_bytes = await xray.read()
        ml_result = run_inference(image_bytes)
        gradcam_upload = upload_image(ml_result["gradcam_image"], folder="breathewish/gradcam")
        return {
            "confidence": ml_result["confidence"],
            "severity": ml_result["severity"],
            "type": ml_result["type"],
            "gradcam_url": gradcam_upload["url"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_case(
    xray: UploadFile = File(...),
    symptoms: str = Form(...),
    patient_email: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        symptoms_dict = json.loads(symptoms)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid symptoms JSON")

    # Determine patient
    target_patient_id = current_user.id
    if current_user.role == "doctor":
        if not patient_email:
            raise HTTPException(status_code=400, detail="Doctor must provide patient username or email")
        ident = patient_email.strip().lower()
        patient_user = db.query(User).filter(
            ((User.username == ident) | (User.email == ident)),
            User.role == "patient"
        ).first()
        if not patient_user:
            raise HTTPException(status_code=404, detail="Patient not found")
        target_patient_id = patient_user.id

    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
    ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".dcm"}
    
    # Check filename extension
    filename = (xray.filename or "").lower()
    has_valid_ext = any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)
    if not has_valid_ext:
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Only PNG, JPEG, and DICOM radiographs are accepted."
        )

    image_bytes = await xray.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds the 10 MB limit (received {len(image_bytes) / (1024*1024):.1f} MB)."
        )

    # 3. ML Inference
    ml_result = run_inference(image_bytes)
    
    # 4 & 5. Cloudinary Uploads
    xray_upload = upload_image(image_bytes, folder="breathewish/xrays")
    gradcam_upload = upload_image(ml_result["gradcam_image"], folder="breathewish/gradcam")
    
    # 6. Assign Doctor
    assigned_doc_id = assign_doctor(db, severity=ml_result["severity"])
    if not assigned_doc_id:
        raise HTTPException(status_code=503, detail="No doctor available to review this case.")
        
    # 8. LLM Draft
    draft_prescription = generate_prescription_draft(
        symptoms=symptoms_dict,
        ml_result=ml_result,
        patient_age=symptoms_dict.get("age", 30),
        patient_weight=symptoms_dict.get("weight", 70.0)
    )

    # 10. Create Case
    new_case = Case(
        patient_id=target_patient_id,
        primary_doctor_id=assigned_doc_id,
        initiated_by="doctor" if current_user.role == "doctor" else "patient",
        status="under_review",
        xray_url=xray_upload["url"],
        xray_public_id=xray_upload["public_id"],
        gradcam_url=gradcam_upload["url"],
        gradcam_public_id=gradcam_upload["public_id"],
        ai_confidence=ml_result["confidence"],
        ai_severity=ml_result["severity"],
        ai_type=ml_result["type"],
        ai_raw_output=ml_result["raw_output"],
        symptoms=symptoms_dict
    )
    db.add(new_case)
    db.flush()

    # 11. Create Prescription
    new_prescription = Prescription(
        case_id=new_case.id,
        doctor_id=assigned_doc_id,
        llm_draft={"draft": draft_prescription},
        final_prescription={"draft": draft_prescription},
        is_verified=False
    )
    db.add(new_prescription)

    # 13. Create Notification
    notif = Notification(
        user_id=assigned_doc_id,
        title="New Case Assigned",
        body=f"A new {ml_result['severity']} severity case requires your review.",
        type="new_case",
        entity_id=new_case.id
    )
    db.add(notif)

    # 14. Create Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        action="CREATE_CASE",
        entity_type="CASE",
        entity_id=new_case.id,
        metadata_={"severity": ml_result["severity"], "confidence": ml_result["confidence"]}
    )
    db.add(audit)
    
    db.commit()
    db.refresh(new_case)
    
    return {"message": "Case created successfully", "case_id": new_case.id}


@router.get("/patient/{patient_id}")
def get_patient_cases(patient_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "doctor" and str(current_user.id) != patient_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    cases = db.query(Case).filter(Case.patient_id == patient_id).order_by(Case.created_at.desc()).all()
    
    result = []
    for c in cases:
        # Filter AI fields for patients
        case_dict = {
            "id": c.id,
            "status": c.status,
            "created_at": c.created_at,
            "xray_url": c.xray_url,
            "symptoms": c.symptoms
        }
        if current_user.role == "doctor":
            case_dict.update({
                "ai_severity": c.ai_severity,
                "ai_confidence": c.ai_confidence
            })
        result.append(case_dict)
        
    return result


@router.get("/doctor/{doctor_id}")
def get_doctor_cases(
    doctor_id: str, 
    status_group: Optional[str] = Query(None),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "doctor" or str(current_user.id) != doctor_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    query = db.query(Case).filter(Case.primary_doctor_id == doctor_id)
    
    if status_group == "pending":
        query = query.filter(Case.status.in_(["uploaded", "under_review"]))
    elif status_group == "active":
        query = query.filter(Case.status.in_(["prescription_draft", "second_opinion_requested", "second_opinion_received"]))
    elif status_group == "closed":
        query = query.filter(Case.status.in_(["verified", "closed"]))
        
    cases = query.order_by(Case.created_at.desc()).all()
    return cases


@router.get("/{id}")
def get_case(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    if current_user.role == "patient" and case.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
        
    # Convert to dict
    case_dict = {
        "id": case.id,
        "patient_id": case.patient_id,
        "status": case.status,
        "xray_url": case.xray_url,
        "symptoms": case.symptoms,
        "created_at": case.created_at,
        "doctor_verdict": case.doctor_verdict,
        "doctor_notes": case.doctor_notes
    }
    
    # Filter AI fields
    if current_user.role == "doctor":
        case_dict.update({
            "gradcam_url": case.gradcam_url,
            "ai_confidence": case.ai_confidence,
            "ai_severity": case.ai_severity,
            "ai_type": case.ai_type,
            "ai_raw_output": case.ai_raw_output,
            "primary_doctor_id": str(case.primary_doctor_id) if case.primary_doctor_id else None,
        })
        
    return case_dict


@router.patch("/{id}")
def update_case_verdict(
    id: str,
    doctor_verdict: Optional[str] = None,
    doctor_severity: Optional[str] = None,
    doctor_type: Optional[str] = None,
    doctor_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can update verdict")

    case = db.query(Case).filter(Case.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case.primary_doctor_id and str(case.primary_doctor_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the assigned primary doctor can update this case verdict")

    if doctor_verdict is not None:
        case.doctor_verdict = doctor_verdict
    if doctor_severity is not None:
        case.doctor_severity = doctor_severity
    if doctor_type is not None:
        case.doctor_type = doctor_type
    if doctor_notes is not None:
        case.doctor_notes = doctor_notes

    db.commit()
    return {"message": "Verdict saved"}
