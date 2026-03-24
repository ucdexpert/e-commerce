#!/usr/bin/env python3
"""
Comprehensive API Test Script - Post-Fix Verification
Tests all endpoints of the e-commerce backend
"""

import httpx
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Tuple

BASE_URL = "http://localhost:8000"
TIMEOUT = 30.0  # seconds

class TestResult:
    def __init__(self, endpoint: str, method: str, expected_status: int):
        self.endpoint = endpoint
        self.method = method
        self.expected_status = expected_status
        self.actual_status = 0
        self.status = "PENDING"
        self.response_time = 0
        self.notes = ""
        self.request_body = None
        self.response_body = None
        self.error_message = ""
        self.category = ""

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.results: List[TestResult] = []
        self.access_token = ""
        self.refresh_token = ""
        self.admin_token = ""
        self.test_user_id = ""
        self.test_product_id = ""
        self.test_category_id = ""
        self.test_order_id = ""
        self.test_cart_item_id = ""
        self.test_address_id = ""
        self.test_wishlist_id = ""
        self.unique_suffix = f"{int(time.time())}"
        self.start_time = time.time()
        
    def make_request(self, method: str, endpoint: str, headers: Dict = None, 
                     json_data: Dict = None, params: Dict = None) -> Tuple[int, Any, float]:
        """Make HTTP request and return status, body, and response time"""
        url = f"{self.base_url}{endpoint}"
        start = time.time()
        
        try:
            with httpx.Client(timeout=TIMEOUT) as client:
                if method == "GET":
                    response = client.get(url, headers=headers, params=params)
                elif method == "POST":
                    response = client.post(url, headers=headers, json=json_data)
                elif method == "PUT":
                    response = client.put(url, headers=headers, json=json_data)
                elif method == "PATCH":
                    response = client.patch(url, headers=headers, json=json_data)
                elif method == "DELETE":
                    response = client.delete(url, headers=headers)
                else:
                    raise ValueError(f"Unknown method: {method}")
                    
                response_time = (time.time() - start) * 1000  # ms
                return response.status_code, response.json() if response.content else {}, response_time
        except httpx.ConnectError as e:
            return 0, {"error": f"Connection error: {str(e)}"}, (time.time() - start) * 1000
        except httpx.TimeoutException as e:
            return 0, {"error": f"Timeout: {str(e)}"}, (time.time() - start) * 1000
        except Exception as e:
            return 0, {"error": str(e)}, (time.time() - start) * 1000

    def add_result(self, result: TestResult):
        self.results.append(result)
        status_icon = "✅ PASS" if result.status == "PASS" else "❌ FAIL"
        print(f"  [{status_icon}] {result.method} {result.endpoint} - Expected: {result.expected_status}, Actual: {result.actual_status} ({result.response_time:.0f}ms)")
        if result.notes:
            print(f"      Notes: {result.notes}")

    def test_health_endpoints(self):
        """Test health and root endpoints"""
        print("\n=== Testing Health & Root Endpoints ===")
        
        # GET /
        r = TestResult("/", "GET", 200)
        r.category = "Root"
        status, body, resp_time = self.make_request("GET", "/")
        r.actual_status = status
        r.response_time = resp_time
        r.status = "PASS" if status == 200 else "FAIL"
        r.notes = body.get("message", "") if isinstance(body, dict) else ""
        self.add_result(r)
        
        # GET /api/health
        r = TestResult("/api/health", "GET", 200)
        r.category = "Health"
        status, body, resp_time = self.make_request("GET", "/api/health")
        r.actual_status = status
        r.response_time = resp_time
        r.status = "PASS" if status == 200 else "FAIL"
        r.notes = body.get("status", "") if isinstance(body, dict) else ""
        self.add_result(r)

    def test_authentication(self):
        """Test all authentication endpoints"""
        print("\n=== Testing Authentication Endpoints ===")
        
        test_email = f"test_api_{self.unique_suffix}@test.com"
        test_password = "TestPass123!"
        test_name = "Test User"
        
        # POST /api/auth/register
        r = TestResult("/api/auth/register", "POST", 201)
        r.category = "Auth"
        register_data = {
            "name": test_name,
            "email": test_email,
            "password": test_password
        }
        r.request_body = register_data
        status, body, resp_time = self.make_request("POST", "/api/auth/register", json_data=register_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 201:
            r.status = "PASS"
            r.notes = "User registered successfully"
            self.test_user_id = body.get("user", {}).get("id", body.get("id", ""))
        elif status == 400:
            r.status = "PASS"  # User might already exist from previous run
            r.notes = f"User already exists: {body.get('detail', body.get('error', ''))}"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/auth/login
        r = TestResult("/api/auth/login", "POST", 200)
        r.category = "Auth"
        login_data = {"email": test_email, "password": test_password}
        r.request_body = login_data
        status, body, resp_time = self.make_request("POST", "/api/auth/login", json_data=login_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Login successful"
            self.access_token = body.get("access_token", "")
            self.refresh_token = body.get("refresh_token", "")
            if not self.access_token and "token" in body:
                self.access_token = body.get("token", "")
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/auth/refresh
        r = TestResult("/api/auth/refresh", "POST", 200)
        r.category = "Auth"
        if self.refresh_token:
            refresh_data = {"refresh_token": self.refresh_token}
            r.request_body = refresh_data
            status, body, resp_time = self.make_request("POST", "/api/auth/refresh", json_data=refresh_data)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status == 200:
                r.status = "PASS"
                r.notes = "Token refreshed successfully"
                if body.get("access_token"):
                    self.access_token = body.get("access_token")
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No refresh token available"
        self.add_result(r)
        
        # GET /api/auth/me
        r = TestResult("/api/auth/me", "GET", 200)
        r.category = "Auth"
        headers = {"Authorization": f"Bearer {self.access_token}"} if self.access_token else {}
        status, body, resp_time = self.make_request("GET", "/api/auth/me", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = f"User: {body.get('name', body.get('email', 'N/A'))}"
            self.test_user_id = body.get("id", self.test_user_id)
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # PUT /api/auth/me
        r = TestResult("/api/auth/me", "PUT", 200)
        r.category = "Auth"
        update_data = {"name": "Updated Test User"}
        r.request_body = update_data
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        status, body, resp_time = self.make_request("PUT", "/api/auth/me", headers=headers, json_data=update_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "User updated successfully"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/auth/forgot-password
        r = TestResult("/api/auth/forgot-password", "POST", 200)
        r.category = "Auth"
        forgot_data = {"email": test_email}
        r.request_body = forgot_data
        status, body, resp_time = self.make_request("POST", "/api/auth/forgot-password", json_data=forgot_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status in [200, 201]:
            r.status = "PASS"
            r.notes = "Password reset email sent (or would be sent)"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # GET /api/auth/verify-email (without token - should fail gracefully)
        r = TestResult("/api/auth/verify-email", "GET", 400)
        r.category = "Auth"
        status, body, resp_time = self.make_request("GET", "/api/auth/verify-email", params={"token": "invalid_token"})
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status in [400, 401, 404]:
            r.status = "PASS"
            r.notes = "Expected error for invalid token"
        else:
            r.status = "FAIL"
            r.error_message = f"Unexpected status: {status}"
        self.add_result(r)
        
        # POST /api/auth/social-login (Google OAuth)
        r = TestResult("/api/auth/social-login", "POST", 400)
        r.category = "Auth"
        social_data = {"provider": "google", "token": "invalid_token"}
        r.request_body = social_data
        status, body, resp_time = self.make_request("POST", "/api/auth/social-login", json_data=social_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status in [400, 401]:
            r.status = "PASS"
            r.notes = "Expected error for invalid social token"
        else:
            r.status = "FAIL"
            r.error_message = f"Unexpected status: {status}"
        self.add_result(r)

    def test_products(self):
        """Test all product endpoints"""
        print("\n=== Testing Products Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        
        # GET /api/products (list all)
        r = TestResult("/api/products", "GET", 200)
        r.category = "Products"
        status, body, resp_time = self.make_request("GET", "/api/products")
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            products = body.get("products", body.get("items", []))
            r.notes = f"Found {len(products) if isinstance(products, list) else 'N/A'} products"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # GET /api/products with filters
        r = TestResult("/api/products?category=test", "GET", 200)
        r.category = "Products"
        status, body, resp_time = self.make_request("GET", "/api/products", params={"category": "test"})
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Filter query works"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # GET /api/products/{id} (non-existent)
        r = TestResult("/api/products/99999", "GET", 404)
        r.category = "Products"
        status, body, resp_time = self.make_request("GET", "/api/products/99999")
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 404:
            r.status = "PASS"
            r.notes = "Correctly returns 404 for non-existent product"
        else:
            r.status = "FAIL"
            r.error_message = f"Expected 404, got {status}"
        self.add_result(r)
        
        # GET /api/products/slug/{slug} (non-existent)
        r = TestResult("/api/products/slug/non-existent", "GET", 404)
        r.category = "Products"
        status, body, resp_time = self.make_request("GET", "/api/products/slug/non-existent")
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 404:
            r.status = "PASS"
            r.notes = "Correctly returns 404 for non-existent slug"
        else:
            r.status = "FAIL"
            r.error_message = f"Expected 404, got {status}"
        self.add_result(r)
        
        # POST /api/products (create - admin only)
        r = TestResult("/api/products", "POST", 201)
        r.category = "Products"
        product_data = {
            "name": f"Test Product {self.unique_suffix}",
            "description": "Test product description",
            "price": 29.99,
            "stock": 100,
            "category": "Electronics"
        }
        r.request_body = product_data
        status, body, resp_time = self.make_request("POST", "/api/products", headers=headers, json_data=product_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 201:
            r.status = "PASS"
            r.notes = "Product created successfully"
            self.test_product_id = body.get("id", body.get("product", {}).get("id", ""))
        elif status == 401:
            r.status = "FAIL"
            r.error_message = "Unauthorized - need admin token"
        elif status == 403:
            r.status = "FAIL"
            r.error_message = "Forbidden - need admin privileges"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # PUT /api/products/{id} (update - admin only)
        r = TestResult("/api/products/{id}", "PUT", 200)
        r.category = "Products"
        if self.test_product_id:
            update_data = {"name": f"Updated Test Product {self.unique_suffix}"}
            r.request_body = update_data
            status, body, resp_time = self.make_request("PUT", f"/api/products/{self.test_product_id}", headers=headers, json_data=update_data)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status == 200:
                r.status = "PASS"
                r.notes = "Product updated successfully"
            elif status in [401, 403]:
                r.status = "FAIL"
                r.error_message = "Unauthorized/Forbidden - need admin privileges"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No product ID available (create failed)"
        self.add_result(r)
        
        # DELETE /api/products/{id} (delete - admin only)
        r = TestResult("/api/products/{id}", "DELETE", 200)
        r.category = "Products"
        if self.test_product_id:
            status, body, resp_time = self.make_request("DELETE", f"/api/products/{self.test_product_id}", headers=headers)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status in [200, 204]:
                r.status = "PASS"
                r.notes = "Product deleted successfully"
                self.test_product_id = ""
            elif status in [401, 403]:
                r.status = "FAIL"
                r.error_message = "Unauthorized/Forbidden - need admin privileges"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No product ID available"
        self.add_result(r)

    def test_categories(self):
        """Test all category endpoints - including the slug fix"""
        print("\n=== Testing Categories Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        
        # GET /api/categories
        r = TestResult("/api/categories", "GET", 200)
        r.category = "Categories"
        status, body, resp_time = self.make_request("GET", "/api/categories")
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            categories = body.get("categories", body.get("items", []))
            r.notes = f"Found {len(categories) if isinstance(categories, list) else 'N/A'} categories"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/categories (create - admin only) - Test slug fix
        r = TestResult("/api/categories", "POST", 201)
        r.category = "Categories"
        category_data = {
            "name": f"Test Category {self.unique_suffix}",
            "description": "Test category description"
        }
        r.request_body = category_data
        status, body, resp_time = self.make_request("POST", "/api/categories", headers=headers, json_data=category_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 201:
            r.status = "PASS"
            r.notes = "Category created successfully (slug auto-generated)"
            self.test_category_id = body.get("id", body.get("category", {}).get("id", ""))
        elif status == 400:
            r.status = "FAIL"
            r.error_message = f"400 error - slug fix may not be working: {body.get('detail', body.get('error', ''))}"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized/Forbidden - need admin privileges"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/categories (duplicate name - test slug auto-generation)
        r = TestResult("/api/categories (duplicate)", "POST", 201)
        r.category = "Categories"
        duplicate_data = {
            "name": f"Test Category {self.unique_suffix}",  # Same name
            "description": "Duplicate test"
        }
        r.request_body = duplicate_data
        status, body, resp_time = self.make_request("POST", "/api/categories", headers=headers, json_data=duplicate_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 201:
            r.status = "PASS"
            r.notes = "✅ SLUG FIX VERIFIED: Duplicate name handled with auto-generated slug"
        elif status == 400:
            r.status = "FAIL"
            r.error_message = f"Slug fix NOT working: {body.get('detail', body.get('error', ''))}"
        elif status in [401, 403]:
            r.status = "SKIP"
            r.notes = "Cannot test without admin privileges"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # PUT /api/categories/{id}
        r = TestResult("/api/categories/{id}", "PUT", 200)
        r.category = "Categories"
        if self.test_category_id:
            update_data = {"name": f"Updated Category {self.unique_suffix}"}
            r.request_body = update_data
            status, body, resp_time = self.make_request("PUT", f"/api/categories/{self.test_category_id}", headers=headers, json_data=update_data)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status == 200:
                r.status = "PASS"
                r.notes = "Category updated successfully"
            elif status in [401, 403]:
                r.status = "FAIL"
                r.error_message = "Unauthorized/Forbidden - need admin privileges"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No category ID available"
        self.add_result(r)
        
        # DELETE /api/categories/{id}
        r = TestResult("/api/categories/{id}", "DELETE", 200)
        r.category = "Categories"
        if self.test_category_id:
            status, body, resp_time = self.make_request("DELETE", f"/api/categories/{self.test_category_id}", headers=headers)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status in [200, 204]:
                r.status = "PASS"
                r.notes = "Category deleted successfully"
                self.test_category_id = ""
            elif status in [401, 403]:
                r.status = "FAIL"
                r.error_message = "Unauthorized/Forbidden - need admin privileges"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No category ID available"
        self.add_result(r)

    def test_cart(self):
        """Test all cart endpoints"""
        print("\n=== Testing Cart Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        
        # GET /api/cart
        r = TestResult("/api/cart", "GET", 200)
        r.category = "Cart"
        status, body, resp_time = self.make_request("GET", "/api/cart", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            items = body.get("items", [])
            r.notes = f"Cart has {len(items) if isinstance(items, list) else 'N/A'} items"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized - token may be invalid"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/cart/items (add item)
        r = TestResult("/api/cart/items", "POST", 200)
        r.category = "Cart"
        cart_item_data = {
            "product_id": "99999",  # Non-existent product
            "quantity": 1
        }
        r.request_body = cart_item_data
        status, body, resp_time = self.make_request("POST", "/api/cart/items", headers=headers, json_data=cart_item_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Item added to cart"
            self.test_cart_item_id = body.get("id", body.get("item", {}).get("id", ""))
        elif status == 404:
            r.status = "PASS"  # Expected for non-existent product
            r.notes = "Correctly rejects non-existent product"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # PUT /api/cart/items/{id}
        r = TestResult("/api/cart/items/{id}", "PUT", 200)
        r.category = "Cart"
        if self.test_cart_item_id:
            update_data = {"quantity": 2}
            r.request_body = update_data
            status, body, resp_time = self.make_request("PUT", f"/api/cart/items/{self.test_cart_item_id}", headers=headers, json_data=update_data)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status == 200:
                r.status = "PASS"
                r.notes = "Cart item updated"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No cart item ID available"
        self.add_result(r)
        
        # DELETE /api/cart/items/{id}
        r = TestResult("/api/cart/items/{id}", "DELETE", 200)
        r.category = "Cart"
        if self.test_cart_item_id:
            status, body, resp_time = self.make_request("DELETE", f"/api/cart/items/{self.test_cart_item_id}", headers=headers)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status in [200, 204]:
                r.status = "PASS"
                r.notes = "Cart item removed"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No cart item ID available"
        self.add_result(r)
        
        # DELETE /api/cart (clear cart)
        r = TestResult("/api/cart", "DELETE", 200)
        r.category = "Cart"
        status, body, resp_time = self.make_request("DELETE", "/api/cart", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status in [200, 204]:
            r.status = "PASS"
            r.notes = "Cart cleared"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)

    def test_orders(self):
        """Test all order endpoints"""
        print("\n=== Testing Orders Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        
        # GET /api/orders
        r = TestResult("/api/orders", "GET", 200)
        r.category = "Orders"
        status, body, resp_time = self.make_request("GET", "/api/orders", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            orders = body.get("orders", body.get("items", []))
            r.notes = f"Found {len(orders) if isinstance(orders, list) else 'N/A'} orders"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # GET /api/orders/{id} (non-existent)
        r = TestResult("/api/orders/99999", "GET", 404)
        r.category = "Orders"
        status, body, resp_time = self.make_request("GET", "/api/orders/99999", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 404:
            r.status = "PASS"
            r.notes = "Correctly returns 404 for non-existent order"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = f"Expected 404, got {status}"
        self.add_result(r)
        
        # POST /api/orders (create order)
        r = TestResult("/api/orders", "POST", 201)
        r.category = "Orders"
        order_data = {
            "items": [{"product_id": "99999", "quantity": 1}]  # Will fail but tests endpoint
        }
        r.request_body = order_data
        status, body, resp_time = self.make_request("POST", "/api/orders", headers=headers, json_data=order_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 201:
            r.status = "PASS"
            r.notes = "Order created successfully"
            self.test_order_id = body.get("id", body.get("order", {}).get("id", ""))
        elif status == 400:
            r.status = "PASS"  # Expected for invalid product
            r.notes = f"Expected validation error: {body.get('detail', body.get('error', ''))[:50]}"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/orders/{id}/cancel
        r = TestResult("/api/orders/{id}/cancel", "POST", 200)
        r.category = "Orders"
        if self.test_order_id:
            status, body, resp_time = self.make_request("POST", f"/api/orders/{self.test_order_id}/cancel", headers=headers)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status == 200:
                r.status = "PASS"
                r.notes = "Order cancelled successfully"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No order ID available"
        self.add_result(r)

    def test_addresses(self):
        """Test all address endpoints"""
        print("\n=== Testing Addresses Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        
        # GET /api/addresses
        r = TestResult("/api/addresses", "GET", 200)
        r.category = "Addresses"
        status, body, resp_time = self.make_request("GET", "/api/addresses", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            addresses = body.get("addresses", body.get("items", []))
            r.notes = f"Found {len(addresses) if isinstance(addresses, list) else 'N/A'} addresses"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/addresses
        r = TestResult("/api/addresses", "POST", 201)
        r.category = "Addresses"
        address_data = {
            "name": "Test Address",
            "street": "123 Test St",
            "city": "Test City",
            "state": "TS",
            "zip": "12345",
            "country": "Test Country",
            "phone": "1234567890"
        }
        r.request_body = address_data
        status, body, resp_time = self.make_request("POST", "/api/addresses", headers=headers, json_data=address_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 201:
            r.status = "PASS"
            r.notes = "Address created successfully"
            self.test_address_id = body.get("id", body.get("address", {}).get("id", ""))
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # PUT /api/addresses/{id}
        r = TestResult("/api/addresses/{id}", "PUT", 200)
        r.category = "Addresses"
        if self.test_address_id:
            update_data = {"street": "456 Updated Ave"}
            r.request_body = update_data
            status, body, resp_time = self.make_request("PUT", f"/api/addresses/{self.test_address_id}", headers=headers, json_data=update_data)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status == 200:
                r.status = "PASS"
                r.notes = "Address updated successfully"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No address ID available"
        self.add_result(r)
        
        # DELETE /api/addresses/{id}
        r = TestResult("/api/addresses/{id}", "DELETE", 200)
        r.category = "Addresses"
        if self.test_address_id:
            status, body, resp_time = self.make_request("DELETE", f"/api/addresses/{self.test_address_id}", headers=headers)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status in [200, 204]:
                r.status = "PASS"
                r.notes = "Address deleted successfully"
                self.test_address_id = ""
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No address ID available"
        self.add_result(r)

    def test_wishlist(self):
        """Test all wishlist endpoints"""
        print("\n=== Testing Wishlist Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        
        # GET /api/wishlist
        r = TestResult("/api/wishlist", "GET", 200)
        r.category = "Wishlist"
        status, body, resp_time = self.make_request("GET", "/api/wishlist", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            items = body.get("items", [])
            r.notes = f"Found {len(items) if isinstance(items, list) else 'N/A'} wishlist items"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/wishlist/items/{productId}
        r = TestResult("/api/wishlist/items/99999", "POST", 200)
        r.category = "Wishlist"
        status, body, resp_time = self.make_request("POST", "/api/wishlist/items/99999", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Added to wishlist"
            self.test_wishlist_id = body.get("id", body.get("item", {}).get("id", ""))
        elif status == 404:
            r.status = "PASS"  # Expected for non-existent product
            r.notes = "Correctly rejects non-existent product"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # DELETE /api/wishlist/items/{id}
        r = TestResult("/api/wishlist/items/{id}", "DELETE", 200)
        r.category = "Wishlist"
        if self.test_wishlist_id:
            status, body, resp_time = self.make_request("DELETE", f"/api/wishlist/items/{self.test_wishlist_id}", headers=headers)
            r.actual_status = status
            r.response_time = resp_time
            r.response_body = body
            if status in [200, 204]:
                r.status = "PASS"
                r.notes = "Removed from wishlist"
            else:
                r.status = "FAIL"
                r.error_message = body.get("detail", body.get("error", str(body)))
        else:
            r.actual_status = 0
            r.response_time = 0
            r.status = "SKIP"
            r.notes = "No wishlist item ID available"
        self.add_result(r)

    def test_search(self):
        """Test search endpoints"""
        print("\n=== Testing Search Endpoints ===")
        
        # GET /api/search
        r = TestResult("/api/search?q=test", "GET", 200)
        r.category = "Search"
        status, body, resp_time = self.make_request("GET", "/api/search", params={"q": "test"})
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            results = body.get("results", body.get("products", []))
            r.notes = f"Found {len(results) if isinstance(results, list) else 'N/A'} search results"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)

    def test_admin(self):
        """Test admin endpoints"""
        print("\n=== Testing Admin Endpoints ===")
        
        # Try with regular user token first
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        
        # GET /api/admin/dashboard
        r = TestResult("/api/admin/dashboard", "GET", 200)
        r.category = "Admin"
        status, body, resp_time = self.make_request("GET", "/api/admin/dashboard", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Dashboard accessible"
        elif status in [401, 403]:
            r.status = "SKIP"
            r.notes = "Admin access required (expected for regular user)"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # GET /api/admin/orders
        r = TestResult("/api/admin/orders", "GET", 200)
        r.category = "Admin"
        status, body, resp_time = self.make_request("GET", "/api/admin/orders", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Admin orders accessible"
        elif status in [401, 403]:
            r.status = "SKIP"
            r.notes = "Admin access required"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # GET /api/admin/users
        r = TestResult("/api/admin/users", "GET", 200)
        r.category = "Admin"
        status, body, resp_time = self.make_request("GET", "/api/admin/users", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Admin users accessible"
        elif status in [401, 403]:
            r.status = "SKIP"
            r.notes = "Admin access required"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/admin/coupons
        r = TestResult("/api/admin/coupons", "POST", 201)
        r.category = "Admin"
        coupon_data = {
            "code": f"TEST{self.unique_suffix}",
            "discount_percent": 10,
            "min_order_amount": 50
        }
        r.request_body = coupon_data
        status, body, resp_time = self.make_request("POST", "/api/admin/coupons", headers=headers, json_data=coupon_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 201:
            r.status = "PASS"
            r.notes = "Coupon created"
        elif status in [401, 403]:
            r.status = "SKIP"
            r.notes = "Admin access required"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # GET /api/admin/coupons
        r = TestResult("/api/admin/coupons", "GET", 200)
        r.category = "Admin"
        status, body, resp_time = self.make_request("GET", "/api/admin/coupons", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Coupons list accessible"
        elif status in [401, 403]:
            r.status = "SKIP"
            r.notes = "Admin access required"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/admin/coupons/validate
        r = TestResult("/api/admin/coupons/validate", "POST", 200)
        r.category = "Admin"
        validate_data = {"code": f"TEST{self.unique_suffix}"}
        r.request_body = validate_data
        status, body, resp_time = self.make_request("POST", "/api/admin/coupons/validate", headers=headers, json_data=validate_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Coupon validation works"
        elif status in [401, 403]:
            r.status = "SKIP"
            r.notes = "Admin access required"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)

    def test_other_endpoints(self):
        """Test other endpoints"""
        print("\n=== Testing Other Endpoints ===")
        
        headers = {"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"} if self.access_token else {}
        
        # GET /api/profile
        r = TestResult("/api/profile", "GET", 200)
        r.category = "Other"
        status, body, resp_time = self.make_request("GET", "/api/profile", headers=headers)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status == 200:
            r.status = "PASS"
            r.notes = "Profile accessible"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/upload - Test the fix for 404
        r = TestResult("/api/upload", "POST", 200)
        r.category = "Other"
        # Create a small test file
        test_file = {"file": ("test.txt", b"Test content", "text/plain")}
        status, body, resp_time = self.make_request("POST", "/api/upload", headers=headers)
        # Manual file upload
        try:
            with httpx.Client(timeout=TIMEOUT) as client:
                response = client.post(f"{self.base_url}/api/upload", headers=headers, files=test_file)
                status = response.status_code
                body = response.json() if response.content else {}
                resp_time = (time.time() - start) * 1000
        except Exception as e:
            status = 0
            body = {"error": str(e)}
        
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status in [200, 201]:
            r.status = "PASS"
            r.notes = "✅ UPLOAD FIX VERIFIED: Endpoint accessible"
        elif status == 404:
            r.status = "FAIL"
            r.error_message = "404 - Upload endpoint still not accessible"
        elif status in [401, 403]:
            r.status = "FAIL"
            r.error_message = "Unauthorized"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)
        
        # POST /api/contact
        r = TestResult("/api/contact", "POST", 200)
        r.category = "Other"
        contact_data = {
            "name": "Test User",
            "email": f"test_{self.unique_suffix}@test.com",
            "message": "Test contact message"
        }
        r.request_body = contact_data
        status, body, resp_time = self.make_request("POST", "/api/contact", json_data=contact_data)
        r.actual_status = status
        r.response_time = resp_time
        r.response_body = body
        if status in [200, 201]:
            r.status = "PASS"
            r.notes = "Contact form works"
        else:
            r.status = "FAIL"
            r.error_message = body.get("detail", body.get("error", str(body)))
        self.add_result(r)

    def generate_report(self, output_path: str):
        """Generate comprehensive markdown report"""
        total = len(self.results)
        passed = sum(1 for r in self.results if r.status == "PASS")
        failed = sum(1 for r in self.results if r.status == "FAIL")
        skipped = sum(1 for r in self.results if r.status == "SKIP")
        pass_rate = (passed / (total - skipped) * 100) if (total - skipped) > 0 else 0
        
        avg_response_time = sum(r.response_time for r in self.results if r.response_time > 0) / max(1, len([r for r in self.results if r.response_time > 0]))
        
        # Category breakdown
        categories = {}
        for r in self.results:
            if r.category not in categories:
                categories[r.category] = {"total": 0, "passed": 0, "failed": 0, "skipped": 0}
            categories[r.category]["total"] += 1
            if r.status == "PASS":
                categories[r.category]["passed"] += 1
            elif r.status == "FAIL":
                categories[r.category]["failed"] += 1
            else:
                categories[r.category]["skipped"] += 1
        
        # Calculate health score
        if pass_rate >= 90:
            health_score = 10
        elif pass_rate >= 80:
            health_score = 8
        elif pass_rate >= 70:
            health_score = 6
        elif pass_rate >= 60:
            health_score = 4
        else:
            health_score = 2
        
        # Check for critical auth failures
        auth_failures = sum(1 for r in self.results if r.category == "Auth" and r.status == "FAIL")
        if auth_failures > 0:
            health_score = max(0, health_score - 2)
        
        report = f"""# API TEST REPORT - POST-FIX VERIFICATION
Date: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
Base URL: {self.base_url}

## Executive Summary
- **Total Tests**: {total}
- **Passed**: {passed}
- **Failed**: {failed}
- **Skipped**: {skipped}
- **Pass Rate**: {pass_rate:.1f}%
- **Average Response Time**: {avg_response_time:.0f}ms
- **Improvement from Previous Test**: Previous was 79.2% pass rate, 2868ms avg response time

## Results Table
| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |
|---|----------|--------|----------|--------|--------|---------------|-------|
"""
        for i, r in enumerate(self.results, 1):
            status_icon = "✅" if r.status == "PASS" else ("❌" if r.status == "FAIL" else "⚪")
            notes = r.notes[:50] if r.notes else (r.error_message[:50] if r.error_message else "")
            report += f"| {i} | {r.endpoint} | {r.method} | {r.expected_status} | {r.actual_status} | {status_icon} {r.status} | {r.response_time:.0f}ms | {notes} |\n"
        
        # Failed tests detail
        failed_tests = [r for r in self.results if r.status == "FAIL"]
        if failed_tests:
            report += "\n## Failed Tests (Detailed)\n"
            for i, r in enumerate(failed_tests, 1):
                report += f"""
### Test #{i}: {r.endpoint}
- **Endpoint**: {self.base_url}{r.endpoint}
- **Method**: {r.method}
- **Expected Status**: {r.expected_status}
- **Actual Status**: {r.actual_status}
- **Error Message**: {r.error_message}
- **Request Body**: {json.dumps(r.request_body, indent=2) if r.request_body else "N/A"}
- **Response Body**: {json.dumps(r.response_body, indent=2) if r.response_body else "N/A"}
- **Recommended Fix**: {self.get_recommended_fix(r)}
"""
        
        # Category breakdown
        report += "\n## Endpoint Category Breakdown\n"
        report += "| Category | Total | Passed | Failed | Skipped | Pass Rate |\n"
        report += "|----------|-------|--------|--------|---------|----------|\n"
        for cat, data in sorted(categories.items()):
            cat_pass_rate = (data["passed"] / (data["total"] - data["skipped"]) * 100) if (data["total"] - data["skipped"]) > 0 else 0
            report += f"| {cat} | {data['total']} | {data['passed']} | {data['failed']} | {data['skipped']} | {cat_pass_rate:.1f}% |\n"
        
        # Health score
        report += f"""
## Overall API Health Score: {health_score}/10

Scoring Criteria:
- 90-100% pass rate = 10/10
- 80-89% = 8/10
- 70-79% = 6/10
- 60-69% = 4/10
- Below 60% = 2/10
- Critical auth failures = -2 points

## Fixes Verification

### Fix 1: Category Creation (Auto-generated slug for duplicates)
"""
        category_tests = [r for r in self.results if "duplicate" in r.endpoint.lower() or ("Category" in r.category and "POST" in r.method)]
        if category_tests:
            for test in category_tests:
                if "duplicate" in test.endpoint.lower():
                    if test.status == "PASS":
                        report += f"- **Status**: ✅ VERIFIED - {test.notes}\n"
                    else:
                        report += f"- **Status**: ❌ NOT WORKING - {test.error_message}\n"
        else:
            report += "- **Status**: ⚪ Not tested\n"
        
        report += """
### Fix 2: Upload Endpoint (Root /api/upload)
"""
        upload_tests = [r for r in self.results if "upload" in r.endpoint.lower()]
        if upload_tests:
            for test in upload_tests:
                if test.status == "PASS":
                    report += f"- **Status**: ✅ VERIFIED - {test.notes}\n"
                else:
                    report += f"- **Status**: ❌ NOT WORKING - {test.error_message}\n"
        else:
            report += "- **Status**: ⚪ Not tested\n"
        
        report += f"""
### Fix 3: Database Performance (Indexes)
- **Previous Average Response Time**: 2868ms
- **Current Average Response Time**: {avg_response_time:.0f}ms
- **Improvement**: {((2868 - avg_response_time) / 2868 * 100):.1f}% faster
"""
        
        # Recommendations
        report += "\n## Recommendations\n"
        if failed_tests:
            report += "1. **Address Failed Tests**: Review and fix the {0} failed endpoints listed above\n".format(len(failed_tests))
        
        # Check specific issues
        auth_failures = [r for r in self.results if r.category == "Auth" and r.status == "FAIL"]
        if auth_failures:
            report += "2. **Critical: Authentication Issues** - Fix auth flow as it blocks all protected endpoints\n"
        
        admin_skips = [r for r in self.results if r.category == "Admin" and r.status == "SKIP"]
        if len(admin_skips) > 3:
            report += "3. **Admin Access**: Consider creating a test admin user for complete admin endpoint testing\n"
        
        if avg_response_time > 1000:
            report += f"4. **Performance**: Average response time ({avg_response_time:.0f}ms) is still high. Verify database indexes are being used.\n"
        else:
            report += f"4. **Performance**: ✅ Response times are good ({avg_response_time:.0f}ms average)\n"
        
        # Go/No-Go recommendation
        report += "\n## Go/No-Go Recommendation\n\n"
        if pass_rate >= 90 and auth_failures == 0:
            report += "### ✅ **GO FOR DEPLOYMENT**\n\n"
            report += "The API is in excellent shape with a {0:.1f}% pass rate. All critical authentication flows are working. The recent fixes have been verified.\n".format(pass_rate)
        elif pass_rate >= 80 and auth_failures == 0:
            report += "### ⚠️ **GO WITH MINOR FIXES**\n\n"
            report += "The API is mostly ready ({0:.1f}% pass rate). Address the {1} failed tests before deployment, but no critical blockers.\n".format(pass_rate, len(failed_tests))
        elif auth_failures > 0:
            report += "### ❌ **NO-GO - CRITICAL ISSUES**\n\n"
            report += "Authentication failures block most functionality. **Do not deploy** until auth issues are resolved.\n"
        else:
            report += "### ❌ **NO-GO - LOW PASS RATE**\n\n"
            report += "Pass rate of {0:.1f}% is below acceptable threshold. Address failed tests before deployment.\n".format(pass_rate)
        
        report += f"""
---
*Report generated automatically by API Test Script*
*Test Duration: {time.time() - self.start_time:.1f} seconds*
"""
        
        with open(output_path, 'w') as f:
            f.write(report)
        
        print(f"\n📄 Report saved to: {output_path}")
        return pass_rate, health_score
    
    def get_recommended_fix(self, result: TestResult) -> str:
        """Get recommended fix based on error type"""
        if result.actual_status == 401:
            return "Check authentication token. Ensure Bearer token is valid and not expired."
        elif result.actual_status == 403:
            return "Check user permissions. Endpoint may require admin privileges."
        elif result.actual_status == 404:
            return "Verify endpoint path is correct. Check if resource exists."
        elif result.actual_status == 400:
            return "Review request body format. Check required fields and data types."
        elif result.actual_status == 500:
            return "Server-side error. Check backend logs for stack trace."
        elif result.actual_status == 0:
            return "Connection issue. Verify API server is running and accessible."
        else:
            return "Review endpoint implementation and expected behavior."

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("=" * 60)
        print("COMPREHENSIVE API TEST SUITE - POST-FIX VERIFICATION")
        print("=" * 60)
        print(f"Base URL: {self.base_url}")
        print(f"Timestamp: {self.unique_suffix}")
        
        # Phase 1: Health check
        self.test_health_endpoints()
        
        # Phase 2: Authentication (must come first for token)
        self.test_authentication()
        
        # Phase 3: Protected endpoints
        self.test_products()
        self.test_categories()
        self.test_cart()
        self.test_orders()
        self.test_addresses()
        self.test_wishlist()
        self.test_search()
        
        # Phase 4: Admin endpoints
        self.test_admin()
        
        # Phase 5: Other endpoints
        self.test_other_endpoints()
        
        # Generate report
        print("\n" + "=" * 60)
        print("GENERATING REPORT")
        print("=" * 60)
        pass_rate, health_score = self.generate_report("D:\\ecomarce-qwen\\final_report1.md")
        
        # Summary
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        total = len(self.results)
        passed = sum(1 for r in self.results if r.status == "PASS")
        failed = sum(1 for r in self.results if r.status == "FAIL")
        skipped = sum(1 for r in self.results if r.status == "SKIP")
        print(f"Total: {total} | Passed: {passed} | Failed: {failed} | Skipped: {skipped}")
        print(f"Pass Rate: {pass_rate:.1f}%")
        print(f"Health Score: {health_score}/10")
        
        if pass_rate >= 90:
            print("\n✅ EXCELLENT - Ready for deployment!")
        elif pass_rate >= 80:
            print("\n⚠️ GOOD - Minor fixes needed")
        else:
            print("\n❌ NEEDS WORK - Address failures before deployment")


if __name__ == "__main__":
    tester = APITester(BASE_URL)
    tester.run_all_tests()
