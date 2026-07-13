from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        orm_mode = True


# Transaction Schemas
class TransactionBase(BaseModel):
    amount: Decimal = Field(..., max_digits=15, decimal_places=2)
    type: str = Field(..., regex="^(income|expense)$")
    category: str
    description: Optional[str] = None
    date: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    user_id: int
    date: datetime

    class Config:
        orm_mode = True


# Loan Schemas
class LoanBase(BaseModel):
    bank_name: str
    loan_type: str
    total_amount: Decimal
    remaining_amount: Decimal
    interest_rate: Decimal
    emi: Decimal
    due_date: date

class LoanCreate(LoanBase):
    pass

class LoanResponse(LoanBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


# Investment Schemas
class InvestmentBase(BaseModel):
    asset_class: str  # 'stocks', 'mutual_funds', 'crypto', 'gold', 'fixed_deposit'
    current_value: Decimal
    invested_amount: Decimal

class InvestmentCreate(InvestmentBase):
    pass

class InvestmentResponse(InvestmentBase):
    id: int
    user_id: int
    date: datetime

    class Config:
        orm_mode = True


# Goal Schemas
class GoalBase(BaseModel):
    name: str
    target_amount: Decimal
    current_amount: Optional[Decimal] = Decimal(0.0)
    target_date: date
    status: Optional[str] = "in_progress"

class GoalCreate(GoalBase):
    pass

class GoalResponse(GoalBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


# Financial Score Schemas
class FinancialScoreResponse(BaseModel):
    id: int
    user_id: int
    score: int
    savings_rate: Decimal
    debt_ratio: Decimal
    credit_usage: Decimal
    investment_ratio: Decimal
    emergency_fund_ratio: Decimal
    created_at: datetime

    class Config:
        orm_mode = True


# Recommendation Schemas
class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    recommendation_text: str
    type: str
    impact: str
    resolved: bool
    created_at: datetime

    class Config:
        orm_mode = True


# Notification Schemas
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True


# ML Predict Schemas
class PredictRequest(BaseModel):
    income: float = Field(..., example=6000.0)
    monthly_expenses: float = Field(..., example=3200.0)
    savings_rate: Optional[float] = None # Calculated if None
    debt_ratio: float = Field(..., example=0.25)
    credit_utilization: float = Field(..., example=0.35)
    investment_amount: float = Field(..., example=800.0)
    emergency_fund_months: float = Field(..., example=3.0)
    income_stability: float = Field(0.8, example=0.85) # 0 to 1
    repayment_history: float = Field(1.0, example=1.0) # 0, 0.5, or 1

class PredictResponse(BaseModel):
    score: int
    rating: str  # e.g., 'Excellent', 'Good', 'Fair', 'Poor'
    features_received: PredictRequest
