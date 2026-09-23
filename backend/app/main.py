from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import app.models  # Ensures all models are registered in metadata
from app.routers import auth, cases, prescriptions, second_opinion, consultations, notifications, follow_up
from app.database import SessionLocal, Base, engine
from app.scheduler import start_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables if they don't exist
    try:
        Base.metadata.create_all(bind=engine)
        from sqlalchemy import text
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);"))
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS doctor_id VARCHAR(20);"))
            conn.execute(text("ALTER TABLE users ALTER COLUMN email DROP NOT NULL;"))
            conn.execute(text("ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;"))
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username);"))
            conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_doctor_id ON users (doctor_id);"))
            conn.execute(text("UPDATE cases SET xray_url = 'https://res.cloudinary.com/act3ugiy/image/upload/v1790138908/breathewish/demo/demo_chest_xray.jpg' WHERE xray_url LIKE '%sample_xray.jpg%' OR xray_url LIKE '%1312461204/sample.jpg%';"))
            conn.execute(text("UPDATE cases SET gradcam_url = 'https://res.cloudinary.com/act3ugiy/image/upload/v1790138910/breathewish/demo/demo_chest_gradcam.png' WHERE gradcam_url LIKE '%sample_gradcam.jpg%' OR gradcam_url LIKE '%1312461204/sample.jpg%';"))
    except Exception as e:
        print(f"Database table initialization notice: {e}")

    # Seed initial test doctors & patients
    try:
        from seed import seed_db
        seed_db()
    except Exception as e:
        print(f"Seed startup notice: {e}")

    # Start scheduler
    scheduler = None
    try:
        scheduler = start_scheduler(SessionLocal)
    except Exception as e:
        print(f"Scheduler startup notice: {e}")

    yield

    # Shutdown
    if scheduler:
        try:
            scheduler.shutdown(wait=False)
        except Exception:
            pass

app = FastAPI(title="BreatheWish API", lifespan=lifespan)

# Flexible CORS configuration for development and production (Vercel)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True if origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cases.router)
app.include_router(prescriptions.router)
app.include_router(second_opinion.router)
app.include_router(consultations.router)
app.include_router(notifications.router)
app.include_router(follow_up.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to BreatheWish API", "status": "online"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "BreatheWish API"}
