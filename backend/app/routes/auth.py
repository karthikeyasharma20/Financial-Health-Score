from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal

from app.database import get_db
from app.models import User, Transaction, Loan, Investment, Goal, Notification
from app.schemas import UserCreate, UserResponse, UserLogin, Token
from app.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # UX Polish: Auto-seed initial baseline records so new registrations aren't completely blank dashboards
    seed_new_user_data(db, new_user.id)
    
    return new_user

@router.post("/login", response_model=Token)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile", response_model=UserResponse)
def read_user_profile(current_user: User = Depends(get_current_user)):
    return current_user


def seed_new_user_data(db: Session, user_id: int):
    """Populates standard mock data for newly registered users for premium UI presentation."""
    # Transactions
    txs = [
        Transaction(user_id=user_id, amount=Decimal(5000.00), type="income", category="Salary", description="Monthly Salary Credited"),
        Transaction(user_id=user_id, amount=Decimal(1100.00), type="expense", category="Rent", description="Appartment Rent Payment"),
        Transaction(user_id=user_id, amount=Decimal(250.00), type="expense", category="Groceries", description="Supermarket Grocery shopping"),
        Transaction(user_id=user_id, amount=Decimal(120.00), type="expense", category="Utilities", description="Power & Water bill payment"),
        Transaction(user_id=user_id, amount=Decimal(70.00), type="expense", category="Entertainment", description="Streaming subscriptions"),
        Transaction(user_id=user_id, amount=Decimal(300.00), type="expense", category="EMI", description="Car Loan installment payment"),
        Transaction(user_id=user_id, amount=Decimal(150.00), type="expense", category="Dining Out", description="Weekly restaurant outing"),
        Transaction(user_id=user_id, amount=Decimal(200.00), type="expense", category="Shopping", description="Clothes purchase"),
    ]
    db.add_all(txs)
    
    # Loans
    loan = Loan(
        user_id=user_id, bank_name="Ally Bank", loan_type="Car Loan", 
        total_amount=Decimal(15000.00), remaining_amount=Decimal(12000.00), 
        interest_rate=Decimal(4.8), emi=Decimal(300.00), due_date=datetime.now().date() + timedelta(days=12)
    )
    db.add(loan)
    
    # Investments
    investments = [
        Investment(user_id=user_id, asset_class="stocks", current_value=Decimal(5000.00), invested_amount=Decimal(4500.00)),
        Investment(user_id=user_id, asset_class="mutual_funds", current_value=Decimal(3000.00), invested_amount=Decimal(2800.00)),
    ]
    db.add_all(investments)
    
    # Goals
    goals = [
        Goal(user_id=user_id, name="Emergency Fund", target_amount=Decimal(10000.00), current_amount=Decimal(4000.00), target_date=datetime.now().date() + timedelta(days=150)),
        Goal(user_id=user_id, name="Holiday Savings", target_amount=Decimal(3000.00), current_amount=Decimal(1200.00), target_date=datetime.now().date() + timedelta(days=90))
    ]
    db.add_all(goals)
    
    # Notifications
    notifications = [
        Notification(user_id=user_id, title="Welcome to AI Financial Health!", message="Your financial score will calculate automatically as you edit transactions and loans.", is_read=False),
        Notification(user_id=user_id, title="Account Setup Completed", message="Demo transactions, a car loan, and asset tracking models have been seeded to help you explore the dashboard.", is_read=True)
    ]
    db.add_all(notifications)
    
    db.commit()
