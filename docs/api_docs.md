# AI Financial Health Score Platform - REST API Reference

All requests must use `Content-Type: application/json` unless otherwise specified.
Authenticated endpoints require a `Authorization: Bearer <JWT_TOKEN>` header.

---

## Authentication APIs

### 1. Register User
- **Method & Route**: `POST /api/auth/register`
- **Description**: Registers a user and populates baseline demo indicators (transactions, loans, investments).
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 2,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "created_at": "2026-07-13T12:00:00Z"
  }
  ```

### 2. User Login
- **Method & Route**: `POST /api/auth/login`
- **Description**: Authenticates users and returns a JWT access token.
- **Request Format**: `application/x-www-form-urlencoded`
- **Form Data**:
  - `username`: Email address
  - `password`: Plain-text password
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer"
  }
  ```

### 3. Read Profile
- **Method & Route**: `GET /api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "id": 2,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "created_at": "2026-07-13T12:00:00Z"
  }
  ```

---

## Transaction Ledger APIs

### 1. Log Transaction
- **Method & Route**: `POST /api/transactions`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "amount": 250.00,
    "type": "expense",
    "category": "Groceries",
    "description": "Weekly supermarket run",
    "date": "2026-07-13T12:30:00Z"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": 42,
    "user_id": 2,
    "amount": 250.00,
    "type": "expense",
    "category": "Groceries",
    "description": "Weekly supermarket run",
    "date": "2026-07-13T12:30:00Z"
  }
  ```

### 2. Fetch Transactions
- **Method & Route**: `GET /api/transactions`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `category` (optional): Filter by name (e.g. `Rent`)
  - `type` (optional): `income` or `expense`
  - `limit` (default: 100): Page limit
  - `offset` (default: 0): Page offset
- **Response (200 OK)**: Array of transaction objects.

### 3. Delete Transaction
- **Method & Route**: `DELETE /api/transactions/{id}`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `204 No Content`

### 4. Export Transactions (CSV)
- **Method & Route**: `GET /api/transactions/export`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Plain text CSV file attachment download.

---

## Scoring & Analytics APIs

### 1. Get Financial Score
- **Method & Route**: `GET /api/financial-score`
- **Description**: Returns current or cached score calculated today.
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "user_id": 2,
    "score": 710,
    "savings_rate": 0.2500,
    "debt_ratio": 0.2200,
    "credit_usage": 0.2800,
    "investment_ratio": 0.1500,
    "emergency_fund_ratio": 4.2000,
    "created_at": "2026-07-13T12:00:00Z"
  }
  ```

### 2. Force Recalculate Score
- **Method & Route**: `POST /api/financial-score/recalculate`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Re-calculated financial score object.

### 3. Get Score History
- **Method & Route**: `GET /api/financial-score/history`
- **Response (200 OK)**: Chronological list of historical score objects.

### 4. Export Report (PDF)
- **Method & Route**: `GET /api/financial-score/report`
- **Response (200 OK)**: PDF file attachment download.

### 5. Fetch Dashboard Analytics
- **Method & Route**: `GET /api/analytics/dashboard`
- **Description**: Aggregates ledger indicators (net worth, cash flow trends, category totals).
- **Response (200 OK)**: Object containing sub-keys: `summary`, `spending_by_category`, `monthly_cash_flow`, `investment_allocation`, `loans`, `goals`, and `recent_transactions`.

---

## Machine Learning APIs

### 1. Predict Raw Score (JSON Evaluation)
- **Method & Route**: `POST /api/ml/predict`
- **Request Body**:
  ```json
  {
    "income": 6000.0,
    "monthly_expenses": 3200.0,
    "savings_rate": 0.46,
    "debt_ratio": 0.25,
    "credit_utilization": 0.35,
    "investment_amount": 800.0,
    "emergency_fund_months": 3.0,
    "income_stability": 0.85,
    "repayment_history": 1.0
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "score": 680,
    "rating": "Fair",
    "features_received": { ... }
  }
  ```

### 2. Retrain Model
- **Method & Route**: `POST /api/ml/train-model`
- **Headers**: `Authorization: Bearer <admin_token>`
- **Description**: Triggers asynchronous background task to retrain XGBoost model.
- **Response (202 Accepted)**:
  ```json
  {
    "status": "retraining",
    "message": "Model training process queued in background."
  }
  ```

### 3. Get Feature Importance
- **Method & Route**: `GET /api/ml/feature-importance`
- **Response (200 OK)**: Array of feature labels and significance weights.
