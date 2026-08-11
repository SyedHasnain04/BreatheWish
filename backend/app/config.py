from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/pneumonia_db"
    REDIS_URL: str = "redis://localhost:6379"
    JWT_SECRET: str = "your-jwt-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    ANTHROPIC_API_KEY: str = ""
    RESEND_API_KEY: str = ""
    ML_MODEL_PATH: str = "app/ml/weights/densenet121_chexnet.pth"
    ML_WEIGHTS_PATH: str = "app/ml/weights"

    class Config:
        env_file = "../.env"
        extra = "ignore"

settings = Settings()
