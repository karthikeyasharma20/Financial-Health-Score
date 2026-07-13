import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./financial_health.db")
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "supersecretkeythatshouldbechangedinproduction1234567890")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Path inside Docker or relative local paths
    ML_MODEL_PATH: str = os.getenv("ML_MODEL_PATH", "../ml-model/model.pkl")
    ML_SCALER_PATH: str = os.getenv("ML_SCALER_PATH", "../ml-model/scaler.pkl")

    class Config:
        env_file = ".env"

settings = Settings()
