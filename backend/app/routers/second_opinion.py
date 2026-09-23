from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.second_opinion import SecondOpinion
from app.models.audit import AuditLog
from app.models.notification import Notification
from app.services.doctor_assignment import assign_second_opinion_doctor
from pydantic import BaseModel

router = APIRouter(prefix="/second-opinion", tags=["second-opinion"])

class SecondOpinionRequest(BaseModel):
    case_id: str
    requested_by: str  # "patient" or "doctor"
    reason: str
    specialty_requested: Optional[str] = None

class VerdictRequest(BaseModel):
    verdict: str
    verdict_notes: Optional[str] = None
    agrees_with_primary: bool


@router.post("")
@router.post("/")
def request_second_opinion(
    body: SecondOpinionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only one second opinion per case
    existing = db.query(SecondOpinion).filter(SecondOpinion.case_id == body.case_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Second opinion already requested for this case")

    case = db.query(Case).filter(Case.id == body.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Assign second doctor
    second_doc_id = assign_second_opinion_doctor(db, exclude_doctor_id=str(case.primary_doctor_id))
    if not second_doc_id:
        raise HTTPException(status_code=503, detail="No second doctor available")

    so = SecondOpinion(
        case_id=body.case_id,
        requested_by=body.requested_by,
        requested_by_id=current_user.id,
        second_doctor_id=second_doc_id,
        specialty_requested=body.specialty_requested,
        reason=body.reason,
        status="pending"
    )
    db.add(so)

    # Update case status
    case.status = "second_opinion_requested"

    # Notify second doctor
    notif = Notification(
        user_id=second_doc_id,
        title="Second Opinion Requested",
        body=f"A second opinion has been requested for a {case.ai_severity or ''} case.",
        type="second_opinion",
        entity_id=case.id
    )
    db.add(notif)

    audit = AuditLog(
        user_id=current_user.id,
        action="REQUEST_SECOND_OPINION",
        entity_type="SECOND_OPINION",
        entity_id=so.id,
    )
    db.add(audit)
    db.commit()

    return {"message": "Second opinion requested", "id": so.id, "second_doctor_id": second_doc_id}


@router.get("/{case_id}")
def get_second_opinion(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    so = db.query(SecondOpinion).filter(SecondOpinion.case_id == case_id).first()
    if not so:
        return None
    return {
        "id": so.id,
        "status": so.status,
        "agrees_with_primary": so.agrees_with_primary,
        "verdict": so.verdict,
        "verdict_notes": so.verdict_notes,
        "reason": so.reason,
    }


@router.patch("/{id}/verdict")
def submit_verdict(
    id: str,
    body: VerdictRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    so = db.query(SecondOpinion).filter(SecondOpinion.id == id).first()
    if not so:
        raise HTTPException(status_code=404, detail="Second opinion not found")

    # Only the assigned second doctor
    if str(so.second_doctor_id) != str(current_user.id):
        raise HTTPException(status_code=403, detail="Only the assigned second doctor can submit verdict")

    so.verdict = body.verdict
    so.verdict_notes = body.verdict_notes
    so.agrees_with_primary = body.agrees_with_primary
    so.status = "submitted"

    case = db.query(Case).filter(Case.id == so.case_id).first()
    if case:
        case.status = "second_opinion_received"

        # Notify primary doctor
        if case.primary_doctor_id:
            notif1 = Notification(
                user_id=case.primary_doctor_id,
                title="Second Opinion Received",
                body=f"Second opinion from Dr. {current_user.full_name} received.",
                type="second_opinion_received",
                entity_id=case.id
            )
            db.add(notif1)

        # Notify patient
        if case.patient_id:
            agreement = "agrees with" if body.agrees_with_primary else "differs from"
            notif2 = Notification(
                user_id=case.patient_id,
                title="Second Opinion Reviewed",
                body=f"The second opinion {agreement} your primary doctor's assessment.",
                type="second_opinion_received",
                entity_id=case.id
            )
            db.add(notif2)

    audit = AuditLog(
        user_id=current_user.id,
        action="SUBMIT_SECOND_OPINION_VERDICT",
        entity_type="SECOND_OPINION",
        entity_id=so.id,
    )
    db.add(audit)
    db.commit()

    return {"message": "Verdict submitted", "id": so.id}
