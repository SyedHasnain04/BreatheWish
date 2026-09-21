from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.consultation import ConsultationMessage
from app.models.notification import Notification
from app.models.case import Case
from pydantic import BaseModel

router = APIRouter(prefix="/consultations", tags=["consultations"])

class MessageRequest(BaseModel):
    case_id: str
    message: str


@router.post("/")
def send_message(
    body: MessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(Case).filter(Case.id == body.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    msg = ConsultationMessage(
        case_id=body.case_id,
        sender_id=current_user.id,
        sender_role=current_user.role,
        message=body.message
    )
    db.add(msg)

    # Notify the other party
    if current_user.role == "patient":
        recipient_id = case.primary_doctor_id
        notif_title = "New message from patient"
    else:
        recipient_id = case.patient_id
        notif_title = "New message from your doctor"

    if recipient_id:
        notif = Notification(
            user_id=recipient_id,
            title=notif_title,
            body=body.message[:100],
            type="consultation",
            entity_id=case.id
        )
        db.add(notif)

    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "message": msg.message,
        "sender_role": msg.sender_role,
        "sender_name": current_user.full_name,
        "created_at": msg.created_at,
        "is_read": msg.is_read
    }


@router.get("/{case_id}")
def get_messages(case_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    messages = (
        db.query(ConsultationMessage)
        .filter(ConsultationMessage.case_id == case_id)
        .order_by(ConsultationMessage.created_at.asc())
        .all()
    )

    result = []
    for m in messages:
        sender = db.query(User).filter(User.id == m.sender_id).first()
        result.append({
            "id": m.id,
            "message": m.message,
            "sender_role": m.sender_role,
            "sender_name": sender.full_name if sender else None,
            "created_at": m.created_at,
            "is_read": m.is_read
        })

    return result


@router.patch("/{id}/read")
def mark_read(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    msg = db.query(ConsultationMessage).filter(ConsultationMessage.id == id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    return {"message": "Marked as read"}
