from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from collections import defaultdict
import time
import threading

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token
from app.middleware.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

# Thread-safe in-memory sliding window rate limiter
_rate_limits = defaultdict(list)
_rate_limit_lock = threading.Lock()

def check_rate_limit(key: str, max_requests: int = 15, window_seconds: int = 60):
    now = time.time()
    with _rate_limit_lock:
        timestamps = _rate_limits[key]
        # Purge entries older than window
        _rate_limits[key] = [t for t in timestamps if now - t < window_seconds]
        if len(_rate_limits[key]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Please wait a minute before trying again."
            )
        _rate_limits[key].append(now)

@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")
):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"reg:{client_ip}", max_requests=10, window_seconds=60)

    # Validate password length
    if len(user.password.strip()) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    # Close doctor sign-up server-side: doctor accounts require valid admin key
    target_role = (user.role or "patient").lower().strip()
    if target_role == "doctor":
        if not settings.ADMIN_SECRET_KEY or x_admin_key != settings.ADMIN_SECRET_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Doctor accounts cannot be registered publicly. An administrator key is required."
            )
    else:
        target_role = "patient"

    db_user = db.query(User).filter(User.email == user.email.lower().strip()).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email.lower().strip(),
        password_hash=hashed_password,
        full_name=user.full_name.strip(),
        role=target_role,
        specializations=user.specializations if target_role == "doctor" else None,
        date_of_birth=user.date_of_birth if target_role == "patient" else None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"login:{client_ip}", max_requests=15, window_seconds=60)

    user = db.query(User).filter(User.email == form_data.username.lower().strip()).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.email, "role": user.role, "id": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
