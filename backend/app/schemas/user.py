from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date
from uuid import UUID

class UserCreate(BaseModel):
    username: Optional[str] = None
    doctor_id: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, description="Password must be at least 8 characters long")
    full_name: str
    role: str = "patient"
    specializations: Optional[List[str]] = None
    seniority_level: Optional[str] = None
    date_of_birth: Optional[date] = None

class PatientRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_.-]+$")
    password: str = Field(..., min_length=8)
    full_name: str
    date_of_birth: Optional[date] = None

class DoctorLoginRequest(BaseModel):
    doctor_id: str = Field(..., min_length=3, max_length=30)

class PatientLoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: UUID
    username: Optional[str] = None
    doctor_id: Optional[str] = None
    email: Optional[str] = None
    full_name: str
    role: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
