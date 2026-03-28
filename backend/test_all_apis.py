"""
Comprehensive API Test Script
Tests all endpoints and reports which ones are working/failing
"""

import requests
import json
import sys
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

# Test results storage
results = {
    "working": [],
    "failing": [],
    "skipped": []
}

def print_section(title):
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{title:^60}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")

def test_endpoint(method, endpoint, description, expected_status=200, 
                  json_data=None, headers=None, params=None, 
                  auth_token=None, skip=False):
    """Test a single endpoint and store result"""
    
    if skip:
        results["skipped"].append({
            "method": method,
            "endpoint": endpoint,
            "description": description,
            "reason": "Skipped"
        })
        print(f"{YELLOW}[SKIP]{RESET} {method} {endpoint} - {description}")
        return None
    
    url = f"{BASE_URL}{endpoint}"
    test_headers = headers or {}
    
    if auth_token:
        test_headers["Authorization"] = f"Bearer {auth_token}"
    
    try:
        if method == "GET":
            response = requests.get(url, headers=test_headers, params=params, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=test_headers, json=json_data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, headers=test_headers, json=json_data, timeout=10)
        elif method == "DELETE":
            response = requests.delete(url, headers=test_headers, timeout=10)
        elif method == "PATCH":
            response = requests.patch(url, headers=test_headers, json=json_data, timeout=10)
        else:
            print(f"{RED}[ERROR]{RESET} Invalid method: {method}")
            return None
        
        result = {
            "method": method,
            "endpoint": endpoint,
            "description": description,
            "status_code": response.status_code,
            "expected_status": expected_status,
            "response": response.text[:200] if response.text else None
        }
        
        if response.status_code == expected_status or (expected_status == 200 and response.status_code < 300):
            results["working"].append(result)
            print(f"{GREEN}[PASS]{RESET} {method} {endpoint} - {description} ({response.status_code})")
            return response
        else:
            results["failing"].append(result)
            print(f"{RED}[FAIL]{RESET} {method} {endpoint} - {description}")
            print(f"       Expected: {expected_status}, Got: {response.status_code}")
            if response.text:
                try:
                    error_data = response.json()
                    print(f"       Error: {json.dumps(error_data, indent=2)[:200]}")
                except:
                    print(f"       Error: {response.text[:200]}")
            return None
            
    except requests.exceptions.ConnectionError:
        results["failing"].append({
            "method": method,
            "endpoint": endpoint,
            "description": description,
            "error": "Connection refused - Server not running?"
        })
        print(f"{RED}[ERROR]{RESET} {method} {endpoint} - Connection refused. Is server running?")
        return None
    except Exception as e:
        results["failing"].append({
            "method": method,
            "endpoint": endpoint,
            "description": description,
            "error": str(e)
        })
        print(f"{RED}[ERROR]{RESET} {method} {endpoint} - {str(e)}")
        return None

