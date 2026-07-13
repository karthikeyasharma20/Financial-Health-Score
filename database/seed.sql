-- Seed Data for AI Financial Health Score Platform

-- Password hash corresponds to 'password123' hashed with bcrypt
-- Admin: admin@financialhealth.com / password123
-- User: user@financialhealth.com / password123
INSERT INTO users (email, hashed_password, full_name, role) VALUES
('admin@financialhealth.com', '$2b$12$EixZaYVK1fsYi1FnKj0e1u5V9N2B43vnp/E8Lg6e/DYZwG5V4fWpy', 'Jane Doe (Admin)', 'admin'),
('user@financialhealth.com', '$2b$12$EixZaYVK1fsYi1FnKj0e1u5V9N2B43vnp/E8Lg6e/DYZwG5V4fWpy', 'John Doe', 'user')
ON CONFLICT (email) DO NOTHING;

-- Seed Transactions for John Doe (user_id = 2)
INSERT INTO transactions (user_id, amount, type, category, description, date) VALUES
(2, 6000.00, 'income', 'Salary', 'Monthly corporate paycheck', CURRENT_TIMESTAMP - INTERVAL '30 days'),
(2, 500.00, 'income', 'Freelance', 'UI consulting gig', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(2, 6000.00, 'income', 'Salary', 'Monthly corporate paycheck', CURRENT_TIMESTAMP),

(2, 1200.00, 'expense', 'Rent', 'Apartment monthly lease', CURRENT_TIMESTAMP - INTERVAL '29 days'),
(2, 350.00, 'expense', 'Groceries', 'Whole Foods shopping', CURRENT_TIMESTAMP - INTERVAL '28 days'),
(2, 150.00, 'expense', 'Utilities', 'Electric and water bills', CURRENT_TIMESTAMP - INTERVAL '25 days'),
(2, 80.00, 'expense', 'Entertainment', 'Netflix and Spotify subscriptions', CURRENT_TIMESTAMP - INTERVAL '24 days'),
(2, 120.00, 'expense', 'Dining Out', 'Weekend dinner with friends', CURRENT_TIMESTAMP - INTERVAL '22 days'),
(2, 300.00, 'expense', 'Shopping', 'New wardrobe items', CURRENT_TIMESTAMP - INTERVAL '20 days'),
(2, 450.00, 'expense', 'EMI', 'Monthly car loan payment', CURRENT_TIMESTAMP - INTERVAL '18 days'),
(2, 100.00, 'expense', 'Fuel', 'Gas station refill', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(2, 200.00, 'expense', 'Groceries', 'Weekly supermarket run', CURRENT_TIMESTAMP - INTERVAL '14 days'),
(2, 75.00, 'expense', 'Medical', 'Pharmacy prescription', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(2, 220.00, 'expense', 'Dining Out', 'Business lunch and coffee', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(2, 450.00, 'expense', 'EMI', 'Monthly car loan payment', CURRENT_TIMESTAMP),
(2, 1200.00, 'expense', 'Rent', 'Apartment monthly lease', CURRENT_TIMESTAMP + INTERVAL '1 hour');

-- Seed Loans for John Doe (user_id = 2)
INSERT INTO loans (user_id, bank_name, loan_type, total_amount, remaining_amount, interest_rate, emi, due_date) VALUES
(2, 'Chase Bank', 'Auto Loan', 25000.00, 18500.00, 4.50, 450.00, CURRENT_DATE + INTERVAL '10 days'),
(2, 'Wells Fargo', 'Personal Loan', 10000.00, 4000.00, 8.20, 250.00, CURRENT_DATE + INTERVAL '15 days');

-- Seed Investments for John Doe (user_id = 2)
INSERT INTO investments (user_id, asset_class, current_value, invested_amount) VALUES
(2, 'stocks', 12500.00, 10000.00),
(2, 'mutual_funds', 8200.00, 7500.00),
(2, 'crypto', 2200.00, 3000.00),
(2, 'gold', 4500.00, 4000.00);

-- Seed Goals for John Doe (user_id = 2)
INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, status) VALUES
(2, 'Emergency Fund', 15000.00, 9000.00, CURRENT_DATE + INTERVAL '180 days', 'in_progress'),
(2, 'House Down Payment', 50000.00, 15000.00, CURRENT_DATE + INTERVAL '720 days', 'in_progress'),
(2, 'Europe Vacation', 5000.00, 5000.00, CURRENT_DATE - INTERVAL '5 days', 'completed');

-- Seed Financial Scores for John Doe (user_id = 2)
INSERT INTO financial_scores (user_id, score, savings_rate, debt_ratio, credit_usage, investment_ratio, emergency_fund_ratio) VALUES
(2, 620, 0.1500, 0.3500, 0.4200, 0.0800, 2.5000, CURRENT_TIMESTAMP - INTERVAL '60 days'),
(2, 650, 0.1800, 0.3200, 0.3800, 0.1000, 2.8000, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(2, 710, 0.2500, 0.2200, 0.2800, 0.1500, 4.2000, CURRENT_TIMESTAMP);

-- Seed Recommendations for John Doe (user_id = 2)
INSERT INTO recommendations (user_id, recommendation_text, type, impact, resolved) VALUES
(2, 'Your credit utilization is at 28%, which is good. Aim to keep it under 20% to boost your score to the excellent range.', 'credit', 'medium', false),
(2, 'Increase your Emergency Fund to cover at least 6 months of expenses. Currently, you have approximately 4.2 months saved.', 'savings', 'high', false),
(2, 'Consider refinancing your Wells Fargo Personal Loan to lower the 8.2% interest rate and accelerate repayment.', 'debt', 'high', false),
(2, 'Increase your monthly mutual fund investments by $150 to meet your long-term retirement target.', 'investment', 'medium', false);

-- Seed Notifications for John Doe (user_id = 2)
INSERT INTO notifications (user_id, title, message, is_read) VALUES
(2, 'Score Updated!', 'Congratulations! Your Financial Health Score increased by 60 points this month.', false),
(2, 'EMI Due Reminder', 'Your auto loan EMI of $450 is due in 10 days.', false),
(2, 'Goal Completed!', 'You reached your target of $5,000 for the Europe Vacation goal!', true);
