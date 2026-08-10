from sqlalchemy import Column, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.database import Base
from sqlalchemy.orm import relationship

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey("cases.id"))
    doctor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    scheduled_date = Column(Date, nullable=False)
    suggested_date = Column(Date)
    reason = Column(String)
    
    status = Column(String(20), default="scheduled")
    reminder_sent = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    case = relationship("Case")
