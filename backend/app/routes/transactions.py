from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import Transaction, User
from app.schemas import TransactionCreate, TransactionResponse
from app.auth import get_current_user
from app.services.csv_export import generate_transactions_csv

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_in: TransactionCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    new_tx = Transaction(
        user_id=current_user.id,
        amount=tx_in.amount,
        type=tx_in.type,
        category=tx_in.category,
        description=tx_in.description,
        date=tx_in.date or datetime.utcnow()
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    return new_tx

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    if category:
        query = query.filter(Transaction.category == category)
    if type:
        query = query.filter(Transaction.type == type)
        
    transactions = query.order_by(Transaction.date.desc()).offset(offset).limit(limit).all()
    return transactions

@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    tx_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id, 
        Transaction.user_id == current_user.id
    ).first()
    
    if not tx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found or unauthorized."
        )
        
    db.delete(tx)
    db.commit()
    return

@router.get("/export", status_code=status.HTTP_200_OK)
def export_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch all user transactions
    transactions = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(Transaction.date.desc()).all()
    
    # Generate CSV payload string
    csv_content = generate_transactions_csv(transactions)
    
    # Convert CSV string to bytes iterator
    csv_bytes = csv_content.encode("utf-8")
    
    # Stream the file response
    response = StreamingResponse(
        iter([csv_bytes]),
        media_type="text/csv"
    )
    response.headers["Content-Disposition"] = f"attachment; filename=transactions_{current_user.id}.csv"
    return response
