# AI Financial Health Score Platform

A production-ready, full-stack financial health evaluation platform designed with a premium fintech aesthetic. It analyzes transactional ledgers, loan balances, asset investments, and goals, using an XGBoost Regressor to calculate an optimized Financial Health Score (0-1000).

## 🚀 Key Features

* **Financial Health Score (0-1000)**: Real-time scoring calculated from six weighted pillars (Savings, Debt, Credit, Investments, Stability, Emergency fund) using XGBoost.
* **Premium Fintech Dashboard**: Interactive line, bar, and doughnut charts tracking net worth, cash flow trends, and category allocations.
* **Hybrid Advisor Engine**: Rules-based insights coupled with an LLM-ready context builder.
* **Interactive AI Chatbot**: Chat assistant offering contextual financial advice linked to the user's live indicators.
* **Budget Tracker & Goal Vaults**: Interactive monthly expense limit tracking and progress sliders for saving funds.
* **Secure PDF Reports**: In-memory generated PDF health summaries showing indicators and priority actions.
* **Data Portability**: Export transactions directly to standard CSV spreadsheets.

---

## 🛠️ Tech Stack

* **Frontend**: React, Vite, TypeScript, Tailwind CSS, Framer Motion, Chart.js, Axios
* **Backend**: Python, FastAPI, SQLAlchemy (PostgreSQL / SQLite), Pydantic, PyJWT, Passlib, ReportLab
* **Machine Learning**: XGBoost, Scikit-Learn, Pandas, NumPy, Joblib

---

## 📂 Folder Structure

```
financial-health-score/
├── .github/workflows/   # GitHub Actions CI/CD workflows
├── backend/             # FastAPI application, auth routers, PDF/CSV exporters
├── database/            # PostgreSQL schema definitions and seed data
├── docker/              # Central Nginx config files
├── docs/                # REST API documentation
├── frontend/            # Vite + React, Tailwind CSS, Chart.js, Framer Motion UI
├── ml-model/            # XGBoost training pipeline and prediction wrapper
├── tests/               # Backend integration, ML models, and UI specs tests
├── docker-compose.yml   # Compose orchestration for db, backend, and frontend
├── .env.example         # Template environment variables file
└── README.md            # Project readme docs
```

---

## 🐳 Docker Compose Deployment (Recommended)

To launch the database, FastAPI backend, React frontend, and Nginx proxy in a single command, execute the following at the project root:

1. **Clone and Navigate**:
   Ensure you are in the `financial-health-score` folder.

2. **Setup Env**:
   Copy the example environment settings:
   ```bash
   cp .env.example .env
   ```

3. **Launch Docker**:
   ```bash
   docker-compose up --build -d
   ```

4. **Verify App status**:
   * Frontend: Access [http://localhost](http://localhost) (mapped on port 80).
   * Backend APIs: Access [http://localhost:8000/docs](http://localhost:8000/docs) to view Swagger documentation.

---

## 💻 Local Developer Installation

If you prefer to run services manually outside Docker:

### 1. Backend & ML Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install -r ../ml-model/requirements.txt
   ```
4. Set fallback database env settings (by default, the application will create a local `financial_health.db` SQLite file if no PostgreSQL connection is provided):
   ```bash
   # Run server in development mode
   uvicorn app.main:app --reload --port 8000
   ```
   *Note: At startup, the backend automatically detects if `model.pkl` is missing and runs the XGBoost training script to generate it before booting the web server.*

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Boot the Vite dev server:
   ```bash
   npm run dev
   ```
4. Access the web interface at [http://localhost:3000](http://localhost:3000). The Dev proxy will automatically forward `/api/*` calls to the local FastAPI port.

---

## 📈 ML Pipeline: Training the Model

To train or retrain the XGBoost model manually:

1. Navigate to the `ml-model` folder:
   ```bash
   cd ml-model
   ```
2. Execute the training script:
   ```bash
   python train.py
   ```
This will:
* Synthesize 10,000 financial profiles incorporating spending behaviors, loan EMIs, and savings rates.
* Apply `StandardScaler` to features.
* Train an XGBoost Regressor model.
* Print MSE, RMSE, R-squared evaluation metrics, and feature importances.
* Save `model.pkl` and `scaler.pkl` to the directory.

*Note: Admins can also trigger retraining on-demand via the Admin Dashboard page in the UI.*

---

## 🧪 Running Tests

To verify backend routing, ML logic, and frontend layouts:

* **Backend and ML Tests**:
  ```bash
  python -m pytest tests/backend/
  python -m pytest tests/ml/
  ```
* **Frontend UI Layout Tests**:
  ```bash
  cd frontend
  npm run test # Playwright specs runner
  ```

---

## 🔐 Credentials & Seeding

The database auto-seeds two standard demo accounts for evaluation:

1. **Standard User**:
   * Email: `user@financialhealth.com`
   * Password: `password123`
   * Details: Initial transactions (Salary, Rent, Utilities, Dining out) and active car loans loaded.
2. **Administrator User**:
   * Email: `admin@financialhealth.com`
   * Password: `password123`
   * Details: Access to XGBoost model retraining buttons and feature importance charts.
