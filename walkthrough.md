# Technical Walkthrough: AI Financial Health Score Platform

This document provides a detailed overview of the completed codebase, architectural design, database structures, machine learning engine, and deployment assets.

---

## 🔗 Key Source Files Links

Here are links to the primary code segments implemented:

* **Entry Points**:
  * FastAPI Backend Main: [main.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/main.py)
  * React Frontend Main: [main.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/main.tsx)
  * React Routing Hub: [App.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/App.tsx)
* **Scoring & Machine Learning**:
  * XGBoost Training Script: [train.py](file:///c:/Users/karth/Financial_health/financial-health-score/ml-model/train.py)
  * Predictor Interface Class: [predict.py](file:///c:/Users/karth/Financial_health/financial-health-score/ml-model/predict.py)
  * Score Calculation Engine: [score_calculator.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/services/score_calculator.py)
* **Core Services**:
  * Recommendation Engine: [recommendation_engine.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/services/recommendation_engine.py)
  * PDF Report Builder: [pdf_report.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/services/pdf_report.py)
  * CSV Exporter: [csv_export.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/services/csv_export.py)
* **Frontend Pages & Components**:
  * Interactive Dashboard: [Dashboard.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/pages/Dashboard.tsx)
  * Gauge score metrics: [FinancialScore.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/pages/FinancialScore.tsx)
  * Transaction Ledger lists: [Transactions.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/pages/Transactions.tsx)
  * AI Chatbot UI: [FloatingChatbot.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/components/Chatbot/FloatingChatbot.tsx)
  * Reusable UI elements: [CustomUI.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/components/ui/CustomUI.tsx)

---

## 🛠️ Component Implementation Details

### 1. Database & Seeding
* **Schema**: Defined in [schema.sql](file:///c:/Users/karth/Financial_health/financial-health-score/database/schema.sql), configuring relationships with cascade deletes across eight key tables.
* **Seed**: Populated in [seed.sql](file:///c:/Users/karth/Financial_health/financial-health-score/database/seed.sql) with hashed credentials for testing (`password123` via bcrypt).
* **Automatic Registration Seeding**: To guarantee a rich UI experience on new user registrations, [auth.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/routes/auth.py) runs an automated seeding process that populates transactions, car loans, investments, and notifications on registration.

### 2. FastAPI REST API (Backend)
* **Security & Auth**: Secure routes are protected by a JWT validator in [auth.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/auth.py).
* **Endpoints**: 
  * Transactions Log: CRUD routes defined in [transactions.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/routes/transactions.py).
  * Analytics Aggregations: [analytics.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/routes/analytics.py) computes categorical spending splits, loan EMIs, asset values, and recent lists in a single fast call.
  * PDF report: [pdf_report.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/services/pdf_report.py) uses SimpleDocTemplate to dynamically compile tables of metrics, custom styles, and a list of urgent recommendations, outputting it as a download byte-stream.
  * Notifications: CRUD routes defined in [notifications.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/routes/notifications.py) update unread flags.

### 3. XGBoost Scoring Pipeline
* **Model Training**: Configured in [train.py](file:///c:/Users/karth/Financial_health/financial-health-score/ml-model/train.py). Synthesizes 10,000 profiles mapping savings, debt (DTI), credit card limits, and emergency buffers, fitting an XGBRegressor to minimize MSE.
* **Predictor Wrapper**: [predict.py](file:///c:/Users/karth/Financial_health/financial-health-score/ml-model/predict.py) contains a fallback rule-based analyzer in case pickle files are not found or training has not run, avoiding server start failures.
* **Retraining Hook**: [ml.py](file:///c:/Users/karth/Financial_health/financial-health-score/backend/app/routes/ml.py) exposes a POST `/api/ml/train-model` route restricted to Admin users. It delegates retraining to a background task so uvicorn doesn't block request threads.

### 4. React Single Page App (Frontend)
* **Dark/Light Theme**: Persisted using [ThemeContext.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/context/ThemeContext.tsx).
* **Custom UI widgets**: Outlined in [CustomUI.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/components/ui/CustomUI.tsx). Includes cards, buttons, input bars, badges, and modals styled with modern, glowing fintech gradients (indigo, purple, blue).
* **Interactive Charting**: Uses Chart.js wrappers to draw spending breakdowns and cash flows.
* **Budget and Savings velocity**: Displays horizontal budget trackers in [Savings.tsx](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/src/pages/Savings.tsx) and sliders to simulate salary adjustments.
* **Context-Aware AI Chatbot**: The floating robot widget parses user indicators (liabilities, savings limits) and gives customized replies (e.g. telling the user to pay card balances or increase emergency fund counts).

### 5. Docker Orchestration & Nginx
* **Proxy**: Outlined in [nginx.conf](file:///c:/Users/karth/Financial_health/financial-health-score/frontend/nginx.conf). Configured inside the frontend container to proxy API requests to backend endpoints.
* **Docker Compose**: Tethers PostgreSQL (`db`), FastAPI (`backend`), and React/Nginx (`frontend`) containers together with healthcheck intervals in [docker-compose.yml](file:///c:/Users/karth/Financial_health/financial-health-score/docker-compose.yml).

### 6. Automated Tests
* **Backend API tests**: Verified using pytest TestClient in [test_api.py](file:///c:/Users/karth/Financial_health/financial-health-score/tests/backend/test_api.py).
* **ML model tests**: Boundary test checks in [test_model.py](file:///c:/Users/karth/Financial_health/financial-health-score/tests/ml/test_model.py).
* **CI/CD pipeline**: Set up in [ci-cd.yml](file:///c:/Users/karth/Financial_health/financial-health-score/.github/workflows/ci-cd.yml) to run tests and verify compile packages on push.
