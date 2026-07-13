from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Recommendation, User
from app.schemas import RecommendationResponse
from app.auth import get_current_user
from app.services.recommendation_engine import generate_financial_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    recs = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id,
        Recommendation.resolved == False
    ).order_by(Recommendation.impact.desc()).all()
    
    # If no recommendations currently generated (e.g. first run), trigger calculation
    if not recs:
        recs = generate_financial_recommendations(db, current_user.id)
        
    return recs

@router.post("/{rec_id}/resolve", response_model=RecommendationResponse)
def resolve_recommendation(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(Recommendation).filter(
        Recommendation.id == rec_id,
        Recommendation.user_id == current_user.id
    ).first()
    
    if not rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found or unauthorized."
        )
        
    rec.resolved = True
    db.commit()
    db.refresh(rec)
    return rec
