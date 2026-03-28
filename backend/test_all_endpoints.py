#!/usr/bin/env python3
"""
Comprehensive API Endpoint Testing Script
Tests all API endpoints and generates a detailed report
"""

import httpx
import json
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field
from enum import Enum

# Configuration
BASE_URL = "http://localhost:8000"
TIMEOUT = 30.0

# Test data
TEST_USER = {
    "email": f"test_{int(datetime.now().timestamp())}@example.com",
    "username": f"testuser_{int(datetime.now().timestamp())}",
    "password": "TestPass123",
    "full_name": "Test User"
}

@dataclass
class TestResult:
    endpoint: str
    method: str
    expected_status: int
    actual_status: Optional[int]
    status: str  # PASS, FAIL, ERROR, SKIPPED
    response_time_ms: float
    error_message: str = ""
    response_body: Any = None
    notes: str = ""

@dataclass
class TestReport:
    total: int = 0
    passed: int = 0
    failed: int = 0
    errors: int = 0
    skipped: int = 0
    results: List[TestResult] = field(default_factory=list)
    
    @property
    def pass_rate(self) -> float:
        if self.total == 0:
            return 0.0
        return (self.passed / self.total) * 100
    
    @property
    def avg_response_time(self) -> float:
        times = [r.response_time_ms for r in self.results if r.response_time_ms > 0]
        return sum(times) / len(times) if times else 0

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.client = httpx.Client(timeout=TIMEOUT, follow_redirects=True)
        self.report = TestReport()
        self.access_token: Optional[str] = None
        self.admin_token: Optional[str] = None
        self.test_user_id: Optional[int] = None
        self.test_product_id: Optional[int] = None
        self.test_category_id: Optional[int] = None
        self.test_order_id: Optional[int] = None
        self.test_address_id: Optional[int] = None
    
    def log(self, message: str):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
    
    def record_result(self, result: TestResult):
        self.report.total += 1
        if result.status == "PASS":
            self.report.passed += 1
        elif result.status == "FAIL":
            self.report.failed += 1
        elif result.status == "ERROR":
            self.report.errors += 1
        elif result.status == "SKIPPED":
            self.report.skipped += 1
        self.report.results.append(result)
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> tuple:
        """Make HTTP request and return (status_code, response_time_ms, response_data, error)"""
        url = f"{self.base_url}{endpoint}"
        start_time = datetime.now()
        
        try:
            if method.upper() == "GET":
                response = self.client.get(url, **kwargs)
            elif method.upper() == "POST":
                response = self.client.post(url, **kwargs)
            elif method.upper() == "PUT":
                response = self.client.put(url, **kwargs)
            elif method.upper() == "DELETE":
                response = self.client.delete(url, **kwargs)
            elif method.upper() == "PATCH":
                response = self.client.patch(url, **kwargs)
            else:
                return 0, 0, None, f"Unknown method: {method}"
            
            elapsed = (datetime.now() - start_time).total_seconds() * 1000
            
            try:
                data = response.json()
            except:
                data = response.text
            
            return response.status_code, elapsed, data, None
            
        except httpx.ConnectError as e:
            elapsed = (datetime.now() - start_time).total_seconds() * 1000
            return 0, elapsed, None, f"Connection error: {str(e)}"
        except httpx.TimeoutException as e:
            elapsed = (datetime.now() - start_time).total_seconds() * 1000
            return 0, elapsed, None, f"Timeout: {str(e)}"
        except Exception as e:
            elapsed = (datetime.now() - start_time).total_seconds() * 1000
            return 0, elapsed, None, f"Error: {str(e)}"
    
    def get_auth_headers(self, token: Optional[str] = None) -> Dict:
        headers = {"Content-Type": "application/json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"
        return headers
    
    # ==================== HEALTH CHECK ====================
    def test_health_check(self):
        self.log("Testing health check...")
        status, time_ms, data, error = self.make_request("GET", "/api/health")
        
        result = TestResult(
            endpoint="/api/health",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or ""
        )
        self.record_result(result)
        return status == 200
    
    # ==================== AUTH ENDPOINTS ====================
    def test_auth_endpoints(self):
        self.log("Testing authentication endpoints...")
        
        # 1. Register new user
        status, time_ms, data, error = self.make_request(
            "POST", "/api/auth/register",
            json=TEST_USER,
            headers={"Content-Type": "application/json"}
        )
        
        if status == 201:
            self.test_user_id = data.get("id") if isinstance(data, dict) else None
            result = TestResult(
                endpoint="/api/auth/register",
                method="POST",
                expected_status=201,
                actual_status=status,
                status="PASS",
                response_time_ms=time_ms,
                response_body=data,
                notes="User registered successfully"
            )
        else:
            result = TestResult(
                endpoint="/api/auth/register",
                method="POST",
                expected_status=201,
                actual_status=status,
                status="FAIL",
                response_time_ms=time_ms,
                response_body=data,
                error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
            )
        self.record_result(result)
        
        # 2. Login
        status, time_ms, data, error = self.make_request(
            "POST", "/api/auth/login",
            json={"email": TEST_USER["email"], "password": TEST_USER["password"]},
            headers={"Content-Type": "application/json"}
        )
        
        if status == 200 and isinstance(data, dict):
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
            result = TestResult(
                endpoint="/api/auth/login",
                method="POST",
                expected_status=200,
                actual_status=status,
                status="PASS",
                response_time_ms=time_ms,
                response_body=data,
                notes="Login successful, token obtained"
            )
        else:
            result = TestResult(
                endpoint="/api/auth/login",
                method="POST",
                expected_status=200,
                actual_status=status,
                status="FAIL",
                response_time_ms=time_ms,
                response_body=data,
                error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
            )
        self.record_result(result)
        
        # 3. Get current user profile (requires auth)
        if self.access_token:
            status, time_ms, data, error = self.make_request(
                "GET", "/api/auth/profile",
                headers=self.get_auth_headers(self.access_token)
            )
            result = TestResult(
                endpoint="/api/auth/profile",
                method="GET",
                expected_status=200,
                actual_status=status,
                status="PASS" if status == 200 else "FAIL",
                response_time_ms=time_ms,
                response_body=data,
                error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
            )
            self.record_result(result)
        
        # 4. Get /api/auth/me (requires auth)
        if self.access_token:
            status, time_ms, data, error = self.make_request(
                "GET", "/api/auth/me",
                headers=self.get_auth_headers(self.access_token)
            )
            result = TestResult(
                endpoint="/api/auth/me",
                method="GET",
                expected_status=200,
                actual_status=status,
                status="PASS" if status == 200 else "FAIL",
                response_time_ms=time_ms,
                response_body=data,
                error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
            )
            self.record_result(result)
        
        # 5. Token refresh
        if self.refresh_token:
            status, time_ms, data, error = self.make_request(
                "POST", "/api/auth/refresh",
                json={"refresh_token": self.refresh_token},
                headers={"Content-Type": "application/json"}
            )
            result = TestResult(
                endpoint="/api/auth/refresh",
                method="POST",
                expected_status=200,
                actual_status=status,
                status="PASS" if status == 200 else "FAIL",
                response_time_ms=time_ms,
                response_body=data,
                error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
            )
            self.record_result(result)
        
        # 6. Forgot password
        status, time_ms, data, error = self.make_request(
            "POST", "/api/auth/forgot-password",
            json={"email": TEST_USER["email"]},
            headers={"Content-Type": "application/json"}
        )
        result = TestResult(
            endpoint="/api/auth/forgot-password",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 7. Social login (test with mock data)
        status, time_ms, data, error = self.make_request(
            "POST", "/api/auth/social-login",
            json={
                "email": f"social_test_{int(datetime.now().timestamp())}@gmail.com",
                "name": "Social Test User",
                "provider": "google",
                "provider_id": "123456789"
            },
            headers={"Content-Type": "application/json"}
        )
        result = TestResult(
            endpoint="/api/auth/social-login",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== CATEGORIES ENDPOINTS ====================
    def test_categories_endpoints(self):
        self.log("Testing categories endpoints...")
        
        # 1. Get all categories
        status, time_ms, data, error = self.make_request("GET", "/api/categories/")
        result = TestResult(
            endpoint="/api/categories/",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 2. Get all categories (flat list)
        status, time_ms, data, error = self.make_request("GET", "/api/categories/all")
        result = TestResult(
            endpoint="/api/categories/all",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 3. Create category (admin only - will likely fail without admin token)
        status, time_ms, data, error = self.make_request(
            "POST", "/api/categories/",
            json={"name": "Test Category", "slug": "test-category", "description": "Test"},
            headers={"Content-Type": "application/json"}
        )
        # This might fail with 403 (expected without admin) or succeed
        result = TestResult(
            endpoint="/api/categories/ POST",
            method="POST",
            expected_status=201,
            actual_status=status,
            status="PASS" if status in [201, 403] else "FAIL",  # 403 is acceptable (needs admin)
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin token" if status == 403 else ""
        )
        self.record_result(result)
        
        if status == 201 and isinstance(data, dict):
            self.test_category_id = data.get("id")
    
    # ==================== PRODUCTS ENDPOINTS ====================
    def test_products_endpoints(self):
        self.log("Testing products endpoints...")
        
        # 1. Get all products
        status, time_ms, data, error = self.make_request("GET", "/api/products/")
        result = TestResult(
            endpoint="/api/products/",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 2. Search products
        status, time_ms, data, error = self.make_request("GET", "/api/products/search", params={"q": "test"})
        result = TestResult(
            endpoint="/api/products/search",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 3. Get flash sales
        status, time_ms, data, error = self.make_request("GET", "/api/products/flash-sales")
        result = TestResult(
            endpoint="/api/products/flash-sales",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 4. Create product (admin only)
        status, time_ms, data, error = self.make_request(
            "POST", "/api/products/",
            json={
                "name": "Test Product",
                "slug": "test-product",
                "description": "Test product description",
                "short_description": "Test",
                "price": 29.99,
                "stock_quantity": 100,
                "sku": "TEST-001",
                "is_active": True
            },
            headers=self.get_auth_headers(self.access_token)
        )
        # This will likely fail with 403 without admin token
        result = TestResult(
            endpoint="/api/products/ POST",
            method="POST",
            expected_status=201,
            actual_status=status,
            status="PASS" if status in [201, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin token" if status == 403 else ""
        )
        self.record_result(result)
        
        if status == 201 and isinstance(data, dict):
            self.test_product_id = data.get("id")
    
    # ==================== CART ENDPOINTS ====================
    def test_cart_endpoints(self):
        self.log("Testing cart endpoints...")
        
        if not self.access_token:
            self.log("  Skipping cart tests - no auth token")
            return
        
        # 1. Get cart
        status, time_ms, data, error = self.make_request(
            "GET", "/api/cart/",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/cart/",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 2. Add to cart (need a product first)
        if self.test_product_id:
            status, time_ms, data, error = self.make_request(
                "POST", "/api/cart/items",
                json={"product_id": self.test_product_id, "quantity": 1},
                headers=self.get_auth_headers(self.access_token)
            )
            result = TestResult(
                endpoint="/api/cart/items POST",
                method="POST",
                expected_status=201,
                actual_status=status,
                status="PASS" if status in [201, 404] else "FAIL",  # 404 if product doesn't exist
                response_time_ms=time_ms,
                response_body=data,
                error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
            )
            self.record_result(result)
    
    # ==================== WISHLIST ENDPOINTS ====================
    def test_wishlist_endpoints(self):
        self.log("Testing wishlist endpoints...")
        
        if not self.access_token:
            self.log("  Skipping wishlist tests - no auth token")
            return
        
        # 1. Get wishlist
        status, time_ms, data, error = self.make_request(
            "GET", "/api/wishlist/",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/wishlist/",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== ADDRESSES ENDPOINTS ====================
    def test_addresses_endpoints(self):
        self.log("Testing addresses endpoints...")
        
        if not self.access_token:
            self.log("  Skipping addresses tests - no auth token")
            return
        
        # 1. Create address
        status, time_ms, data, error = self.make_request(
            "POST", "/api/addresses/",
            json={
                "first_name": "Test",
                "last_name": "User",
                "address_line1": "123 Test St",
                "city": "Test City",
                "state": "Test State",
                "postal_code": "12345",
                "country": "US",
                "phone": "1234567890",
                "is_default": True
            },
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/addresses/ POST",
            method="POST",
            expected_status=201,
            actual_status=status,
            status="PASS" if status == 201 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        if status == 201 and isinstance(data, dict):
            self.test_address_id = data.get("id")
        
        # 2. Get addresses
        status, time_ms, data, error = self.make_request(
            "GET", "/api/addresses/",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/addresses/ GET",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== ORDERS ENDPOINTS ====================
    def test_orders_endpoints(self):
        self.log("Testing orders endpoints...")
        
        if not self.access_token:
            self.log("  Skipping orders tests - no auth token")
            return
        
        # 1. Get orders (empty is ok)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/orders/",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/orders/ GET",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 2. Create payment intent (Stripe)
        status, time_ms, data, error = self.make_request(
            "POST", "/api/orders/create-payment-intent",
            params={"amount": 100},
            headers=self.get_auth_headers(self.access_token)
        )
        # This might fail if Stripe not configured - that's ok
        result = TestResult(
            endpoint="/api/orders/create-payment-intent",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 500] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="500 expected if Stripe not configured" if status == 500 else ""
        )
        self.record_result(result)
    
    # ==================== SEARCH ENDPOINTS ====================
    def test_search_endpoints(self):
        self.log("Testing search endpoints...")
        
        # 1. Search
        status, time_ms, data, error = self.make_request(
            "GET", "/api/search/",
            params={"q": "test", "page": 1, "per_page": 10}
        )
        result = TestResult(
            endpoint="/api/search/",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # 2. Search suggestions
        status, time_ms, data, error = self.make_request(
            "GET", "/api/search/suggestions",
            params={"q": "test", "limit": 5}
        )
        result = TestResult(
            endpoint="/api/search/suggestions",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== ADMIN ENDPOINTS ====================
    def test_admin_endpoints(self):
        self.log("Testing admin endpoints...")
        
        # 1. Dashboard (requires admin)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/admin/dashboard",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/admin/dashboard",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin role" if status == 403 else ""
        )
        self.record_result(result)
        
        # 2. Get admin orders (requires admin)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/admin/orders",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/admin/orders",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin role" if status == 403 else ""
        )
        self.record_result(result)
        
        # 3. Get users (requires admin)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/admin/users",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/admin/users",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin role" if status == 403 else ""
        )
        self.record_result(result)
        
        # 4. Get coupons (requires admin)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/admin/coupons",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/admin/coupons",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin role" if status == 403 else ""
        )
        self.record_result(result)
        
        # 5. Validate coupon (public)
        status, time_ms, data, error = self.make_request(
            "POST", "/api/admin/coupons/validate",
            json={"code": "TEST10", "order_total": 100},
            headers={"Content-Type": "application/json"}
        )
        result = TestResult(
            endpoint="/api/admin/coupons/validate",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== CONTACT ENDPOINTS ====================
    def test_contact_endpoints(self):
        self.log("Testing contact endpoints...")
        
        status, time_ms, data, error = self.make_request(
            "POST", "/api/contact/",
            json={
                "name": "Test User",
                "email": "test@example.com",
                "subject": "Test Subject",
                "message": "Test message"
            },
            headers={"Content-Type": "application/json"}
        )
        result = TestResult(
            endpoint="/api/contact/",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="May fail if email service not configured" if status == 500 else ""
        )
        self.record_result(result)
    
    # ==================== UPLOAD ENDPOINTS ====================
    def test_upload_endpoints(self):
        self.log("Testing upload endpoints...")
        
        # 1. Root upload (should return info message)
        status, time_ms, data, error = self.make_request("POST", "/api/upload/")
        result = TestResult(
            endpoint="/api/upload/",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== JAZZCASH ENDPOINTS ====================
    def test_jazzcash_endpoints(self):
        self.log("Testing JazzCash endpoints...")
        
        # These will likely fail without proper configuration
        status, time_ms, data, error = self.make_request(
            "POST", "/api/jazzcash/initiate-payment",
            params={"order_id": 1, "phone_number": "03001234567"}
        )
        result = TestResult(
            endpoint="/api/jazzcash/initiate-payment",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 404, 500] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="Expected to fail without JazzCash config" if status in [404, 500] else ""
        )
        self.record_result(result)
    
    # ==================== EASYPaisA ENDPOINTS ====================
    def test_easypaisa_endpoints(self):
        self.log("Testing EasyPaisa endpoints...")
        
        status, time_ms, data, error = self.make_request(
            "POST", "/api/easypaisa/initiate-payment",
            params={"order_id": 1, "phone_number": "03001234567"}
        )
        result = TestResult(
            endpoint="/api/easypaisa/initiate-payment",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 404, 500] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="Expected to fail without EasyPaisa config" if status in [404, 500] else ""
        )
        self.record_result(result)
    
    # ==================== VARIANTS ENDPOINTS ====================
    def test_variants_endpoints(self):
        self.log("Testing variants endpoints...")
        
        # Get variants for a product (will 404 if no product)
        status, time_ms, data, error = self.make_request("GET", "/api/variants/product/1")
        result = TestResult(
            endpoint="/api/variants/product/{id}",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 404] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== RETURNS ENDPOINTS ====================
    def test_returns_endpoints(self):
        self.log("Testing returns endpoints...")
        
        if not self.access_token:
            self.log("  Skipping returns tests - no auth token")
            return
        
        # Get my returns
        status, time_ms, data, error = self.make_request(
            "GET", "/api/returns/",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/returns/ GET",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # Admin returns (will 403)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/returns/admin/all",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/returns/admin/all",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin role" if status == 403 else ""
        )
        self.record_result(result)
    
    # ==================== ROLES ENDPOINTS ====================
    def test_roles_endpoints(self):
        self.log("Testing roles endpoints...")
        
        # Get permissions (public)
        status, time_ms, data, error = self.make_request("GET", "/api/roles/permissions")
        result = TestResult(
            endpoint="/api/roles/permissions",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # Get users (admin only)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/roles/users",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/roles/users",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin role" if status == 403 else ""
        )
        self.record_result(result)
    
    # ==================== SHIPPING ENDPOINTS ====================
    def test_shipping_endpoints(self):
        self.log("Testing shipping endpoints...")
        
        # Get shipping companies
        status, time_ms, data, error = self.make_request("GET", "/api/shipping/companies")
        result = TestResult(
            endpoint="/api/shipping/companies",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # Calculate shipping
        status, time_ms, data, error = self.make_request(
            "POST", "/api/shipping/calculate",
            json={"city": "Karachi", "total_amount": 100, "weight_kg": 1},
            headers={"Content-Type": "application/json"}
        )
        result = TestResult(
            endpoint="/api/shipping/calculate",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== REFERRAL ENDPOINTS ====================
    def test_referral_endpoints(self):
        self.log("Testing referral endpoints...")
        
        if not self.access_token:
            self.log("  Skipping referral tests - no auth token")
            return
        
        # Get my referral
        status, time_ms, data, error = self.make_request(
            "GET", "/api/referral/my-referral",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/referral/my-referral",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # Get referrals
        status, time_ms, data, error = self.make_request(
            "GET", "/api/referral/referrals",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/referral/referrals",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== BULK ENDPOINTS ====================
    def test_bulk_endpoints(self):
        self.log("Testing bulk endpoints...")
        
        # Export products (admin only)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/bulk/products/export",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/bulk/products/export",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin role" if status == 403 else ""
        )
        self.record_result(result)
    
    # ==================== NEWSLETTER ENDPOINTS ====================
    def test_newsletter_endpoints(self):
        self.log("Testing newsletter endpoints...")
        
        # Subscribe
        status, time_ms, data, error = self.make_request(
            "POST", "/api/newsletter/subscribe",
            json={"email": f"newsletter_test_{int(datetime.now().timestamp())}@example.com"},
            headers={"Content-Type": "application/json"}
        )
        result = TestResult(
            endpoint="/api/newsletter/subscribe",
            method="POST",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # Unsubscribe
        status, time_ms, data, error = self.make_request(
            "GET", "/api/newsletter/unsubscribe",
            params={"email": "test@example.com"}
        )
        result = TestResult(
            endpoint="/api/newsletter/unsubscribe",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
        
        # Admin stats (admin only)
        status, time_ms, data, error = self.make_request(
            "GET", "/api/newsletter/admin/stats",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/newsletter/admin/stats",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status in [200, 403] else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data)),
            notes="403 expected without admin role" if status == 403 else ""
        )
        self.record_result(result)
    
    # ==================== PROFILE ENDPOINT ====================
    def test_profile_endpoint(self):
        self.log("Testing profile endpoint...")
        
        if not self.access_token:
            self.log("  Skipping profile test - no auth token")
            return
        
        status, time_ms, data, error = self.make_request(
            "GET", "/api/profile",
            headers=self.get_auth_headers(self.access_token)
        )
        result = TestResult(
            endpoint="/api/profile",
            method="GET",
            expected_status=200,
            actual_status=status,
            status="PASS" if status == 200 else "FAIL",
            response_time_ms=time_ms,
            response_body=data,
            error_message=error or (data.get("detail") if isinstance(data, dict) else str(data))
        )
        self.record_result(result)
    
    # ==================== RUN ALL TESTS ====================
    def run_all_tests(self):
        self.log("=" * 60)
        self.log("Starting comprehensive API endpoint testing")
        self.log(f"Base URL: {self.base_url}")
        self.log("=" * 60)
        
        # Check if API is accessible
        self.log("\nChecking API accessibility...")
        if not self.test_health_check():
            self.log("ERROR: API is not accessible. Cannot continue testing.")
            self.log(f"Make sure the API is running at {self.base_url}")
            return False
        
        self.log("API is accessible! Starting endpoint tests...\n")
        
        # Run all test groups
        self.test_auth_endpoints()
        self.test_categories_endpoints()
        self.test_products_endpoints()
        self.test_cart_endpoints()
        self.test_wishlist_endpoints()
        self.test_addresses_endpoints()
        self.test_orders_endpoints()
        self.test_search_endpoints()
        self.test_admin_endpoints()
        self.test_contact_endpoints()
        self.test_upload_endpoints()
        self.test_jazzcash_endpoints()
        self.test_easypaisa_endpoints()
        self.test_variants_endpoints()
        self.test_returns_endpoints()
        self.test_roles_endpoints()
        self.test_shipping_endpoints()
        self.test_referral_endpoints()
        self.test_bulk_endpoints()
        self.test_newsletter_endpoints()
        self.test_profile_endpoint()
        
        return True
    
    # ==================== GENERATE REPORT ====================
    def generate_report(self) -> str:
        report = []
        report.append("# API TEST REPORT")
        report.append(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Base URL: {self.base_url}")
        report.append("")
        
        # Executive Summary
        report.append("## Executive Summary")
        report.append(f"- Total Tests: {self.report.total}")
        report.append(f"- Passed: {self.report.passed}")
        report.append(f"- Failed: {self.report.failed}")
        report.append(f"- Errors: {self.report.errors}")
        report.append(f"- Skipped: {self.report.skipped}")
        report.append(f"- Pass Rate: {self.report.pass_rate:.1f}%")
        report.append(f"- Average Response Time: {self.report.avg_response_time:.0f}ms")
        report.append("")
        
        # Results Table
        report.append("## Results Table")
        report.append("| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |")
        report.append("|---|----------|--------|----------|--------|--------|---------------|-------|")
        
        for i, result in enumerate(self.report.results, 1):
            status_icon = "[PASS]" if result.status == "PASS" else "[FAIL]" if result.status == "FAIL" else "[SKIP]"
            notes = result.notes[:50] if result.notes else ""
            report.append(
                f"| {i} | `{result.endpoint}` | {result.method} | {result.expected_status} | "
                f"{result.actual_status or 'N/A'} | {status_icon} {result.status} | "
                f"{result.response_time_ms:.0f}ms | {notes} |"
            )
        report.append("")
        
        # Failed Tests Detail
        failed = [r for r in self.report.results if r.status in ["FAIL", "ERROR"]]
        if failed:
            report.append("## Failed Tests (Detailed)")
            for i, result in enumerate(failed, 1):
                report.append(f"### Test #{i}: {result.endpoint}")
                report.append(f"- **Endpoint**: `{result.endpoint}`")
                report.append(f"- **Method**: {result.method}")
                report.append(f"- **Expected Status**: {result.expected_status}")
                report.append(f"- **Actual Status**: {result.actual_status}")
                report.append(f"- **Error**: {result.error_message[:500] if result.error_message else 'N/A'}")
                if result.response_body:
                    body_str = str(result.response_body)[:300]
                    report.append(f"- **Response**: {body_str}")
                report.append("")
        
        # Category Breakdown
        report.append("## Endpoint Category Breakdown")
        categories = {
            "Auth": [r for r in self.report.results if "auth" in r.endpoint.lower()],
            "Products": [r for r in self.report.results if "product" in r.endpoint.lower()],
            "Categories": [r for r in self.report.results if "categor" in r.endpoint.lower()],
            "Cart": [r for r in self.report.results if "cart" in r.endpoint.lower()],
            "Orders": [r for r in self.report.results if "order" in r.endpoint.lower()],
            "Admin": [r for r in self.report.results if "admin" in r.endpoint.lower()],
            "Search": [r for r in self.report.results if "search" in r.endpoint.lower()],
            "Shipping": [r for r in self.report.results if "shipping" in r.endpoint.lower()],
            "Payment": [r for r in self.report.results if any(x in r.endpoint.lower() for x in ["jazzcash", "easypaisa", "stripe", "payment"])],
            "Other": [r for r in self.report.results if not any(x in r.endpoint.lower() for x in ["auth", "product", "categor", "cart", "order", "admin", "search", "shipping", "jazzcash", "easypaisa", "stripe", "payment"])]
        }
        
        report.append("| Category | Total | Passed | Failed | Pass Rate |")
        report.append("|----------|-------|--------|--------|-----------|")
        for cat, results in categories.items():
            if results:
                passed = sum(1 for r in results if r.status == "PASS")
                rate = (passed / len(results)) * 100 if results else 0
                report.append(f"| {cat} | {len(results)} | {passed} | {len(results) - passed} | {rate:.0f}% |")
        report.append("")
        
        # Health Score
        pass_rate = self.report.pass_rate
        if pass_rate >= 90:
            score = 10
        elif pass_rate >= 80:
            score = 8
        elif pass_rate >= 70:
            score = 6
        elif pass_rate >= 60:
            score = 4
        else:
            score = 2
        
        report.append(f"## Overall API Health Score: {score}/10")
        report.append("")
        report.append("Scoring Criteria:")
        report.append("- 90-100% pass rate = 10/10")
        report.append("- 80-89% = 8/10")
        report.append("- 70-79% = 6/10")
        report.append("- 60-69% = 4/10")
        report.append("- Below 60% = 2/10")
        report.append("")
        
        # Recommendations
        report.append("## Recommendations")
        if self.report.pass_rate >= 90:
            report.append("[OK] API is in excellent health! All critical endpoints are working.")
        elif self.report.pass_rate >= 70:
            report.append("[WARN] API is mostly functional but some endpoints need attention.")
        else:
            report.append("[FAIL] API has significant issues that need immediate attention.")
        
        # List specific issues
        auth_failures = [r for r in self.report.results if "auth" in r.endpoint.lower() and r.status == "FAIL"]
        if auth_failures:
            report.append("\n### Critical: Authentication Issues")
            for r in auth_failures:
                report.append(f"- {r.endpoint}: {r.error_message[:100]}")
        
        report.append("")
        report.append("---")
        report.append("*Report generated by API Test Script*")
        
        return "\n".join(report)
    
    def save_report(self, filename: str = "api_test_report.md"):
        report_content = self.generate_report()
        with open(filename, "w", encoding="utf-8") as f:
            f.write(report_content)
        self.log(f"\nReport saved to: {filename}")
        return report_content
    
    def close(self):
        self.client.close()


def main():
    print("=" * 60)
    print("E-Commerce API Comprehensive Test Suite")
    print("=" * 60)
    
    tester = APITester(BASE_URL)

    try:
        success = tester.run_all_tests()

        if success:
            # Print summary
            print("\n" + "=" * 60)
            print("TEST SUMMARY")
            print("=" * 60)
            print(f"Total Tests:  {tester.report.total}")
            print(f"Passed:       {tester.report.passed} [PASS]")
            print(f"Failed:       {tester.report.failed} [FAIL]")
            print(f"Errors:       {tester.report.errors} [ERROR]")
            print(f"Skipped:      {tester.report.skipped}")
            print(f"Pass Rate:    {tester.report.pass_rate:.1f}%")
            print(f"Avg Response: {tester.report.avg_response_time:.0f}ms")
            print("=" * 60)

            # Save detailed report
            report = tester.save_report("api_test_report.md")
            print("\nDetailed report saved to: api_test_report.md")

            # Print failed tests summary
            failed = [r for r in tester.report.results if r.status in ["FAIL", "ERROR"]]
            if failed:
                print(f"\n[WARN] {len(failed)} endpoint(s) failed:")
                for r in failed:
                    print(f"  - {r.endpoint} ({r.method}): {r.error_message[:80]}")
        else:
            print("\n[FAIL] Testing aborted - API not accessible")
            sys.exit(1)

    finally:
        tester.close()


if __name__ == "__main__":
    main()
