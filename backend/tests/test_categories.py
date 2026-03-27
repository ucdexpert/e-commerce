import pytest
from fastapi.testclient import TestClient


def test_get_categories(client):
    """Test fetching all categories"""
    response = client.get("/api/categories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_category(client, admin_headers):
    """Test creating a new category (admin only)"""
    response = client.post("/api/categories", json={
        "name": "Electronics",
        "slug": "electronics",
        "description": "Electronic devices and accessories",
        "is_active": True
    }, headers=admin_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Electronics"
    assert "id" in data


def test_create_category_unauthorized(client):
    """Test creating category without admin rights fails"""
    response = client.post("/api/categories", json={
        "name": "Test Category",
        "slug": "test-category"
    })
    assert response.status_code == 401


def test_get_category_by_slug(client, admin_headers):
    """Test fetching category by slug"""
    # Create category first
    create_response = client.post("/api/categories", json={
        "name": "Books",
        "slug": "books",
        "description": "Books and literature"
    }, headers=admin_headers)
    assert create_response.status_code == 201
    
    # Fetch by slug
    response = client.get("/api/categories/books")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "books"


def test_update_category(client, admin_headers):
    """Test updating a category"""
    # Create category
    create_response = client.post("/api/categories", json={
        "name": "Toys",
        "slug": "toys"
    }, headers=admin_headers)
    category_id = create_response.json()["id"]
    
    # Update category
    response = client.put(f"/api/categories/{category_id}", json={
        "name": "Toys & Games",
        "description": "Fun toys and games for all ages"
    }, headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Toys & Games"


def test_delete_category(client, admin_headers):
    """Test deleting a category"""
    # Create category
    create_response = client.post("/api/categories", json={
        "name": "Delete Me",
        "slug": "delete-me"
    }, headers=admin_headers)
    category_id = create_response.json()["id"]
    
    # Delete category
    response = client.delete(f"/api/categories/{category_id}", headers=admin_headers)
    assert response.status_code == 200
    
    # Verify deletion
    get_response = client.get(f"/api/categories/{category_id}")
    assert get_response.status_code == 404


def test_get_category_products(client, admin_headers):
    """Test fetching products in a category"""
    # Create category
    create_response = client.post("/api/categories", json={
        "name": "Sports",
        "slug": "sports"
    }, headers=admin_headers)
    category_id = create_response.json()["id"]
    
    # Get category products (should be empty)
    response = client.get(f"/api/categories/{category_id}/products")
    assert response.status_code == 200
    assert response.json() == []


def test_category_slug_uniqueness(client, admin_headers):
    """Test that category slugs must be unique"""
    # Create first category
    client.post("/api/categories", json={
        "name": "Unique Category",
        "slug": "unique-slug"
    }, headers=admin_headers)
    
    # Try to create another with same slug
    response = client.post("/api/categories", json={
        "name": "Duplicate Category",
        "slug": "unique-slug"
    }, headers=admin_headers)
    assert response.status_code == 400


def test_toggle_category_active(client, admin_headers):
    """Test toggling category active status"""
    # Create category
    create_response = client.post("/api/categories", json={
        "name": "Active Test",
        "slug": "active-test",
        "is_active": True
    }, headers=admin_headers)
    category_id = create_response.json()["id"]
    
    # Toggle active status
    response = client.patch(f"/api/categories/{category_id}/toggle-active", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] == False
