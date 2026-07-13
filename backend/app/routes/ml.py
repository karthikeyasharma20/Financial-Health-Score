from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.models import User
from app.schemas import PredictRequest, PredictResponse
from app.auth import get_current_admin
from app.services.score_calculator import predictor
from train import train_model

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.post("/predict", response_model=PredictResponse, status_code=status.HTTP_200_OK)
def predict_score(payload: PredictRequest):
    # If savings rate is not supplied, compute it
    features = payload.dict()
    if features.get('savings_rate') is None:
        inc = features.get('income', 0.0)
        exp = features.get('monthly_expenses', 0.0)
        features['savings_rate'] = (inc - exp) / inc if inc > 0 else 0.0
        
    score = predictor.predict(features)
    
    # Calculate grade rating label
    if score >= 800:
        rating = "Excellent"
    elif score >= 700:
        rating = "Good"
    elif score >= 550:
        rating = "Fair"
    else:
        rating = "Needs Attention"
        
    # Return features inside response
    payload.savings_rate = features['savings_rate']
    return {
        "score": score,
        "rating": rating,
        "features_received": payload
    }

def background_train():
    try:
        # Run XGBoost training script logic
        train_model()
        # Reload predictor model assets
        predictor._load_assets()
        print("Background retraining complete and assets reloaded.")
    except Exception as e:
        print(f"Background retraining failed: {str(e)}")

@router.post("/train-model", status_code=status.HTTP_202_ACCEPTED)
def retrain_xgboost_model(
    background_tasks: BackgroundTasks,
    current_admin: User = Depends(get_current_admin)
):
    """
    Trigger manual model retraining. Restricts access to Admin roles.
    Executes in a background thread to prevent API request timeout.
    """
    background_tasks.add_task(background_train)
    return {"status": "retraining", "message": "Model training process queued in background."}

@router.get("/feature-importance")
def get_ml_feature_importance():
    importances = predictor.get_feature_importances()
    
    # Format for chart display: List of Dicts sorted by importance
    formatted_importances = [
        {"feature": feat, "importance": round(val, 4)}
        for feat, val in sorted(importances.items(), key=lambda x: x[1], reverse=True)
    ]
    return formatted_importances
