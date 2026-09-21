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
    except Exception as e:
        print(f"Database table initialization notice: {e}")

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
