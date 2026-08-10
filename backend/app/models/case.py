from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from app.database import Base
from sqlalchemy.orm import relationship

class Case(Base):
    __tablename__ = "cases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    primary_doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    initiated_by = Column(String(10))
    status = Column(String(30), nullable=False, default="uploaded")
    
    xray_url = Column(String(500), nullable=False)
    xray_public_id = Column(String(255), nullable=False)
    gradcam_url = Column(String(500))
    gradcam_public_id = Column(String(255))
    
    ai_confidence = Column(Numeric(5, 2))
    ai_severity = Column(String(10))
    ai_type = Column(String(10))
    ai_raw_output = Column(JSONB)
    
    doctor_verdict = Column(String(20))
    doctor_severity = Column(String(10))
    doctor_type = Column(String(10))
    doctor_notes = Column(String)
    verified_at = Column(DateTime(timezone=True))
    
    symptoms = Column(JSONB, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    patient = relationship("User", foreign_keys=[patient_id])
    primary_doctor = relationship("User", foreign_keys=[primary_doctor_id])
