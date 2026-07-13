from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from decimal import Decimal

from app.models import Transaction, Loan, Investment, Goal, FinancialScore

import os
import sys

ML_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "ml-model")
)

if ML_PATH not in sys.path:
    sys.path.append(ML_PATH)

from predict import FinancialScorePredictor

predictor = FinancialScorePredictor()

def calculate_user_metrics(db: Session, user_id: int):
    # Time threshold (last 90 days for average monthly calculation)
    ninety_days_ago = datetime.utcnow() - timedelta(days=90)
    
    # 1. Monthly Income (Average over past 90 days)
    income_records = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= ninety_days_ago
    ).scalar() or Decimal(0.0)
    
    monthly_income = float(income_records / 3) if income_records > 0 else 0.0
    
    # If no income is found in transactions, check if there's any older income
    if monthly_income == 0.0:
        total_inc = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "income"
        ).scalar() or Decimal(0.0)
        monthly_income = float(total_inc / 12) if total_inc > 0 else 5000.0 # Default fallback

    # 2. Monthly Expenses (Average over past 90 days)
    expense_records = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= ninety_days_ago
    ).scalar() or Decimal(0.0)
    
    monthly_expenses = float(expense_records / 3) if expense_records > 0 else 0.0
    if monthly_expenses == 0.0:
        total_exp = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense"
        ).scalar() or Decimal(0.0)
        monthly_expenses = float(total_exp / 12) if total_exp > 0 else 3000.0 # Default fallback

    # 3. Savings Rate
    savings_rate = (monthly_income - monthly_expenses) / monthly_income if monthly_income > 0 else 0.0
    savings_rate = max(0.0, savings_rate) # Prevent negative values from crashing calculations

    # 4. Debt Ratio (EMI / Income)
    total_emi = db.query(func.sum(Loan.emi)).filter(
        Loan.user_id == user_id
    ).scalar() or Decimal(0.0)
    
    debt_ratio = float(total_emi) / monthly_income if monthly_income > 0 else 0.0

    # 5. Credit Utilization
    # Mock CC details or derive from transactions. In standard bank, CC spending accounts for ~30% of expenses.
    # Let's derive a realistic ratio or keep a base limit. Suppose credit card limit is $10000.
    cc_limit = 10000.0
    cc_balance_query = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.category.in_(["Shopping", "Entertainment", "Dining Out", "Travel"])
    ).scalar() or Decimal(0.0)
    
    credit_balance = float(cc_balance_query) * 0.4  # Assume 40% of dining/shopping is on credit
    credit_utilization = min(0.95, max(0.05, credit_balance / cc_limit))

    # 6. Investment Rate
    # Aggregated current values from Investments table
    total_invested = db.query(func.sum(Investment.current_value)).filter(
        Investment.user_id == user_id
    ).scalar() or Decimal(0.0)
    
    # Estimate monthly investment contribution based on transaction category 'Investment'
    monthly_investment_tx = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.category == "Investment",
        Transaction.date >= ninety_days_ago
    ).scalar() or Decimal(0.0)
    
    monthly_investment = float(monthly_investment_tx / 3) if monthly_investment_tx > 0 else float(total_invested) * 0.02 # Fallback to 2% of asset value
    investment_rate = monthly_investment / monthly_income if monthly_income > 0 else 0.0

    # 7. Emergency Fund (in months of expenses)
    # Pull current amounts from goals designated as Emergency Fund
    emergency_savings = db.query(func.sum(Goal.current_amount)).filter(
        Goal.user_id == user_id,
        Goal.name.ilike("%emergency%")
    ).scalar() or Decimal(0.0)
    
    # If no goal is explicitly named Emergency Fund, use a proportion of savings
    if emergency_savings == 0:
         emergency_savings = Decimal(monthly_income * 2) # Assume 2 months fallback
         
    emergency_fund_months = float(emergency_savings) / monthly_expenses if monthly_expenses > 0 else 3.0

    # 8. Income Stability (variability of income transactions over last 90 days)
    # Standardize a stability score (0.85 default, penalize if zero transactions)
    income_tx_count = db.query(func.count(Transaction.id)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= ninety_days_ago
    ).scalar() or 0
    
    income_stability = 0.95 if income_tx_count >= 3 else (0.50 if income_tx_count > 0 else 0.20)

    # 9. Repayment History (defaults to 1.0, penalize if there are failed/delayed items)
    repayment_history = 1.0
    # Let's say if remaining loan amount is high and due dates are passed (not modeled here, so keeping 1.0 or 0.9)
    # If debt ratio is extreme, assume repayment struggles
    if debt_ratio > 0.5:
        repayment_history = 0.75
    elif debt_ratio > 0.35:
        repayment_history = 0.90

    return {
        'income': monthly_income,
        'monthly_expenses': monthly_expenses,
        'savings_rate': savings_rate,
        'debt_ratio': debt_ratio,
        'credit_utilization': credit_utilization,
        'investment_amount': monthly_investment,
        'emergency_fund_months': emergency_fund_months,
        'income_stability': income_stability,
        'repayment_history': repayment_history
    }

def get_or_calculate_score(db: Session, user_id: int, force_recalculate: bool = False) -> FinancialScore:
    # 1. Try to find the score generated today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    if not force_recalculate:
        existing_score = db.query(FinancialScore).filter(
            FinancialScore.user_id == user_id,
            FinancialScore.created_at >= today_start
        ).order_by(FinancialScore.created_at.desc()).first()
        
        if existing_score:
            return existing_score

    # 2. Extract user features from database logs
    features = calculate_user_metrics(db, user_id)
    
    # 3. Call ML model predict interface
    predicted_score = predictor.predict(features)
    
    # 4. Save and return new FinancialScore object
    new_score = FinancialScore(
        user_id=user_id,
        score=predicted_score,
        savings_rate=Decimal(str(features['savings_rate'])),
        debt_ratio=Decimal(str(features['debt_ratio'])),
        credit_usage=Decimal(str(features['credit_utilization'])),
        investment_ratio=Decimal(str(features['investment_amount'] / features['income'] if features['income'] > 0 else 0.0)),
        emergency_fund_ratio=Decimal(str(features['emergency_fund_months']))
    )
    
    db.add(new_score)
    db.commit()
    db.refresh(new_score)
    
    return new_score
