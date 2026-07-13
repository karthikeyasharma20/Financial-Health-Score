# XGBoost Training Pipeline for Financial Health Score Model
import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb
import joblib

def generate_synthetic_data(num_samples=10000, random_seed=42):
    np.random.seed(random_seed)
    
    # 1. Generate Base Financial Features
    income = np.random.normal(5500, 2000, num_samples).clip(1500, 25000)
    expenses = income * np.random.uniform(0.40, 0.95, num_samples)
    
    # Savings Rate: (Income - Expenses) / Income
    savings_rate = (income - expenses) / income
    
    # Debt Ratio: Monthly EMI / Income
    debt_ratio = np.random.uniform(0.0, 0.6, num_samples)
    # Credit Card Utilization: CC Balance / CC Limit (0.0 to 1.0)
    credit_utilization = np.random.uniform(0.05, 0.95, num_samples)
    
    # Investment Amount (Monthly)
    investment_rate = np.random.uniform(0.0, 0.35, num_samples)
    investment_amount = income * investment_rate
    
    # Emergency Fund (in months of expenses, e.g. 0 to 12 months)
    emergency_fund_months = np.random.uniform(0.0, 10.0, num_samples)
    
    # Income Stability Score (0.0 to 1.0)
    income_stability = np.random.uniform(0.2, 1.0, num_samples)
    
    # Loan Repayment History (0 = poor, 1 = excellent)
    repayment_history = np.random.choice([0.0, 0.5, 1.0], size=num_samples, p=[0.1, 0.2, 0.7])

    # 2. Mathematical Scoring Formula (Ground Truth Score between 0 and 1000)
    # Weightages:
    # Savings Rate: 25% (Target: >= 30%)
    # Debt Ratio: 20% (Target: <= 20%)
    # Credit Usage: 15% (Target: <= 30%)
    # Investment: 15% (Target: >= 20%)
    # Income Stability: 15% (Target: >= 0.8)
    # Emergency Fund: 10% (Target: >= 6 months)
    
    score_savings = np.where(savings_rate >= 0.30, 250, (savings_rate.clip(0, 0.30) / 0.30) * 250)
    score_debt = np.where(debt_ratio <= 0.20, 200, (1 - (debt_ratio.clip(0.20, 0.60) - 0.20) / 0.40) * 200)
    score_credit = np.where(credit_utilization <= 0.30, 150, (1 - (credit_utilization.clip(0.30, 0.95) - 0.30) / 0.65) * 150)
    score_invest = np.where(investment_rate >= 0.20, 150, (investment_rate.clip(0, 0.20) / 0.20) * 150)
    score_stability = income_stability * 150
    score_emergency = np.where(emergency_fund_months >= 6.0, 100, (emergency_fund_months.clip(0, 6.0) / 6.0) * 100)
    
    # Combine and add repayment history impact (penalty of up to 100 points if history is bad)
    base_score = score_savings + score_debt + score_credit + score_invest + score_stability + score_emergency
    repayment_penalty = (1.0 - repayment_history) * 100
    
    final_score = (base_score - repayment_penalty).clip(100, 1000)
    
    # Add a small amount of random noise to simulate real-world variance that ML can generalize
    noise = np.random.normal(0, 15, num_samples)
    final_score = (final_score + noise).clip(100, 1000).astype(int)
    
    # 3. Construct DataFrame
    df = pd.DataFrame({
        'income': income,
        'monthly_expenses': expenses,
        'savings_rate': savings_rate,
        'debt_ratio': debt_ratio,
        'credit_utilization': credit_utilization,
        'investment_amount': investment_amount,
        'emergency_fund_months': emergency_fund_months,
        'income_stability': income_stability,
        'repayment_history': repayment_history,
        'financial_health_score': final_score
    })
    
    return df

def train_model():
    print("Generating synthetic financial data...")
    df = generate_synthetic_data()
    
    # Split features and target
    X = df.drop('financial_health_score', axis=1)
    y = df['financial_health_score']
    
    # Split train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train XGBoost Regressor
    print("Training XGBoost Regressor...")
    model = xgb.XGBRegressor(
        n_estimators=150,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\nModel Evaluation Metrics:")
    print(f"Mean Squared Error (MSE): {mse:.2f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f}")
    print(f"R-squared Score (R2): {r2:.4f}")
    
    # Feature Importances
    print("\nFeature Importances:")
    importances = model.feature_importances_
    features = X.columns
    for feature, importance in sorted(zip(features, importances), key=lambda x: x[1], reverse=True):
        print(f" - {feature}: {importance:.4f}")
        
    # Ensure save directory is resolved relative to this script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, 'model.pkl')
    scaler_path = os.path.join(base_dir, 'scaler.pkl')
    
    # Save Model and Scaler
    print(f"\nSaving model.pkl and scaler.pkl to:\n - {model_path}\n - {scaler_path}")
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print("Save complete!")

if __name__ == "__main__":
    train_model()
