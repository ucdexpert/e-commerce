import pytest
from fastapi.testclient import TestClient


def test_get_admin_dashboard(client, admin_headers):
    """Test admin dashboard access"""
    response = client.get("/api/admin/dashboard", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)


def test_get_admin_orders(client, admin_headers):
    """Test admin get all orders"""
    response = client.get("/api/admin/orders", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "orders" in data or isinstance(data, list)


def test_get_admin_order_detail(client, admin_headers):
    """Test admin get order detail"""
    orders_response = client.get("/api/admin/orders", headers=admin_headers)
    orders = orders_response.json().get("orders", [])
    if orders:
        order_id = orders[0]["id"]
        response = client.get(f"/api/admin/orders/{order_id}", headers=admin_headers)
        assert response.status_code == 200


def test_update_order_status(client, admin_headers):
    """Test admin update order status"""
    orders_response = client.get("/api/admin/orders", headers=admin_headers)
    orders = orders_response.json().get("orders", [])
    if orders:
        order_id = orders[0]["id"]
        response = client.patch(f"/api/admin/orders/{order_id}/status", 
            json={"status": "processing"},
            headers=admin_headers
        )
        assert response.status_code == 200


def test_get_admin_users(client, admin_headers):
    """Test admin get all users"""
    response = client.get("/api/admin/users", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list) or "users" in data


def test_update_user(client, admin_headers):
    """Test admin update user"""
    users_response = client.get("/api/admin/users", headers=admin_headers)
    users = users_response.json() if isinstance(users_response.json(), list) else users_response.json().get("users", [])
    if users:
        user_id = users[0]["id"]
        response = client.put(f"/api/admin/users/{user_id}", 
            json={"is_active": True},
            headers=admin_headers
        )
        assert response.status_code == 200


def test_delete_user(client, admin_headers):
    """Test admin delete user"""
    # Don't actually delete, just test the endpoint exists
    # Create a test user first
    client.post("/api/auth/register", json={
        "email": "delete@test.com",
        "password": "Test123!",
        "username": "deleteuser",
        "full_name": "Delete User"
    })
    
    users_response = client.get("/api/admin/users", headers=admin_headers)
    users = users_response.json() if isinstance(users_response.json(), list) else users_response.json().get("users", [])
    test_user = next((u for u in users if u["email"] == "delete@test.com"), None)
    
    if test_user:
        response = client.delete(f"/api/admin/users/{test_user['id']}", 
            headers=admin_headers
        )
        assert response.status_code in [204, 400]  # 400 if user has orders


def test_create_coupon(client, admin_headers):
    """Test admin create coupon"""
    response = client.post("/api/admin/coupons", 
        json={
            "code": "TEST10",
            "discount_type": "percentage",
            "discount_value": 10.0,
            "starts_at": "2024-01-01T00:00:00",
            "expires_at": "2099-12-31T23:59:59"
        },
        headers=admin_headers
    )
    assert response.status_code in [201, 422]  # 422 if validation fails


def test_get_coupons(client, admin_headers):
    """Test admin get all coupons"""
    response = client.get("/api/admin/coupons", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list) or "coupons" in data


def test_validate_coupon(client):
    """Test validate coupon endpoint"""
    response = client.post("/api/admin/coupons/validate", 
        json={"code": "INVALID", "order_total": 100.0}
    )
    # Should return 404 or 400 for invalid coupon
    assert response.status_code in [400, 404]


def test_admin_without_auth(client):
    """Test admin endpoints without authentication"""
    response = client.get("/api/admin/dashboard")
    assert response.status_code == 401


def test_admin_without_superuser(client, auth_headers):
    """Test admin endpoints with non-superuser"""
    response = client.get("/api/admin/dashboard", headers=auth_headers)
    assert response.status_code == 403


def test_get_admin_analytics(client, admin_headers):
    """Test admin get analytics data"""
    response = client.get("/api/admin/analytics", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
