from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Investment, User
from app.schemas import InvestmentCreate, InvestmentResponse
from app.auth import get_current_user

router = APIRouter(prefix="/investments", tags=["Investments"])

@router.post("", response_model=InvestmentResponse, status_code=status.HTTP_201_CREATED)
def create_investment(
    investment_in: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_inv = Investment(
        user_id=current_user.id,
        asset_class=investment_in.asset_class,
        invested_amount=investment_in.invested_amount,
        current_value=investment_in.current_value
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)
    return new_inv

@router.get("", response_model=List[InvestmentResponse])
def get_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Investment).filter(Investment.user_id == current_user.id).order_by(Investment.date.desc()).all()

@router.delete("/{inv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investment(
    inv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    inv = db.query(Investment).filter(
        Investment.id == inv_id,
        Investment.user_id == current_user.id
    ).first()
    
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Investment not found or unauthorized."
        )
        
    db.delete(inv)
    db.commit()
    return
