from sqlalchemy.orm import Session
from app.models.user import User
import random

def assign_doctor(db: Session, severity: str) -> str:
    """Assign a doctor based on availability. Simple random assignment for now."""
    doctors = db.query(User).filter(User.role == "doctor").all()
    if not doctors:
        return None
    
    # In a real system, we'd route 'severe' cases to senior pulmonologists.
    # For now, just pick a random available doctor.
    assigned = random.choice(doctors)
    return str(assigned.id)

def assign_second_opinion_doctor(db: Session, exclude_doctor_id: str) -> str:
    """Assign a different doctor for a second opinion."""
    doctors = db.query(User).filter(
        User.role == "doctor", 
        User.id != exclude_doctor_id
    ).all()
    
    if not doctors:
        return None
        
    return str(random.choice(doctors).id)
