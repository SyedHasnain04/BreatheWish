from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import Optional

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.follow_up import FollowUp
from app.models.audit import AuditLog
from app.models.notification import Notification
from pydantic import BaseModel

router = APIRouter(prefix="/follow-up", tags=["follow-up"])


class FollowUpRequest(BaseModel):
    case_id: str
    scheduled_date: str  # ISO date string
    reason: Optional[str] = None


@router.post("/")
def create_follow_up(
    body: FollowUpRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can schedule follow-ups")

    case = db.query(Case).filter(Case.id == body.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Auto-suggest based on severity
    severity = case.ai_severity or "mild"
    if severity == "severe":
        suggested = date.today() + timedelta(days=3)
    else:
        suggested = date.today() + timedelta(days=7)

    scheduled = date.fromisoformat(body.scheduled_date)

    fu = FollowUp(
        case_id=body.case_id,
        doctor_id=current_user.id,
        scheduled_date=scheduled,
        suggested_date=suggested,
        reason=body.reason,
        status="scheduled"
    )
    db.add(fu)

    # Notify patient
    if case.patient_id:
        notif = Notification(
            user_id=case.patient_id,
            title="Follow-up Scheduled",
            body=f"Your follow-up has been scheduled for {scheduled.strftime('%d %B %Y')}.",
            type="follow_up",
            entity_id=case.id
        )
        db.add(notif)

    audit = AuditLog(
        user_id=current_user.id,
        action="SCHEDULE_FOLLOW_UP",
        entity_type="FOLLOW_UP",
        entity_id=fu.id
    )
    db.add(audit)
    db.commit()

    return {
        "id": fu.id,
        "scheduled_date": str(fu.scheduled_date),
        "suggested_date": str(fu.suggested_date),
        "reason": fu.reason,
        "status": fu.status
    }


@router.get("/{case_id}")
def get_follow_ups(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fus = db.query(FollowUp).filter(FollowUp.case_id == case_id).order_by(FollowUp.scheduled_date.asc()).all()
    return [
        {
            "id": fu.id,
            "scheduled_date": str(fu.scheduled_date),
            "suggested_date": str(fu.suggested_date) if fu.suggested_date else None,
            "reason": fu.reason,
            "status": fu.status,
            "reminder_sent": fu.reminder_sent
        }
        for fu in fus
    ]


@router.patch("/{id}")
def update_follow_up(
    id: str,
    body: FollowUpRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "doctor":
        raise HTTPException(status_code=403, detail="Only doctors can update follow-ups")

    fu = db.query(FollowUp).filter(FollowUp.id == id).first()
    if not fu:
        raise HTTPException(status_code=404, detail="Follow-up not found")

    fu.scheduled_date = date.fromisoformat(body.scheduled_date)
    if body.reason is not None:
        fu.reason = body.reason

    db.commit()
    return {"message": "Follow-up updated", "id": fu.id}
