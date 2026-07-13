from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from datetime import datetime, timedelta
from decimal import Decimal

from app.database import get_db
from app.models import Transaction, Investment, Loan, Goal, User
from app.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard", status_code=status.HTTP_200_OK)
def get_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_id = current_user.id
    
    # 1. Total assets vs Total liabilities
    total_invested = db.query(func.sum(Investment.current_value)).filter(
        Investment.user_id == user_id
    ).scalar() or Decimal(0.0)
    
    total_goal_savings = db.query(func.sum(Goal.current_amount)).filter(
        Goal.user_id == user_id
    ).scalar() or Decimal(0.0)
    
    total_assets = total_invested + total_goal_savings
    
    total_loans_remaining = db.query(func.sum(Loan.remaining_amount)).filter(
        Loan.user_id == user_id
    ).scalar() or Decimal(0.0)
    
    # 2. Spending Category Distribution (Past 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    category_spending = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= thirty_days_ago
    ).group_by(Transaction.category).all()
    
    spending_breakdown = {cat: float(tot) for cat, tot in category_spending}

    # 3. Monthly Income vs Expenses (Past 6 months trend)
    six_months_ago = datetime.utcnow() - timedelta(days=180)
    
    if db.bind.dialect.name == "sqlite":
        month_label = func.strftime('%Y-%m', Transaction.date)
    else:
        month_label = func.to_char(Transaction.date, 'YYYY-MM')

    monthly_trend_query = db.query(
        month_label.label("month"),
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.date >= six_months_ago
    ).group_by(month_label, Transaction.type).order_by(month_label).all()
    
    # Restructure monthly trends
    monthly_trends = {}
    for row in monthly_trend_query:
        month = row.month
        if month not in monthly_trends:
            monthly_trends[month] = {"month": month, "income": 0.0, "expense": 0.0}
        
        monthly_trends[month][row.type] = float(row.total)
        
    trends_list = sorted(list(monthly_trends.values()), key=lambda x: x["month"])

    # 4. Investment Allocations
    investment_classes = db.query(
        Investment.asset_class,
        func.sum(Investment.current_value).label("total")
    ).filter(Investment.user_id == user_id).group_by(Investment.asset_class).all()
    
    investments_breakdown = {asset: float(tot) for asset, tot in investment_classes}

    # 5. Loan details
    loans_list = db.query(Loan).filter(Loan.user_id == user_id).all()
    loans_breakdown = [{
        "bank_name": l.bank_name,
        "loan_type": l.loan_type,
        "remaining_amount": float(l.remaining_amount),
        "interest_rate": float(l.interest_rate),
        "emi": float(l.emi),
        "due_date": l.due_date.isoformat()
    } for l in loans_list]

    # 6. Goals Progress
    goals_list = db.query(Goal).filter(Goal.user_id == user_id).all()
    goals_breakdown = [{
        "id": g.id,
        "name": g.name,
        "target_amount": float(g.target_amount),
        "current_amount": float(g.current_amount),
        "target_date": g.target_date.isoformat(),
        "status": g.status
    } for g in goals_list]

    # 7. Recent Transactions (Last 5)
    recent_transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(Transaction.date.desc()).limit(5).all()
    
    recent_tx_list = [{
        "id": tx.id,
        "amount": float(tx.amount),
        "type": tx.type,
        "category": tx.category,
        "description": tx.description,
        "date": tx.date.isoformat()
    } for tx in recent_transactions]

    return {
        "summary": {
            "total_assets": float(total_assets),
            "total_investments": float(total_invested),
            "total_savings": float(total_goal_savings),
            "total_liabilities": float(total_loans_remaining),
            "net_worth": float(total_assets - total_loans_remaining)
        },
        "spending_by_category": spending_breakdown,
        "monthly_cash_flow": trends_list,
        "investment_allocation": investments_breakdown,
        "loans": loans_breakdown,
        "goals": goals_breakdown,
        "recent_transactions": recent_tx_list
    }
