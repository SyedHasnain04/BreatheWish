import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.user import User
from app.middleware.auth import get_password_hash

def seed_db():
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).count() > 1: # > 1 because of the earlier test
        # Let's just delete all and re-seed to match prompt exactly
        db.query(User).delete()
        db.commit()

    users = [
        # Doctors (Pulmonology)
        User(full_name="Dr. Arun Mehta", email="arun@hospital.com", password_hash=get_password_hash("doctor123"), role="doctor", seniority_level="senior", specializations=["pulmonology"]),
        User(full_name="Dr. Priya Sharma", email="priya@hospital.com", password_hash=get_password_hash("doctor123"), role="doctor", seniority_level="consultant", specializations=["pulmonology"]),
        User(full_name="Dr. Vikram Nair", email="vikram@hospital.com", password_hash=get_password_hash("doctor123"), role="doctor", seniority_level="junior", specializations=["pulmonology"]),
        
        # Second opinion doctors
        User(full_name="Dr. Rajan Pillai", email="rajan@hospital.com", password_hash=get_password_hash("doctor123"), role="doctor", seniority_level="senior", specializations=["cardiology"]),
        User(full_name="Dr. Sunita Rao", email="sunita@hospital.com", password_hash=get_password_hash("doctor123"), role="doctor", seniority_level="senior", specializations=["radiology"]),
        
        # Patients
        User(full_name="Ravi Kumar", email="ravi@patient.com", password_hash=get_password_hash("patient123"), role="patient"),
        User(full_name="Priya Nair", email="priya@patient.com", password_hash=get_password_hash("patient123"), role="patient")
    ]
    
    db.add_all(users)
    db.commit()
    print("Seeding complete.")

if __name__ == "__main__":
    seed_db()
