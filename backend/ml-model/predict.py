# Predictor Interface for Financial Health Score Model
import os
import joblib
import numpy as np

class FinancialScorePredictor:
    def __init__(self, model_path=None, scaler_path=None):
        # Fallback pathways if environment variables or parameters aren't provided
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.model_path = model_path or os.getenv('ML_MODEL_PATH', os.path.join(base_dir, 'model.pkl'))
        self.scaler_path = scaler_path or os.getenv('ML_SCALER_PATH', os.path.join(base_dir, 'scaler.pkl'))
        
        self.model = None
        self.scaler = None
        self._load_assets()

    def _load_assets(self):
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            try:
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                print(f"ML Model and Scaler successfully loaded.")
            except Exception as e:
                print(f"Error loading ML assets: {str(e)}")
        else:
            print(f"ML assets not found at:\n - Model: {self.model_path}\n - Scaler: {self.scaler_path}\nRunning in rule-based fallback mode.")

    def predict(self, features):
        """
        Predicts Financial Health Score (0-1000)
        :param features: Dict containing keys:
            ['income', 'monthly_expenses', 'savings_rate', 'debt_ratio', 
             'credit_utilization', 'investment_amount', 'emergency_fund_months',
             'income_stability', 'repayment_history']
        :return: int (predicted score)
        """
        # 1. Fallback Rule-Based Engine if model is not trained yet
        if self.model is None or self.scaler is None:
            # Re-verify if files are available now (lazy loading)
            self._load_assets()
            if self.model is None or self.scaler is None:
                return self._calculate_fallback_score(features)

        # 2. ML Prediction Flow
        try:
            # Order features exactly as trained
            feature_keys = [
                'income', 'monthly_expenses', 'savings_rate', 'debt_ratio',
                'credit_utilization', 'investment_amount', 'emergency_fund_months',
                'income_stability', 'repayment_history'
            ]
            
            features_array = np.array([features[k] for k in feature_keys]).reshape(1, -1)
            scaled_features = self.scaler.transform(features_array)
            predicted_score = self.model.predict(scaled_features)[0]
            
            return int(np.clip(predicted_score, 100, 1000))
        except Exception as e:
            print(f"Prediction failed, falling back: {str(e)}")
            return self._calculate_fallback_score(features)

    def get_feature_importances(self):
        if self.model is None:
            # Fallback static importance rankings based on scoring logic weights
            return {
                'savings_rate': 0.25,
                'debt_ratio': 0.20,
                'credit_utilization': 0.15,
                'investment_amount': 0.15,
                'income_stability': 0.15,
                'emergency_fund_months': 0.10,
                'repayment_history': 0.05,
                'income': 0.0,
                'monthly_expenses': 0.0
            }
        
        feature_keys = [
            'income', 'monthly_expenses', 'savings_rate', 'debt_ratio',
            'credit_utilization', 'investment_amount', 'emergency_fund_months',
            'income_stability', 'repayment_history'
        ]
        importances = self.model.feature_importances_
        return {k: float(v) for k, v in zip(feature_keys, importances)}

    def _calculate_fallback_score(self, f):
        """Rule-based calculation matching the weights in training script."""
        try:
            # Ensure correct datatypes
            income = float(f.get('income', 5000))
            expenses = float(f.get('monthly_expenses', 3000))
            savings_rate = float(f.get('savings_rate', (income - expenses) / income if income > 0 else 0))
            debt_ratio = float(f.get('debt_ratio', 0.2))
            credit_util = float(f.get('credit_utilization', 0.3))
            investment_amt = float(f.get('investment_amount', 0))
            investment_rate = investment_amt / income if income > 0 else 0
            emergency_fund = float(f.get('emergency_fund_months', 3))
            stability = float(f.get('income_stability', 0.8))
            repayment = float(f.get('repayment_history', 1.0))
            
            score_savings = 250 if savings_rate >= 0.30 else (max(0.0, savings_rate) / 0.30) * 250
            score_debt = 200 if debt_ratio <= 0.20 else (1 - (min(0.60, max(0.20, debt_ratio)) - 0.20) / 0.40) * 200
            score_credit = 150 if credit_util <= 0.30 else (1 - (min(0.95, max(0.30, credit_util)) - 0.30) / 0.65) * 150
            score_invest = 150 if investment_rate >= 0.20 else (min(0.20, max(0.0, investment_rate)) / 0.20) * 150
            score_stability = stability * 150
            score_emergency = 100 if emergency_fund >= 6.0 else (min(6.0, max(0.0, emergency_fund)) / 6.0) * 100
            
            base_score = score_savings + score_debt + score_credit + score_invest + score_stability + score_emergency
            penalty = (1.0 - repayment) * 100
            
            return int(np.clip(base_score - penalty, 100, 1000))
        except Exception as e:
            print(f"Fallback score calculation failed: {str(e)}")
            return 500
