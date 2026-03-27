import pytest
from fastapi.testclient import TestClient


def test_get_products(client):
    """Test get all products"""
    response = client.get("/api/products/")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data
    assert "total" in data


def test_get_products_with_filters(client):
    """Test get products with filters"""
    response = client.get("/api/products/?is_featured=true&per_page=5")
    assert response.status_code == 200
    data = response.json()
    assert "products" in data


def test_get_products_pagination(client):
    """Test product pagination"""
    response = client.get("/api/products/?page=1&per_page=10")
    assert response.status_code == 200
    data = response.json()
    assert "total_pages" in data


def test_get_product_by_id(client):
    """Test get product by ID"""
    # Get first product
    products_response = client.get("/api/products/")
    products = products_response.json()["products"]
    if products:
        product_id = products[0]["id"]
        response = client.get(f"/api/products/{product_id}")
        assert response.status_code == 200
        assert "id" in response.json()


def test_get_product_by_slug(client):
    """Test get product by slug"""
    products_response = client.get("/api/products/")
    products = products_response.json()["products"]
    if products:
        slug = products[0]["slug"]
        response = client.get(f"/api/products/slug/{slug}")
        assert response.status_code == 200
        assert response.json()["slug"] == slug


def test_get_categories(client):
    """Test get categories"""
    response = client.get("/api/categories/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_all_categories(client):
    """Test get all categories including children"""
    response = client.get("/api/categories/all")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_search_products(client):
    """Test product search"""
    response = client.get("/api/search/suggestions?q=test")
    assert response.status_code == 200
    data = response.json()
    assert "suggestions" in data or isinstance(data, list)


def test_search_products_query(client):
    """Test product search with query"""
    response = client.get("/api/search/?q=test")
    assert response.status_code == 200


def test_get_product_reviews(client):
    """Test get product reviews"""
    products_response = client.get("/api/products/")
    products = products_response.json()["products"]
    if products:
        product_id = products[0]["id"]
        response = client.get(f"/api/products/{product_id}/reviews")
        assert response.status_code == 200


def test_get_related_products(client):
    """Test get related products"""
    products_response = client.get("/api/products/")
    products = products_response.json()["products"]
    if products:
        product_id = products[0]["id"]
        response = client.get(f"/api/products/{product_id}/related")
        assert response.status_code == 200


def test_create_product_unauthorized(client):
    """Test create product without auth fails"""
    response = client.post("/api/products/", json={
        "name": "Test Product",
        "price": 99.99,
        "description": "Test Description"
    })
    assert response.status_code == 401


def test_get_flash_sales(client):
    """Test get flash sale products"""
    response = client.get("/api/products/flash-sales")
    assert response.status_code == 200
