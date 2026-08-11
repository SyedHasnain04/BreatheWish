from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import auth, cases, prescriptions, second_opinion, consultations, notifications, follow_up
from app.database import SessionLocal
from app.scheduler import start_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start APScheduler on startup
    scheduler = start_scheduler(SessionLocal)
    yield
    # Shutdown
    scheduler.shutdown(wait=False)


app = FastAPI(title="Pneumonia Detection API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
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
    return {"message": "Welcome to BreatheWish API"}
