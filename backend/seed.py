import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, Base, engine
from app.models.user import User
from app.models.case import Case
from app.models.prescription import Prescription
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

        # ── Seed demo cases so dashboards are not empty ──────────────
        _seed_demo_cases(db)

    finally:
        db.close()


def _seed_demo_cases(db):
    """Create a handful of demo cases so the doctor/patient dashboards show data."""
    # Skip if cases already exist
    if db.query(Case).first() is not None:
        print("Demo cases already present – skipping case seeding.")
        return

    # Look up user IDs
    ravi = db.query(User).filter(User.username == "ravi_kumar").first()
    priya_p = db.query(User).filter(User.username == "priya_nair").first()
    dr_arun = db.query(User).filter(User.doctor_id == "BWD-ARUN01").first()
    dr_vikram = db.query(User).filter(User.doctor_id == "BWD-VIKR01").first()

    if not ravi or not dr_arun:
        print("Required seed users not found – skipping case seeding.")
        return

    # Placeholder image URLs (Cloudinary demo X-ray images)
    placeholder_xray = "https://res.cloudinary.com/demo/image/upload/v1/sample_xray.jpg"
    placeholder_gradcam = "https://res.cloudinary.com/demo/image/upload/v1/sample_gradcam.jpg"

    demo_cases = [
        # ── Ravi Kumar's cases (visible in patient dashboard) ──
        {
            "patient_id": ravi.id,
            "primary_doctor_id": dr_arun.id,
            "initiated_by": "patient",
            "status": "under_review",
            "xray_url": placeholder_xray,
            "xray_public_id": "demo/xray_ravi_1",
            "gradcam_url": placeholder_gradcam,
            "gradcam_public_id": "demo/gradcam_ravi_1",
            "ai_confidence": 87.5,
            "ai_severity": "moderate",
            "ai_type": "bacterial",
            "ai_raw_output": {"prediction": "PNEUMONIA", "confidence": 0.875},
            "symptoms": {
                "age": 34, "weight": 72, "sex": "male",
                "existing_conditions": ["None"],
                "fever": True, "fever_days": 3,
                "cough_type": "Wet", "breathing_difficulty": 3,
                "chest_pain": False, "symptom_duration_days": 5
            },
        },
        {
            "patient_id": ravi.id,
            "primary_doctor_id": dr_arun.id,
            "initiated_by": "patient",
            "status": "verified",
            "xray_url": placeholder_xray,
            "xray_public_id": "demo/xray_ravi_2",
            "gradcam_url": placeholder_gradcam,
            "gradcam_public_id": "demo/gradcam_ravi_2",
            "ai_confidence": 42.1,
            "ai_severity": "mild",
            "ai_type": "viral",
            "ai_raw_output": {"prediction": "PNEUMONIA", "confidence": 0.421},
            "doctor_verdict": "confirmed",
            "doctor_notes": "Mild viral pneumonia. Rest and hydration recommended.",
            "symptoms": {
                "age": 34, "weight": 72, "sex": "male",
                "existing_conditions": [],
                "fever": True, "fever_days": 1,
                "cough_type": "Dry", "breathing_difficulty": 2,
                "chest_pain": False, "symptom_duration_days": 3
            },
        },
        {
            "patient_id": ravi.id,
            "primary_doctor_id": dr_vikram.id if dr_vikram else dr_arun.id,
            "initiated_by": "patient",
            "status": "uploaded",
            "xray_url": placeholder_xray,
            "xray_public_id": "demo/xray_ravi_3",
            "gradcam_url": placeholder_gradcam,
            "gradcam_public_id": "demo/gradcam_ravi_3",
            "ai_confidence": 94.8,
            "ai_severity": "severe",
            "ai_type": "bacterial",
            "ai_raw_output": {"prediction": "PNEUMONIA", "confidence": 0.948},
            "symptoms": {
                "age": 34, "weight": 72, "sex": "male",
                "existing_conditions": ["Diabetes"],
                "fever": True, "fever_days": 6,
                "cough_type": "Bloody", "breathing_difficulty": 5,
                "chest_pain": True, "symptom_duration_days": 7
            },
        },
    ]

    # Add Priya's case if she exists
    if priya_p:
        demo_cases.append({
            "patient_id": priya_p.id,
            "primary_doctor_id": dr_arun.id,
            "initiated_by": "patient",
            "status": "under_review",
            "xray_url": placeholder_xray,
            "xray_public_id": "demo/xray_priya_1",
            "gradcam_url": placeholder_gradcam,
            "gradcam_public_id": "demo/gradcam_priya_1",
            "ai_confidence": 65.3,
            "ai_severity": "moderate",
            "ai_type": "viral",
            "ai_raw_output": {"prediction": "PNEUMONIA", "confidence": 0.653},
            "symptoms": {
                "age": 28, "weight": 58, "sex": "female",
                "existing_conditions": ["Asthma"],
                "fever": True, "fever_days": 2,
                "cough_type": "Dry", "breathing_difficulty": 3,
                "chest_pain": False, "symptom_duration_days": 4
            },
        })

    for c_data in demo_cases:
        case = Case(**c_data)
        db.add(case)

    db.flush()

    # Create prescriptions for the verified case and under_review cases
    all_cases = db.query(Case).all()
    for case in all_cases:
        existing_rx = db.query(Prescription).filter(Prescription.case_id == case.id).first()
        if existing_rx:
            continue

        if case.status == "verified":
            rx = Prescription(
                case_id=case.id,
                doctor_id=case.primary_doctor_id,
                llm_draft={
                    "draft": "Amoxicillin 500mg TDS x 7 days. Paracetamol 500mg SOS for fever. Adequate hydration. Follow up in 5 days.",
                    "is_first_visit": True,
                },
                final_prescription={
                    "draft": "Amoxicillin 500mg TDS x 7 days. Paracetamol 500mg SOS for fever. Chest physiotherapy. Follow up in 5 days.",
                    "is_first_visit": True,
                },
                is_verified=True,
            )
            db.add(rx)
        else:
            rx = Prescription(
                case_id=case.id,
                doctor_id=case.primary_doctor_id,
                llm_draft={
                    "draft": "Pending physician review. AI-generated draft will be available after evaluation.",
                    "is_first_visit": True,
                },
                final_prescription={
                    "draft": "Pending physician review.",
                    "is_first_visit": True,
                },
                is_verified=False,
            )
            db.add(rx)

    db.commit()
    print(f"Seeded {len(demo_cases)} demo cases with prescriptions.")


if __name__ == "__main__":
    seed_db()

