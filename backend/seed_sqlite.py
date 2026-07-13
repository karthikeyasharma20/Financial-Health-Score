# Seeding Script for SQLite Local Database
import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal

# Ensure backend folder is in Python search path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import SessionLocal, engine, Base
from app.models import User, Transaction, Loan, Investment, Goal, FinancialScore, Recommendation, Notification
from app.auth import get_password_hash

def seed_database():
    print("Initializing SQLite tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data to avoid constraint conflicts
        print("Clearing old tables...")
        db.query(Notification).delete()
        db.query(Recommendation).delete()
        db.query(FinancialScore).delete()
        db.query(Goal).delete()
        db.query(Investment).delete()
        db.query(Loan).delete()
        db.query(Transaction).delete()
        db.query(User).delete()
        db.commit()

        print("Adding demo users...")
        # Hash of 'password123'
        hashed_password = get_password_hash("password123")
        
        admin = User(email="admin@financialhealth.com", hashed_password=hashed_password, full_name="Jane Doe (Admin)", role="admin")
        user = User(email="user@financialhealth.com", hashed_password=hashed_password, full_name="John Doe", role="user")
        
        db.add(admin)
        db.add(user)
        db.commit()
        db.refresh(user)
        
        user_id = user.id
        print(f"Created John Doe user with ID: {user_id}")

        # Transactions
        print("Adding mock transactions...")
        txs = [
            Transaction(user_id=user_id, amount=Decimal(6000.00), type="income", category="Salary", description="Monthly corporate paycheck", date=datetime.utcnow() - timedelta(days=30)),
            Transaction(user_id=user_id, amount=Decimal(500.00), type="income", category="Freelance", description="UI consulting gig", date=datetime.utcnow() - timedelta(days=15)),
            Transaction(user_id=user_id, amount=Decimal(6000.00), type="income", category="Salary", description="Monthly corporate paycheck", date=datetime.utcnow()),
            
            Transaction(user_id=user_id, amount=Decimal(1200.00), type="expense", category="Rent", description="Apartment monthly lease", date=datetime.utcnow() - timedelta(days=29)),
            Transaction(user_id=user_id, amount=Decimal(350.00), type="expense", category="Groceries", description="Whole Foods shopping", date=datetime.utcnow() - timedelta(days=28)),
            Transaction(user_id=user_id, amount=Decimal(150.00), type="expense", category="Utilities", description="Electric and water bills", date=datetime.utcnow() - timedelta(days=25)),
            Transaction(user_id=user_id, amount=Decimal(80.00), type="expense", category="Entertainment", description="Netflix and Spotify subscriptions", date=datetime.utcnow() - timedelta(days=24)),
            Transaction(user_id=user_id, amount=Decimal(120.00), type="expense", category="Dining Out", description="Weekend dinner with friends", date=datetime.utcnow() - timedelta(days=22)),
            Transaction(user_id=user_id, amount=Decimal(300.00), type="expense", category="Shopping", description="New wardrobe items", date=datetime.utcnow() - timedelta(days=20)),
            Transaction(user_id=user_id, amount=Decimal(450.00), type="expense", category="EMI", description="Monthly car loan payment", date=datetime.utcnow() - timedelta(days=18)),
            Transaction(user_id=user_id, amount=Decimal(100.00), type="expense", category="Fuel", description="Gas station refill", date=datetime.utcnow() - timedelta(days=15)),
            Transaction(user_id=user_id, amount=Decimal(200.00), type="expense", category="Groceries", description="Weekly supermarket run", date=datetime.utcnow() - timedelta(days=14)),
            Transaction(user_id=user_id, amount=Decimal(75.00), type="expense", category="Medical", description="Pharmacy prescription", date=datetime.utcnow() - timedelta(days=10)),
            Transaction(user_id=user_id, amount=Decimal(220.00), type="expense", category="Dining Out", description="Business lunch and coffee", date=datetime.utcnow() - timedelta(days=7)),
            Transaction(user_id=user_id, amount=Decimal(450.00), type="expense", category="EMI", description="Monthly car loan payment", date=datetime.utcnow()),
            Transaction(user_id=user_id, amount=Decimal(1200.00), type="expense", category="Rent", description="Apartment monthly lease", date=datetime.utcnow() + timedelta(minutes=30))
        ]
        db.add_all(txs)

        # Loans
        print("Adding active loans...")
        loans = [
            Loan(user_id=user_id, bank_name="Chase Bank", loan_type="Auto Loan", total_amount=Decimal(25000.00), remaining_amount=Decimal(18500.00), interest_rate=Decimal(4.50), emi=Decimal(450.00), due_date=datetime.utcnow().date() + timedelta(days=10)),
            Loan(user_id=user_id, bank_name="Wells Fargo", loan_type="Personal Loan", total_amount=Decimal(10000.00), remaining_amount=Decimal(4000.00), interest_rate=Decimal(8.20), emi=Decimal(250.00), due_date=datetime.utcnow().date() + timedelta(days=15))
        ]
        db.add_all(loans)

        # Investments
        print("Adding investment portfolios...")
        investments = [
            Investment(user_id=user_id, asset_class="stocks", current_value=Decimal(12500.00), invested_amount=Decimal(10000.00)),
            Investment(user_id=user_id, asset_class="mutual_funds", current_value=Decimal(8200.00), invested_amount=Decimal(7500.00)),
            Investment(user_id=user_id, asset_class="crypto", current_value=Decimal(2200.00), invested_amount=Decimal(3000.00)),
            Investment(user_id=user_id, asset_class="gold", current_value=Decimal(4500.00), invested_amount=Decimal(4000.00))
        ]
        db.add_all(investments)

        # Goals
        print("Adding financial goals...")
        goals = [
            Goal(user_id=user_id, name="Emergency Fund", target_amount=Decimal(15000.00), current_amount=Decimal(9000.00), target_date=datetime.utcnow().date() + timedelta(days=180), status="in_progress"),
            Goal(user_id=user_id, name="House Down Payment", target_amount=Decimal(50000.00), current_amount=Decimal(15000.00), target_date=datetime.utcnow().date() + timedelta(days=720), status="in_progress"),
            Goal(user_id=user_id, name="Europe Vacation", target_amount=Decimal(5000.00), current_amount=Decimal(5000.00), target_date=datetime.utcnow().date() - timedelta(days=5), status="completed")
        ]
        db.add_all(goals)

        # Financial Scores History
        print("Adding health score history...")
        scores = [
            FinancialScore(user_id=user_id, score=620, savings_rate=Decimal("0.1500"), debt_ratio=Decimal("0.3500"), credit_usage=Decimal("0.4200"), investment_ratio=Decimal("0.0800"), emergency_fund_ratio=Decimal("2.5000"), created_at=datetime.utcnow() - timedelta(days=60)),
            FinancialScore(user_id=user_id, score=650, savings_rate=Decimal("0.1800"), debt_ratio=Decimal("0.3200"), credit_usage=Decimal("0.3800"), investment_ratio=Decimal("0.1000"), emergency_fund_ratio=Decimal("2.8000"), created_at=datetime.utcnow() - timedelta(days=30)),
            FinancialScore(user_id=user_id, score=710, savings_rate=Decimal("0.2500"), debt_ratio=Decimal("0.2200"), credit_usage=Decimal("0.2800"), investment_ratio=Decimal("0.1500"), emergency_fund_ratio=Decimal("4.2000"), created_at=datetime.utcnow())
        ]
        db.add_all(scores)

        # Recommendations
        print("Adding recommendations...")
        recs = [
            Recommendation(user_id=user_id, recommendation_text="Your credit utilization is at 28%, which is good. Aim to keep it under 20% to boost your score to the excellent range.", type="credit", impact="medium", resolved=False),
            Recommendation(user_id=user_id, recommendation_text="Increase your Emergency Fund to cover at least 6 months of expenses. Currently, you have approximately 4.2 months saved.", type="savings", impact="high", resolved=False),
            Recommendation(user_id=user_id, recommendation_text="Consider refinancing your Wells Fargo Personal Loan to lower the 8.2% interest rate and accelerate repayment.", type="debt", impact="high", resolved=False),
            Recommendation(user_id=user_id, recommendation_text="Increase your monthly mutual fund investments by ₹15,000 to meet your long-term retirement target.", type="investment", impact="medium", resolved=False)
        ]
        db.add_all(recs)

        # Notifications
        print("Adding notifications...")
        notifs = [
            Notification(user_id=user_id, title="Score Updated!", message="Congratulations! Your Financial Health Score increased by 60 points this month.", is_read=False),
            Notification(user_id=user_id, title="EMI Due Reminder", message="Your auto loan EMI of ₹4,500 is due in 10 days.", is_read=False),
            Notification(user_id=user_id, title="Goal Completed!", message="You reached your target of ₹5,00,000 for the Europe Vacation goal!", is_read=True)
        ]
        db.add_all(notifs)

        db.commit()
        print("\nSQLite Database Seeded successfully!")
        print("You can now log in using:")
        print(" - User: user@financialhealth.com / password123")
        print(" - Admin: admin@financialhealth.com / password123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding SQLite database: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
