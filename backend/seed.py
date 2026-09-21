import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.middleware.auth import get_password_hash
from sqlalchemy import text

def seed_db():
    # Ensure tables exist and schema is up-to-date
    try:
        Base.metadata.create_all(bind=engine)
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(20);"))
            conn.execute(text("ALTER TABLE users ALTER COLUMN email DROP NOT NULL;"))
            conn.execute(text("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;"))
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username);"))
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_doctor_id ON users (doctor_id);"))
    except Exception as e:
        print(f"Schema migration in seed notice: {e}")

    db = SessionLocal()
    try:
        users = [
            # Primary Pulmonologists
            {
                "full_name": "Dr. Arun Mehta",
                "doctor_id": "BWD-ARUN01",
                "email": "arun@hospital.com",
                "password": None,
                "role": "doctor",
                "seniority_level": "senior",
                "specializations": ["pulmonology"]
            },
            {
                "full_name": "Dr. Priya Sharma",
                "doctor_id": "BWD-PRIYA1",
                "email": "priya@hospital.com",
                "password": None,
                "role": "doctor",
                "seniority_level": "consultant",
                "specializations": ["pulmonology"]
            },
            {
                "full_name": "Dr. Vikram Nair",
                "doctor_id": "BWD-VIKR01",
                "email": "vikram@hospital.com",
                "password": None,
                "role": "doctor",
                "seniority_level": "junior",
                "specializations": ["pulmonology"]
            },
            # Second Opinion Specialists
            {
                "full_name": "Dr. Rajan Pillai",
                "doctor_id": "BWD-RAJA01",
                "email": "rajan@hospital.com",
                "password": None,
                "role": "doctor",
                "seniority_level": "senior",
                "specializations": ["cardiology"]
            },
            {
                "full_name": "Dr. Sunita Rao",
                "doctor_id": "BWD-SUNI01",
                "email": "sunita@hospital.com",
                "password": None,
                "role": "doctor",
                "seniority_level": "senior",
                "specializations": ["radiology"]
            },
            # Demo Patients
            {
                "full_name": "Ravi Kumar",
                "username": "ravi_kumar",
                "doctor_id": None,
                "email": "ravi@patient.com",
                "password": "patient123",
                "role": "patient",
                "seniority_level": None,
                "specializations": None
            },
            {
                "full_name": "Priya Nair",
                "username": "priya_nair",
                "doctor_id": None,
                "email": "priya@patient.com",
                "password": "patient123",
                "role": "patient",
                "seniority_level": None,
                "specializations": None
            }
        ]

        for u in users:
            # Look up by doctor_id, username, or email
            existing = None
            if u.get("doctor_id"):
                existing = db.query(User).filter(User.doctor_id == u["doctor_id"]).first()
            if not existing and u.get("username"):
                existing = db.query(User).filter(User.username == u["username"]).first()
            if not existing and u.get("email"):
                existing = db.query(User).filter(User.email == u["email"]).first()

            pw_hash = get_password_hash(u["password"]) if u.get("password") else None

            if not existing:
                new_user = User(
                    full_name=u["full_name"],
                    doctor_id=u.get("doctor_id"),
                    username=u.get("username"),
                    email=u.get("email"),
                    password_hash=pw_hash,
                    role=u["role"],
                    seniority_level=u["seniority_level"],
                    specializations=u["specializations"]
                )
                db.add(new_user)
            else:
                existing.full_name = u["full_name"]
                existing.doctor_id = u.get("doctor_id") or existing.doctor_id
                existing.username = u.get("username") or existing.username
                existing.email = u.get("email") or existing.email
                if pw_hash:
                    existing.password_hash = pw_hash
                existing.role = u["role"]
                existing.seniority_level = u["seniority_level"]
                existing.specializations = u["specializations"]

        db.commit()
        print("Database user seeding complete (idempotent).")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
