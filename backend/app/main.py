from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database import engine, Base
from app.config import settings
from app.routes import auth, transactions, financial_score, recommendations, analytics, ml, notifications, investments, goals
from train import train_model
from app.services.score_calculator import predictor

# 1. Initialize Database Tables (Fallback if migrations haven't run)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Database table initialization failed (will retry on connection): {str(e)}")

app = FastAPI(
    title="AI Financial Health Score API",
    description="REST API powering the Financial Health evaluation platform",
    version="1.0.0"
)

# 2. CORS Middleware Configuration (Essential for frontend Vite server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Startup Event Hook
@app.on_event("startup")
def startup_event():
    # If the ML model is not generated yet, train it automatically on startup
    model_path = settings.ML_MODEL_PATH
    scaler_path = settings.ML_SCALER_PATH
    
    if not os.path.exists(model_path) or not os.path.exists(scaler_path):
        print("ML assets not found. Initiating auto-training on startup...")
        try:
            train_model()
            # Force reload the predictor
            predictor._load_assets()
        except Exception as e:
            print(f"Auto-training failed: {str(e)}")

# 4. Mount API Routes
app.include_router(auth.router, prefix="/api")
app.include_router(transactions.router, prefix="/api")
app.include_router(financial_score.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(ml.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(investments.router, prefix="/api")
app.include_router(goals.router, prefix="/api")

# 5. Core Health Check Endpoints
@app.get("/health", status_code=status.HTTP_200_OK, tags=["Health"])
def health_check():
    # Verify DB connection health
    db_ok = True
    try:
        connection = engine.connect()
        connection.close()
    except Exception:
        db_ok = False
        
    # Verify ML model status
    ml_ok = predictor.model is not None
    
    return {
        "status": "healthy" if (db_ok and ml_ok) else "degraded",
        "database_connected": db_ok,
        "ml_model_loaded": ml_ok
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to the AI Financial Health Score Platform API. Access documentation at /docs"
    }
