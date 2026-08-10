from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base

class SecondOpinion(Base):
    __tablename__ = "second_opinions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    requested_by = Column(String(10))
    requested_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    second_doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    specialty_requested = Column(String(50))
    reason = Column(String, nullable=False)
    verdict = Column(String(20))
    verdict_notes = Column(String)
    
    status = Column(String(20), default="pending")
    agrees_with_primary = Column(Boolean)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
