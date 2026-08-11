from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class SymptomsData(BaseModel):
    age: Optional[int] = None
    weight: Optional[float] = None
    sex: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    existing_conditions: Optional[List[str]] = None
    current_medications: Optional[str] = None
    fever: Optional[bool] = None
    fever_days: Optional[int] = None
    cough_type: Optional[str] = None
    breathing_difficulty: Optional[int] = None
    chest_pain: Optional[bool] = None
    symptom_duration_days: Optional[int] = None

class CaseResponse(BaseModel):
    id: UUID
    patient_id: UUID
    doctor_id: Optional[UUID] = None
    status: str
    severity: Optional[str] = None
    confidence_score: Optional[float] = None
    image_url: Optional[str] = None
    heat_map_url: Optional[str] = None
    findings: Optional[str] = None
    symptoms: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PrescriptionCreate(BaseModel):
    case_id: UUID
    medications: str
    instructions: str
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None

class PrescriptionResponse(BaseModel):
    id: UUID
    case_id: UUID
    doctor_id: UUID
    medications: str
    instructions: str
    follow_up_date: Optional[str] = None
    notes: Optional[str] = None
    is_visible_to_patient: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SecondOpinionRequest(BaseModel):
    case_id: UUID
    reason: Optional[str] = None

class SecondOpinionResponse(BaseModel):
    id: UUID
    case_id: UUID
    requesting_doctor_id: UUID
    responding_doctor_id: Optional[UUID] = None
    status: str
    opinion: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
