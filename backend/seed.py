import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.middleware.auth import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        users = [
            # Primary Pulmonologists
            {
                "full_name": "Dr. Arun Mehta",
                "email": "arun@hospital.com",
                "password": "doctor123",
                "role": "doctor",
                "seniority_level": "senior",
                "specializations": ["pulmonology"]
            },
            {
                "full_name": "Dr. Priya Sharma",
                "email": "priya@hospital.com",
                "password": "doctor123",
                "role": "doctor",
                "seniority_level": "consultant",
                "specializations": ["pulmonology"]
            },
            {
                "full_name": "Dr. Vikram Nair",
                "email": "vikram@hospital.com",
                "password": "doctor123",
                "role": "doctor",
                "seniority_level": "junior",
                "specializations": ["pulmonology"]
            },
            # Second Opinion Specialists
            {
                "full_name": "Dr. Rajan Pillai",
                "email": "rajan@hospital.com",
                "password": "doctor123",
                "role": "doctor",
                "seniority_level": "senior",
                "specializations": ["cardiology"]
            },
            {
                "full_name": "Dr. Sunita Rao",
                "email": "sunita@hospital.com",
                "password": "doctor123",
                "role": "doctor",
                "seniority_level": "senior",
                "specializations": ["radiology"]
            },
            # Demo Patients
            {
                "full_name": "Ravi Kumar",
                "email": "ravi@patient.com",
                "password": "patient123",
                "role": "patient",
                "seniority_level": None,
                "specializations": None
            },
            {
                "full_name": "Priya Nair",
                "email": "priya@patient.com",
                "password": "patient123",
                "role": "patient",
                "seniority_level": None,
                "specializations": None
            }
        ]

        for u in users:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_user = User(
                    full_name=u["full_name"],
                    email=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    seniority_level=u["seniority_level"],
                    specializations=u["specializations"]
                )
                db.add(new_user)
            else:
                # Update password and details
                existing.full_name = u["full_name"]
                existing.password_hash = get_password_hash(u["password"])
                existing.role = u["role"]
                existing.seniority_level = u["seniority_level"]
                existing.specializations = u["specializations"]

        db.commit()
        print("Database user seeding complete (idempotent).")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
