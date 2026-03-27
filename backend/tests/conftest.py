import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.database import Base, get_db
import os

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql://testuser:testpass@localhost:5432/testdb"
)

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Create all tables before tests and drop them after"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db():
    """Provide database session for tests"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def override_get_db():
    """Override get_db dependency for testing"""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override the get_db dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture()
def client():
    """Provide test client for API testing"""
    return TestClient(app)


@pytest.fixture()
def auth_headers(client):
    """Provide authenticated headers for protected endpoints"""
    # Register test user
    client.post("/api/auth/register", json={
        "email": "test@test.com",
        "password": "Test123!",
        "username": "testuser",
        "full_name": "Test User"
    })
    # Login
    response = client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "Test123!"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_headers(client):
    """Provide admin authenticated headers"""
    from app.models.user import User
    from app.core.database import SessionLocal
    db = SessionLocal()
    user = db.query(User).filter(User.email == "test@test.com").first()
    if user:
        user.is_superuser = True
        db.commit()
    db.close()
    response = client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "Test123!"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
