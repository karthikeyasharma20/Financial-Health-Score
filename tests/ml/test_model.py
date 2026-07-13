import pytest
import os
import sys

# Add root folder to sys.path so tests can find ml_model packages
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(os.path.join(project_root, "ml-model"))

from predict import FinancialScorePredictor

def test_fallback_predictor_bounds():
    # Pass non-existent paths to force rule-based fallback execution
    predictor = FinancialScorePredictor(model_path="invalid.pkl", scaler_path="invalid.pkl")
    
    # Define test profile
    profile = {
        'income': 5000.0,
        'monthly_expenses': 3000.0,
        'savings_rate': 0.40,
        'debt_ratio': 0.15,
        'credit_utilization': 0.20,
        'investment_amount': 800.0,
        'emergency_fund_months': 4.0,
        'income_stability': 0.90,
        'repayment_history': 1.0
    }
    
    score = predictor.predict(profile)
    
    # Assert score is correct type and bound limits
    assert isinstance(score, int)
    assert 100 <= score <= 1000

def test_extreme_profile_bounds():
    predictor = FinancialScorePredictor(model_path="invalid.pkl", scaler_path="invalid.pkl")
    
    # Poor financial profile
    poor_profile = {
        'income': 2000.0,
        'monthly_expenses': 2200.0, # Negative savings
        'savings_rate': -0.10,
        'debt_ratio': 0.80,
        'credit_utilization': 0.95,
        'investment_amount': 0.0,
        'emergency_fund_months': 0.0,
        'income_stability': 0.30,
        'repayment_history': 0.0
    }
    
    # Exceptional profile
    excellent_profile = {
        'income': 15000.0,
        'monthly_expenses': 3000.0,
        'savings_rate': 0.80,
        'debt_ratio': 0.0,
        'credit_utilization': 0.05,
        'investment_amount': 4000.0,
        'emergency_fund_months': 12.0,
        'income_stability': 1.0,
        'repayment_history': 1.0
    }
    
    poor_score = predictor.predict(poor_profile)
    excellent_score = predictor.predict(excellent_profile)
    
    assert poor_score < excellent_score
    assert poor_score >= 100
    assert excellent_score <= 1000
