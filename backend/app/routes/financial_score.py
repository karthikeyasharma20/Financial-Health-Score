from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime

from app.database import get_db
from app.models import User, FinancialScore
from app.schemas import FinancialScoreResponse
from app.auth import get_current_user
from app.services.score_calculator import get_or_calculate_score
from app.services.pdf_report import generate_financial_pdf_report

router = APIRouter(prefix="/financial-score", tags=["Financial Health Score"])

@router.get("", response_model=FinancialScoreResponse)
def get_current_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    score = get_or_calculate_score(db, current_user.id)
    return score

@router.post("/recalculate", response_model=FinancialScoreResponse)
def force_recalculate_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    score = get_or_calculate_score(db, current_user.id, force_recalculate=True)
    return score

@router.get("/history", response_model=List[FinancialScoreResponse])
def get_score_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    history = db.query(FinancialScore).filter(
        FinancialScore.user_id == current_user.id
    ).order_by(FinancialScore.created_at.asc()).all()
    return history

@router.get("/report", status_code=status.HTTP_200_OK)
def download_pdf_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure a fresh score exists
    get_or_calculate_score(db, current_user.id, force_recalculate=True)
    
    # Generate report bytes
    pdf_buffer = generate_financial_pdf_report(db, current_user.id)
    
    response = StreamingResponse(
        pdf_buffer,
        media_type="application/pdf"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=financial_report_{current_user.id}.pdf"
    return response
