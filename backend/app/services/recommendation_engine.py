from sqlalchemy.orm import Session
from app.models import Recommendation, FinancialScore
from app.services.score_calculator import calculate_user_metrics
import json

def generate_financial_recommendations(db: Session, user_id: int):
    # 1. Fetch user parameters
    metrics = calculate_user_metrics(db, user_id)
    
    savings_rate = metrics['savings_rate']
    debt_ratio = metrics['debt_ratio']
    credit_util = metrics['credit_utilization']
    emergency_months = metrics['emergency_fund_months']
    income = metrics['income']
    investment_amt = metrics['investment_amount']
    investment_rate = investment_amt / income if income > 0 else 0.0
    
    recommendations_list = []

    # Recommendation 1: Savings Rate
    if savings_rate < 0.10:
        recommendations_list.append({
            "text": f"Your savings rate is currently very low at {savings_rate*100:.1f}%. To build financial security, try setting up an automated transfer of 10-15% of your paycheck to savings immediately upon receipt.",
            "type": "savings",
            "impact": "high"
        })
    elif savings_rate < 0.20:
        recommendations_list.append({
            "text": f"Your savings rate is {savings_rate*100:.1f}%. While you are saving, aim to increase this to the standard 20-30% by identifying non-essential expenditures and creating a strict monthly budget.",
            "type": "savings",
            "impact": "medium"
        })
    else:
        recommendations_list.append({
            "text": f"Great job! Your savings rate is a healthy {savings_rate*100:.1f}%. Keep maintaining this discipline and ensure these savings are allocated effectively.",
            "type": "savings",
            "impact": "low"
        })

    # Recommendation 2: Debt Ratio
    if debt_ratio > 0.40:
        recommendations_list.append({
            "text": f"Your debt-to-income ratio is {debt_ratio*100:.1f}%, which poses high financial stress. Focus on reducing debt using the Debt Snowball or Avalanche method, and avoid taking on any new loans.",
            "type": "debt",
            "impact": "high"
        })
    elif debt_ratio > 0.20:
        recommendations_list.append({
            "text": f"Your debt ratio is {debt_ratio*100:.1f}%. It is slightly above the recommended 20% limit. Consider allocating a portion of your monthly savings to make extra payments on high-interest loans.",
            "type": "debt",
            "impact": "medium"
        })

    # Recommendation 3: Credit Card Utilization
    if credit_util > 0.50:
        recommendations_list.append({
            "text": f"Your credit utilization is high at {credit_util*100:.1f}%. This negatively impacts your credit rating. Pay off your balances twice a month or request a limit increase to keep utilization under 30%.",
            "type": "credit",
            "impact": "high"
        })
    elif credit_util > 0.30:
        recommendations_list.append({
            "text": f"Your credit utilization is {credit_util*100:.1f}%. Keeping this below 30% helps optimize your score. Try tracking your mid-cycle credit card statements to avoid peak balance reporting.",
            "type": "credit",
            "impact": "medium"
        })

    # Recommendation 4: Emergency Fund
    if emergency_months < 3.0:
        recommendations_list.append({
            "text": f"Your emergency fund only covers {emergency_months:.1f} months of expenses. Your top priority should be accumulating at least 3 to 6 months of expenses in a high-yield liquid account.",
            "type": "savings",
            "impact": "high"
        })
    elif emergency_months < 6.0:
        recommendations_list.append({
            "text": f"Your emergency fund is at {emergency_months:.1f} months of expenses. While this provides a basic buffer, increasing it to 6 months will provide robust protection against unexpected job losses or medical costs.",
            "type": "savings",
            "impact": "medium"
        })

    # Recommendation 5: Investments
    if investment_rate < 0.10:
        recommendations_list.append({
            "text": f"You are investing only {investment_rate*100:.1f}% of your monthly income. Harness the power of compounding by setting up a Systematic Investment Plan (SIP) in diversified low-cost index funds.",
            "type": "investment",
            "impact": "medium"
        })
    elif investment_rate < 0.20:
        recommendations_list.append({
            "text": f"Your investment rate is {investment_rate*100:.1f}%. Aim to increase this closer to 20% by shifting some cash savings (once your emergency fund is full) into equity or debt mutual funds.",
            "type": "investment",
            "impact": "low"
        })

    # 2. Write recommendations to database
    # De-duplicate: Delete unresolved recommendations and add fresh ones
    db.query(Recommendation).filter(
        Recommendation.user_id == user_id,
        Recommendation.resolved == False
    ).delete()

    db_recs = []
    for rec in recommendations_list:
        db_rec = Recommendation(
            user_id=user_id,
            recommendation_text=rec["text"],
            type=rec["type"],
            impact=rec["impact"],
            resolved=False
        )
        db.add(db_rec)
        db_recs.append(db_rec)
        
    db.commit()
    return db_recs

def get_llm_ready_prompt(db: Session, user_id: int) -> str:
    """
    Constructs a highly structured system prompt containing user's financial
    metrics for seamless LLM integrations (Gemini, OpenAI, Claude).
    """
    metrics = calculate_user_metrics(db, user_id)
    
    prompt_context = {
        "user_id": user_id,
        "monthly_income": f"₹{metrics['income']:.2f}",
        "monthly_expenses": f"₹{metrics['monthly_expenses']:.2f}",
        "savings_rate": f"{metrics['savings_rate']*100:.2f}%",
        "debt_to_income_ratio": f"{metrics['debt_ratio']*100:.2f}%",
        "credit_utilization": f"{metrics['credit_utilization']*100:.2f}%",
        "monthly_investments": f"₹{metrics['investment_amount']:.2f}",
        "emergency_fund_months": f"{metrics['emergency_fund_months']:.2f} months",
        "income_stability_index": f"{metrics['income_stability']}/1.0",
        "repayment_history_rating": f"{metrics['repayment_history']*100:.0f}/100"
    }
    
    prompt = f"""
    SYSTEM: You are an expert AI financial planner. Analyze the following user financial metrics:
    {json.dumps(prompt_context, indent=2)}
    
    Provide a detailed, 3-paragraph financial health evaluation:
    1. Assess their current budgeting, cash flow, and savings velocity.
    2. Highlight critical warning signs (e.g., high debt, insufficient emergency cushion).
    3. Outline an actionable step-by-step strategy to optimize their score.
    """
    return prompt
