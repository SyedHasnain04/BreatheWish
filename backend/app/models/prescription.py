from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from app.database import Base

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    llm_draft = Column(JSONB, nullable=False)
    final_prescription = Column(JSONB, nullable=False)
    
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True))
    version = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
