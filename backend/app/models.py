from sqlalchemy import Column, Integer, String, Numeric, Boolean, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="user")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    loans = relationship("Loan", back_populates="user", cascade="all, delete-orphan")
    investments = relationship("Investment", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    scores = relationship("FinancialScore", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    amount = Column(Numeric(15, 2), nullable=False)
    type = Column(String(50), nullable=False)  # 'income' or 'expense'
    category = Column(String(100), nullable=False)  # 'Salary', 'Groceries', 'Rent', etc.
    description = Column(String(255))
    date = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="transactions")


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    bank_name = Column(String(255), nullable=False)
    loan_type = Column(String(100), nullable=False)  # 'Home Loan', 'Auto Loan', etc.
    total_amount = Column(Numeric(15, 2), nullable=False)
    remaining_amount = Column(Numeric(15, 2), nullable=False)
    interest_rate = Column(Numeric(5, 2), nullable=False)
    emi = Column(Numeric(15, 2), nullable=False)
    due_date = Column(Date, nullable=False)

    user = relationship("User", back_populates="loans")


class Investment(Base):
    __tablename__ = "investments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    asset_class = Column(String(100), nullable=False)  # 'stocks', 'mutual_funds', 'crypto', 'gold', etc.
    current_value = Column(Numeric(15, 2), nullable=False)
    invested_amount = Column(Numeric(15, 2), nullable=False)
    date = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="investments")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name = Column(String(255), nullable=False)
    target_amount = Column(Numeric(15, 2), nullable=False)
    current_amount = Column(Numeric(15, 2), default=0.00)
    target_date = Column(Date, nullable=False)
    status = Column(String(50), default="in_progress")  # 'in_progress', 'completed', 'failed'

    user = relationship("User", back_populates="goals")


class FinancialScore(Base):
    __tablename__ = "financial_scores"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    score = Column(Integer, nullable=False)
    savings_rate = Column(Numeric(5, 4), nullable=False)
    debt_ratio = Column(Numeric(5, 4), nullable=False)
    credit_usage = Column(Numeric(5, 4), nullable=False)
    investment_ratio = Column(Numeric(5, 4), nullable=False)
    emergency_fund_ratio = Column(Numeric(5, 4), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="scores")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    recommendation_text = Column(Text, nullable=False)
    type = Column(String(100), nullable=False)  # 'savings', 'debt', 'investment', etc.
    impact = Column(String(50), nullable=False)  # 'high', 'medium', 'low'
    resolved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="recommendations")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    user = relationship("User", back_populates="notifications")
