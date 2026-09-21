from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional
from collections import defaultdict
import time
import threading
import secrets

from app.database import get_db
from app.config import settings
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, PatientLoginRequest, DoctorLoginRequest
from app.middleware.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

# Thread-safe in-memory sliding window rate limiter
_rate_limits = defaultdict(list)
_rate_limit_lock = threading.Lock()

def check_rate_limit(key: str, max_requests: int = 15, window_seconds: int = 60):
    now = time.time()
    with _rate_limit_lock:
        timestamps = _rate_limits[key]
        _rate_limits[key] = [t for t in timestamps if now - t < window_seconds]
        if len(_rate_limits[key]) >= max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Please wait a minute before trying again."
            )
        _rate_limits[key].append(now)

def generate_doctor_id(db: Session) -> str:
    alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    for _ in range(10):
        code = "BWD-" + "".join(secrets.choice(alphabet) for _ in range(6))
        if not db.query(User).filter(User.doctor_id == code).first():
            return code
    return f"BWD-{int(time.time())}"

@router.post("/register", response_model=UserResponse)
def register(
    user: UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")
):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"reg:{client_ip}", max_requests=10, window_seconds=60)

    target_role = (user.role or "patient").lower().strip()
    if target_role == "doctor":
        if not settings.ADMIN_SECRET_KEY or x_admin_key != settings.ADMIN_SECRET_KEY:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Doctor accounts cannot be registered publicly. An administrator key is required."
            )
        doc_id = user.doctor_id.upper().strip() if user.doctor_id else generate_doctor_id(db)
        if db.query(User).filter(User.doctor_id == doc_id).first():
            raise HTTPException(status_code=400, detail="Doctor ID already exists")

        db_user = User(
            doctor_id=doc_id,
            full_name=user.full_name.strip(),
            role="doctor",
            specializations=user.specializations,
            seniority_level=user.seniority_level or "consultant"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    # Patient registration
    username = (user.username or "").strip().lower()
    if not username:
        # Fallback to email if provided
        if user.email:
            username = user.email.split("@")[0].lower()
        else:
            raise HTTPException(status_code=400, detail="Username is required.")

    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters long.")

    if not user.password or len(user.password.strip()) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username is already taken. Please choose another.")

    if user.email and db.query(User).filter(User.email == user.email.lower().strip()).first():
        raise HTTPException(status_code=400, detail="Email is already registered.")

    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=username,
        email=user.email.lower().strip() if user.email else None,
        password_hash=hashed_password,
        full_name=user.full_name.strip(),
        role="patient",
        date_of_birth=user.date_of_birth
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
    """
    Unified OAuth2 login endpoint.
    Accepts:
    - Patients: username (or email) in form_data.username, password in form_data.password
    - Doctors: doctor_id in form_data.username (password can be blank or dummy)
    """
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"login:{client_ip}", max_requests=25, window_seconds=60)

    ident = form_data.username.strip()

    # 1. Check if identifier is a Doctor ID
    doctor = db.query(User).filter(User.doctor_id == ident.upper(), User.role == "doctor").first()
    if doctor:
        access_token = create_access_token(data={"sub": str(doctor.id), "role": "doctor", "id": str(doctor.id)})
        return {"access_token": access_token, "token_type": "bearer"}

    # 2. Check patient by username or email
    patient = db.query(User).filter(
        (User.username == ident.lower()) | (User.email == ident.lower())
    ).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, doctor ID, or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # If it's a doctor found by email
    if patient.role == "doctor":
        if patient.password_hash and form_data.password:
            if not verify_password(form_data.password, patient.password_hash):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
        access_token = create_access_token(data={"sub": str(patient.id), "role": "doctor", "id": str(patient.id)})
        return {"access_token": access_token, "token_type": "bearer"}

    # Patient password verification
    if not patient.password_hash or not verify_password(form_data.password, patient.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": str(patient.id), "role": "patient", "id": str(patient.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/patient", response_model=Token)
def login_patient(
    payload: PatientLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"login:{client_ip}", max_requests=25, window_seconds=60)

    ident = payload.username.strip().lower()
    user = db.query(User).filter(
        (User.username == ident) | (User.email == ident)
    ).first()

    if not user or not user.password_hash or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role, "id": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/doctor", response_model=Token)
def login_doctor(
    payload: DoctorLoginRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = request.client.host if request.client else "unknown"
    check_rate_limit(f"login:{client_ip}", max_requests=25, window_seconds=60)

    doc_id = payload.doctor_id.strip().upper()
    doctor = db.query(User).filter(User.doctor_id == doc_id, User.role == "doctor").first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Hospital ID card number")

    access_token = create_access_token(data={"sub": str(doctor.id), "role": "doctor", "id": str(doctor.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
