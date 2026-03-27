import pytest
from fastapi.testclient import TestClient


def test_register(client):
    """Test user registration"""
    response = client.post("/api/auth/register", json={
        "email": "newuser@test.com",
        "password": "Test123!",
        "username": "newuser",
        "full_name": "New User"
    })
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["email"] == "newuser@test.com"


def test_register_duplicate_email(client):
    """Test registration with duplicate email fails"""
    # First registration
    client.post("/api/auth/register", json={
        "email": "dup@test.com",
        "password": "Test123!",
        "username": "user1",
        "full_name": "User 1"
    })
    # Second registration with same email
    response = client.post("/api/auth/register", json={
        "email": "dup@test.com",
        "password": "Test123!",
        "username": "user2",
        "full_name": "User 2"
    })
    assert response.status_code == 400


def test_login(client):
    """Test user login"""
    # Register first
    client.post("/api/auth/register", json={
        "email": "login@test.com",
        "password": "Test123!",
        "username": "loginuser",
        "full_name": "Login User"
    })
    # Login
    response = client.post("/api/auth/login", json={
        "email": "login@test.com",
        "password": "Test123!"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert "refresh_token" in response.json()


def test_login_wrong_password(client):
    """Test login with wrong password fails"""
    response = client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "WrongPass123!"
    })
    assert response.status_code == 401


def test_get_me(client, auth_headers):
    """Test get current user endpoint"""
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert "email" in response.json()


def test_get_profile(client, auth_headers):
    """Test get profile endpoint"""
    response = client.get("/api/auth/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "username" in data


def test_update_user(client, auth_headers):
    """Test update user endpoint"""
    response = client.put("/api/auth/me", json={
        "full_name": "Updated Name"
    }, headers=auth_headers)
    assert response.status_code == 200


def test_forgot_password(client):
    """Test forgot password endpoint"""
    response = client.post("/api/auth/forgot-password", json={
        "email": "test@test.com"
    })
    # Should return 200 even if email doesn't exist (security)
    assert response.status_code == 200


def test_refresh_token(client, auth_headers):
    """Test token refresh"""
    # Login to get refresh token
    login_response = client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "Test123!"
    })
    refresh_token = login_response.json()["refresh_token"]
    
    # Refresh token
    response = client.post("/api/auth/refresh", json={
        "refresh_token": refresh_token
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
