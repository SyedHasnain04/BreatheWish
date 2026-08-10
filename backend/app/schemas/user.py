from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    specializations: Optional[List[str]] = None
    date_of_birth: Optional[date] = None

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: str
    role: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
