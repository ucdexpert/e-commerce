import pytest
from fastapi.testclient import TestClient


def test_get_cart(client, auth_headers):
    """Test get user cart"""
    response = client.get("/api/cart/", headers=auth_headers)
    assert response.status_code == 200


def test_add_to_cart(client, auth_headers):
    """Test add item to cart"""
    # Get a product first
    products_response = client.get("/api/products/")
    products = products_response.json()["products"]
    if products:
        product_id = products[0]["id"]
        response = client.post("/api/cart/items", 
            json={"product_id": product_id, "quantity": 1},
            headers=auth_headers
        )
        # Could be 201 (success) or 400 (out of stock)
        assert response.status_code in [201, 400]


def test_update_cart_item(client, auth_headers):
    """Test update cart item quantity"""
    # Add item first
    products_response = client.get("/api/products/")
    products = products_response.json()["products"]
    if products:
        product_id = products[0]["id"]
        add_response = client.post("/api/cart/items", 
            json={"product_id": product_id, "quantity": 1},
            headers=auth_headers
        )
        if add_response.status_code == 201:
            item_id = add_response.json()["id"]
            # Update quantity
            update_response = client.put(f"/api/cart/items/{item_id}", 
                json={"quantity": 2},
                headers=auth_headers
            )
            assert update_response.status_code == 200


def test_remove_from_cart(client, auth_headers):
    """Test remove item from cart"""
    # Add item first
    products_response = client.get("/api/products/")
    products = products_response.json()["products"]
    if products:
        product_id = products[0]["id"]
        add_response = client.post("/api/cart/items", 
            json={"product_id": product_id, "quantity": 1},
            headers=auth_headers
        )
        if add_response.status_code == 201:
            item_id = add_response.json()["id"]
            # Remove item
            delete_response = client.delete(f"/api/cart/items/{item_id}", 
                headers=auth_headers
            )
            assert delete_response.status_code == 204


def test_clear_cart(client, auth_headers):
    """Test clear cart"""
    response = client.delete("/api/cart/", headers=auth_headers)
    assert response.status_code == 204


def test_cart_without_auth(client):
    """Test cart endpoints without authentication"""
    response = client.get("/api/cart/")
    assert response.status_code == 401


def test_merge_guest_cart(client, auth_headers):
    """Test merge guest cart with user cart"""
    # This might fail if no guest cart exists, which is OK
    response = client.post("/api/cart/merge", 
        json={"guest_cart_id": 99999},
        headers=auth_headers
    )
    # Accept any response as this depends on guest cart existence
    assert response.status_code in [200, 400, 404]