def main():
    print_section("COMPREHENSIVE API TEST")
    print(f"Base URL: {BASE_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test variables
    auth_token = None
    user_id = None
    product_id = None
    category_id = None
    order_id = None
    cart_item_id = None
    wishlist_item_id = None
    address_id = None
    
    # ==================== PUBLIC ENDPOINTS ====================
    print_section("1. PUBLIC ENDPOINTS")
    
    # Root
    test_endpoint("GET", "/", "Root endpoint")
    
    # Health check
    test_endpoint("GET", "/health", "Health check")
    
    # ==================== AUTH ENDPOINTS ====================
    print_section("2. AUTH ENDPOINTS")
    
    # Register new user
    register_data = {
        "email": f"test_{datetime.now().strftime('%Y%m%d%H%M%S')}@test.com",
        "username": f"testuser_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "password": "Test1234!",
        "full_name": "Test User"
    }
    resp = test_endpoint("POST", "/auth/register", "Register user", 
                         json_data=register_data)
    if resp and resp.status_code < 300:
        try:
            user_data = resp.json()
            user_id = user_data.get("id")
            print(f"{GREEN}Created test user ID: {user_id}{RESET}")
        except:
            pass
    
    # Login
    login_data = {
        "email": register_data["email"],
        "password": "Test1234!"
    }
    resp = test_endpoint("POST", "/auth/login", "Login user", 
                         json_data=login_data)
    if resp and resp.status_code < 300:
        try:
            token_data = resp.json()
            auth_token = token_data.get("access_token")
            print(f"{GREEN}Got auth token{RESET}")
        except:
            pass
    
    # Forgot password
    test_endpoint("POST", "/auth/forgot-password", "Forgot password",
                  json_data={"email": register_data["email"]})
    
    # Get profile (requires auth)
    test_endpoint("GET", "/auth/profile", "Get user profile", 
                  auth_token=auth_token)
    
    # Get current user info
    test_endpoint("GET", "/auth/me", "Get current user", 
                  auth_token=auth_token)
    
    # Update user
    test_endpoint("PUT", "/auth/me", "Update user", 
                  json_data={"full_name": "Updated Name"},
                  auth_token=auth_token)
    
    # ==================== CATEGORIES ====================
    print_section("3. CATEGORIES ENDPOINTS")
    
    # Get all categories
    resp = test_endpoint("GET", "/categories", "Get all categories")
    
    # Get all categories (flat list)
    test_endpoint("GET", "/categories/all", "Get all categories flat")
    
    # Create category (for testing)
    category_data = {
        "name": "Test Category",
        "slug": f"test-category-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "description": "Test category for API testing"
    }
    resp = test_endpoint("POST", "/categories", "Create category",
                         json_data=category_data)
    if resp and resp.status_code < 300:
        try:
            category_id = resp.json().get("id")
            print(f"{GREEN}Created test category ID: {category_id}{RESET}")
        except:
            pass
    
    # Get single category
    if category_id:
        test_endpoint("GET", f"/categories/{category_id}", "Get single category")
        
        # Update category
        test_endpoint("PUT", f"/categories/{category_id}", "Update category",
                      json_data={"description": "Updated description"})
    
    # ==================== PRODUCTS ====================
    print_section("4. PRODUCTS ENDPOINTS")
    
    # Get products
    test_endpoint("GET", "/products", "Get products")
    
    # Get products with pagination
    test_endpoint("GET", "/products", "Get products paginated",
                  params={"page": 1, "per_page": 5})
    
    # Search products
    test_endpoint("GET", "/products/search", "Search products",
                  params={"q": "test"})
    
    # Get product by ID (if exists)
    test_endpoint("GET", "/products/1", "Get product by ID")
    
    # Get product by slug (if exists)
    test_endpoint("GET", "/products/slug/test-product", "Get product by slug")
    
    # Get flash sales
    test_endpoint("GET", "/products/flash-sales", "Get flash sales")
    
    # Create product (requires admin)
    product_data = {
        "name": "Test Product",
        "slug": f"test-product-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "description": "Test product for API testing",
        "price": 99.99,
        "stock_quantity": 100,
        "is_active": True
    }
    # This will likely fail without admin token
    test_endpoint("POST", "/products", "Create product (admin only)",
                  json_data=product_data, auth_token=auth_token,
                  skip=True)  # Skip as requires admin
    
    # ==================== CART ====================
    print_section("5. CART ENDPOINTS")
    
    # Get cart
    test_endpoint("GET", "/cart/", "Get cart", auth_token=auth_token)
    
    # Add to cart (need product first)
    # Try with product ID 1
    test_endpoint("POST", "/cart/items", "Add to cart",
                  json_data={"product_id": 1, "quantity": 1},
                  auth_token=auth_token)
    
    # Update cart item
    test_endpoint("PUT", "/cart/items/1", "Update cart item",
                  json_data={"quantity": 2},
                  auth_token=auth_token)
    
    # Remove from cart
    test_endpoint("DELETE", "/cart/items/1", "Remove from cart",
                  auth_token=auth_token)
    
    # Clear cart
    test_endpoint("DELETE", "/cart/", "Clear cart", auth_token=auth_token)
    
    # Merge guest cart
    test_endpoint("POST", "/cart/merge", "Merge guest cart",
                  json_data={"guest_cart_id": 1},
                  auth_token=auth_token)
    
    # ==================== WISHLIST ====================
    print_section("6. WISHLIST ENDPOINTS")
    
    # Get wishlist
    test_endpoint("GET", "/wishlist/", "Get wishlist", auth_token=auth_token)
    
    # Add to wishlist
    test_endpoint("POST", "/wishlist/items/1", "Add to wishlist",
                  auth_token=auth_token)
    
    # Remove from wishlist
    test_endpoint("DELETE", "/wishlist/items/1", "Remove from wishlist",
                  auth_token=auth_token)
    
    # Move to cart
    test_endpoint("POST", "/wishlist/move-to-cart/1", "Move to cart",
                  auth_token=auth_token)
    
    # ==================== ADDRESSES ====================
    print_section("7. ADDRESSES ENDPOINTS")
    
    # Create address
    address_data = {
        "first_name": "Test",
        "last_name": "User",
        "address_line1": "123 Test St",
        "city": "Test City",
        "state": "TS",
        "postal_code": "12345",
        "country": "Test Country",
        "phone": "+1234567890",
        "is_default": True
    }
    resp = test_endpoint("POST", "/addresses/", "Create address",
                         json_data=address_data, auth_token=auth_token)
    if resp and resp.status_code < 300:
        try:
            address_id = resp.json().get("id")
            print(f"{GREEN}Created test address ID: {address_id}{RESET}")
        except:
            pass
    
    # Get addresses
    test_endpoint("GET", "/addresses/", "Get addresses", auth_token=auth_token)
    
    # Get single address
    if address_id:
        test_endpoint("GET", f"/addresses/{address_id}", "Get single address",
                      auth_token=auth_token)
        
        # Update address
        test_endpoint("PUT", f"/addresses/{address_id}", "Update address",
                      json_data={"phone": "+9876543210"},
                      auth_token=auth_token)
        
        # Set as default
        test_endpoint("POST", f"/addresses/{address_id}/set-default", 
                      "Set default address", auth_token=auth_token)
        
        # Delete address
        test_endpoint("DELETE", f"/addresses/{address_id}", "Delete address",
                      auth_token=auth_token)
    
    # ==================== ORDERS ====================
    print_section("8. ORDERS ENDPOINTS")
    
    # Get orders (requires auth)
    test_endpoint("GET", "/orders/", "Get orders", 
                  auth_token=auth_token)
    
    # Create order (need address first)
    # This is complex and requires cart items
    test_endpoint("POST", "/orders/", "Create order",
                  json_data={
                      "shipping_address_id": address_id or 1,
                      "payment_method": "stripe"
                  },
                  auth_token=auth_token,
                  skip=True)  # Skip as requires setup
    
    # Create payment intent
    test_endpoint("POST", "/orders/create-payment-intent", "Create payment intent",
                  params={"amount": 100},
                  auth_token=auth_token)
    
    # Get order by ID
    test_endpoint("GET", "/orders/1", "Get order by ID",
                  auth_token=auth_token)
    
    # Cancel order
    test_endpoint("POST", "/orders/1/cancel", "Cancel order",
                  auth_token=auth_token)
    
    # Get invoice
    test_endpoint("GET", "/orders/1/invoice", "Get order invoice")
    
    # Complete payment
    test_endpoint("POST", "/orders/1/complete-payment", "Complete payment",
                  json_data={"payment_intent_id": "pi_test123"})
    
    # Return request
    test_endpoint("POST", "/orders/1/return-request", "Create return request",
                  json_data={"reason": "Test return", "description": "Testing"},
                  auth_token=auth_token)
    
    # Stripe webhook
    test_endpoint("POST", "/orders/webhook", "Stripe webhook",
                  json_data={"type": "payment_intent.succeeded"})
    
    # Confirm payment
    test_endpoint("POST", "/orders/confirm-payment/1", "Confirm payment",
                  json_data={"payment_intent_id": "pi_test123"},
                  auth_token=auth_token)
    
    # ==================== SEARCH ====================
    print_section("9. SEARCH ENDPOINTS")
    
    test_endpoint("GET", "/search", "Search",
                  params={"q": "test"})
    
    # ==================== CONTACT ====================
    print_section("10. CONTACT ENDPOINTS")
    
    test_endpoint("POST", "/contact", "Contact form",
                  json_data={
                      "name": "Test User",
                      "email": "test@test.com",
                      "subject": "Test Subject",
                      "message": "Test message"
                  })
    
    # ==================== UPLOAD ====================
    print_section("11. UPLOAD ENDPOINTS")
    
    # This requires actual file upload, skip for now
    test_endpoint("POST", "/upload/image", "Upload image", skip=True)
    
    # ==================== PAYMENT GATEWAYS ====================
    print_section("12. PAYMENT GATEWAY ENDPOINTS")
    
    # JazzCash
    test_endpoint("POST", "/jazzcash/initiate", "JazzCash initiate",
                  json_data={"amount": 100, "order_id": 1})
    
    test_endpoint("POST", "/jazzcash/callback", "JazzCash callback",
                  json_data={"status": "success"})
    
    # EasyPaisa
    test_endpoint("POST", "/easypaisa/initiate", "EasyPaisa initiate",
                  json_data={"amount": 100, "order_id": 1})
    
    test_endpoint("POST", "/easypaisa/callback", "EasyPaisa callback",
                  json_data={"status": "success"})
    
    # ==================== ADMIN ====================
    print_section("13. ADMIN ENDPOINTS")
    
    # All admin endpoints require admin token, skip for now
    test_endpoint("GET", "/admin/dashboard", "Admin dashboard",
                  auth_token=auth_token)
    
    test_endpoint("GET", "/admin/orders", "Admin orders",
                  auth_token=auth_token)
    
    test_endpoint("GET", "/admin/orders/1", "Admin get order",
                  auth_token=auth_token)
    
    test_endpoint("PATCH", "/admin/orders/1/status", "Update order status",
                  json_data={"status": "processing"},
                  auth_token=auth_token)
    
    test_endpoint("GET", "/admin/users", "Admin get users",
                  auth_token=auth_token)
    
    test_endpoint("PUT", "/admin/users/1", "Update user",
                  json_data={"is_active": True},
                  auth_token=auth_token)
    
    test_endpoint("DELETE", "/admin/users/1", "Delete user",
                  auth_token=auth_token)
    
    test_endpoint("POST", "/admin/coupons", "Create coupon",
                  json_data={
                      "code": "TEST10",
                      "discount_type": "percentage",
                      "discount_value": 10,
                      "is_active": True
                  },
                  auth_token=auth_token)
    
    test_endpoint("GET", "/admin/coupons", "Get coupons",
                  auth_token=auth_token)
    
    test_endpoint("POST", "/admin/coupons/validate", "Validate coupon",
                  json_data={"code": "TEST10", "order_total": 100})
    
    # ==================== VARIANTS ====================
    print_section("14. VARIANTS ENDPOINTS")
    
    test_endpoint("POST", "/variants/", "Create variant",
                  json_data={
                      "product_id": 1,
                      "name": "Size",
                      "value": "Large",
                      "price_adjustment": 10.0
                  },
                  auth_token=auth_token)
    
    test_endpoint("GET", "/variants/product/1", "Get product variants")
    
    test_endpoint("PUT", "/variants/1", "Update variant",
                  json_data={"price_adjustment": 15.0},
                  auth_token=auth_token)
    
    test_endpoint("DELETE", "/variants/1", "Delete variant",
                  auth_token=auth_token)
    
    # ==================== RETURNS ====================
    print_section("15. RETURNS ENDPOINTS")
    
    test_endpoint("POST", "/returns/", "Create return",
                  json_data={
                      "order_id": 1,
                      "reason": "Defective",
                      "description": "Product not working"
                  },
                  auth_token=auth_token)
    
    test_endpoint("GET", "/returns/", "Get returns",
                  auth_token=auth_token)
    
    test_endpoint("GET", "/returns/1", "Get return by ID",
                  auth_token=auth_token)
    
    test_endpoint("PUT", "/returns/1/status", "Update return status",
                  json_data={"status": "approved"},
                  auth_token=auth_token)
    
    # ==================== ROLES ====================
    print_section("16. ROLES ENDPOINTS")
    
    test_endpoint("POST", "/roles/", "Create role",
                  json_data={"name": "test_role", "permissions": ["read"]},
                  auth_token=auth_token)
    
    test_endpoint("GET", "/roles/", "Get roles",
                  auth_token=auth_token)
    
    test_endpoint("PUT", "/roles/1", "Update role",
                  json_data={"permissions": ["read", "write"]},
                  auth_token=auth_token)
    
    test_endpoint("DELETE", "/roles/1", "Delete role",
                  auth_token=auth_token)
    
    # ==================== SHIPPING ====================
    print_section("17. SHIPPING ENDPOINTS")
    
    test_endpoint("POST", "/shipping/calculate", "Calculate shipping",
                  json_data={
                      "address_id": 1,
                      "items": [{"product_id": 1, "quantity": 1}]
                  },
                  auth_token=auth_token)
    
    test_endpoint("GET", "/shipping/methods", "Get shipping methods")
    
    # ==================== REFERRAL ====================
    print_section("18. REFERRAL ENDPOINTS")
    
    test_endpoint("GET", "/referral/my-code", "Get referral code",
                  auth_token=auth_token)
    
    test_endpoint("GET", "/referral/stats", "Get referral stats",
                  auth_token=auth_token)
    
    # ==================== BULK ====================
    print_section("19. BULK ENDPOINTS")
    
    test_endpoint("POST", "/bulk/import", "Bulk import products",
                  json_data={"products": []},
                  auth_token=auth_token)
    
    test_endpoint("GET", "/bulk/export", "Bulk export products",
                  auth_token=auth_token)
    
    # ==================== NEWSLETTER ====================
    print_section("20. NEWSLETTER ENDPOINTS")
    
    test_endpoint("POST", "/newsletter/subscribe", "Subscribe to newsletter",
                  json_data={"email": "test@test.com"})
    
    test_endpoint("POST", "/newsletter/unsubscribe", "Unsubscribe from newsletter",
                  json_data={"email": "test@test.com"})
    
    test_endpoint("POST", "/newsletter/send", "Send newsletter",
                  json_data={
                      "subject": "Test Newsletter",
                      "content": "Test content"
                  },
                  auth_token=auth_token)
    
    # ==================== PRINT SUMMARY ====================
    print_section("TEST SUMMARY")
    
    total_tests = len(results["working"]) + len(results["failing"]) + len(results["skipped"])
    
    print(f"\n{GREEN}✓ Working:{RESET} {len(results['working'])}")
    print(f"{RED}✗ Failing:{RESET} {len(results['failing'])}")
    print(f"{YELLOW}○ Skipped:{RESET} {len(results['skipped'])}")
    print(f"{BLUE}Total:{RESET} {total_tests}")
    
    if results["failing"]:
        print(f"\n{RED}{'='*60}{RESET}")
        print(f"{RED}FAILING ENDPOINTS:{RESET}")
        print(f"{RED}{'='*60}{RESET}")
        for fail in results["failing"]:
            print(f"\n{RED}[FAIL]{RESET} {fail['method']} {fail['endpoint']}")
            print(f"       Description: {fail['description']}")
            if 'error' in fail:
                print(f"       Error: {fail['error']}")
            elif 'status_code' in fail:
                print(f"       Expected: {fail.get('expected_status', 'N/A')}, Got: {fail['status_code']}")
                if fail.get('response'):
                    print(f"       Response: {fail['response'][:200]}")
    
    print(f"\n{BLUE}Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET}")
    
    # Return exit code based on failures
    return 1 if results["failing"] else 0

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}Tests interrupted by user{RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{RED}Fatal error: {e}{RESET}")
        sys.exit(1)
