from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import List

from app.database import get_db
from app.models import Goal, User, Notification
from app.schemas import GoalCreate, GoalResponse
from app.auth import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.post("", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    goal_in: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_goal = Goal(
        user_id=current_user.id,
        name=goal_in.name,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount or Decimal(0.0),
        target_date=goal_in.target_date,
        status="in_progress"
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.get("", response_model=List[GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Goal).filter(Goal.user_id == current_user.id).order_by(Goal.target_date.asc()).all()

@router.post("/{goal_id}/add-money", response_model=GoalResponse)
def add_money_to_goal(
    goal_id: int,
    amount: Decimal,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or unauthorized."
        )
        
    goal.current_amount += amount
    
    # Check if target is achieved
    if goal.current_amount >= goal.target_amount:
        goal.status = "completed"
        
        # Trigger completed alert notification
        notif = Notification(
            user_id=current_user.id,
            title="Goal Accomplished! 🏆",
            message=f"Outstanding! You've achieved your target of ${goal.target_amount:.2f} for your '{goal.name}' goal!",
            is_read=False
        )
        db.add(notif)
        
    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found or unauthorized."
        )
        
    db.delete(goal)
    db.commit()
    return
