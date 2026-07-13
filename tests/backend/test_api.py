import pytest
import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add root folder to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.main import app
from app.database import Base, get_db

# Isolated test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api_database.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    # Clean up local file
    if os.path.exists("./test_api_database.db"):
        os.remove("./test_api_database.db")

def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert "AI Financial Health" in res.json()["message"]

def test_user_lifecycle():
    # 1. Register User
    reg_payload = {
        "email": "tester@example.com",
        "password": "testpassword",
        "full_name": "Test User"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    assert reg_res.json()["email"] == "tester@example.com"
    
    # 2. Login User
    login_data = {
        "username": "tester@example.com",
        "password": "testpassword"
      }
    login_res = client.post("/api/auth/login", data=login_data)
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    assert token is not None
    
    # 3. Read profile (Authenticated)
    headers = {"Authorization": f"Bearer {token}"}
    profile_res = client.get("/api/auth/profile", headers=headers)
    assert profile_res.status_code == 200
    assert profile_res.json()["full_name"] == "Test User"

def test_unauthorized_route():
    # Attempt profile read without auth token
    res = client.get("/api/auth/profile")
    assert res.status_code == 401
