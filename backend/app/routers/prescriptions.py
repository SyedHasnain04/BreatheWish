from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime
import json
import uuid

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.prescription import Prescription
from app.models.audit import AuditLog
from app.models.notification import Notification

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

@router.get("/{case_id}")
def get_prescription(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rx = db.query(Prescription).filter(Prescription.case_id == case_id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role == "patient":
        if case.patient_id != current_user.id:
            raise HTTPException(status_code=403, detail="Unauthorized")
        if not rx.is_verified:
            raise HTTPException(status_code=404, detail="Prescription not finalized yet")
            
    elif current_user.role == "doctor":
        # Doctors can view any prescription, but ideally we should restrict to assigned doctors.
        pass
        
    return {
        "id": rx.id,
        "case_id": rx.case_id,
        "is_verified": rx.is_verified,
        "verified_at": rx.verified_at,
        "llm_draft": rx.llm_draft,
        "final_prescription": rx.final_prescription,
        "version": rx.version
    }


@router.patch("/{id}")
def update_prescription(
    id: str, 
    final_prescription: dict = Body(..., embed=True),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can edit prescriptions")
        
    rx = db.query(Prescription).filter(Prescription.id == id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    if rx.is_verified:
        raise HTTPException(status_code=400, detail="Cannot edit a verified prescription")

    rx.final_prescription = final_prescription
    rx.version += 1
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_PRESCRIPTION_DRAFT",
        entity_type="PRESCRIPTION",
        entity_id=rx.id,
    )
    db.add(audit)
    db.commit()
    
    return {"message": "Prescription updated", "id": rx.id}


@router.post("/{id}/verify")
def verify_prescription(
    id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can verify prescriptions")
        
    rx = db.query(Prescription).filter(Prescription.id == id).first()
    if not rx:
        raise HTTPException(status_code=404, detail="Prescription not found")
        
    if rx.is_verified:
        return {"message": "Already verified", "id": rx.id}
        
    case = db.query(Case).filter(Case.id == rx.case_id).first()
    
    rx.is_verified = True
    rx.verified_at = datetime.utcnow()
    case.status = "verified"
    
    # Notification
    notif = Notification(
        user_id=case.patient_id,
        title="Prescription Ready",
        body=f"Your prescription has been verified by {current_user.full_name}.",
        type="prescription_ready",
        entity_id=case.id
    )
    db.add(notif)
    
    # Audit
    audit = AuditLog(
        user_id=current_user.id,
        action="VERIFY_PRESCRIPTION",
        entity_type="PRESCRIPTION",
        entity_id=rx.id,
    )
    db.add(audit)
    
    db.commit()
    
    return {"message": "Prescription verified successfully", "id": rx.id}
