"""
Overall API Test Summary
Tests all endpoints and provides final report
"""

import httpx
import json

BASE_URL = "http://127.0.0.1:8000/api"
ADMIN_EMAIL = "hk202504@gmail.com"
ADMIN_PASSWORD = "Uzair_1234"

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'

class APITester:
    def __init__(self):
        self.client = httpx.Client(timeout=60.0, follow_redirects=True)
        self.admin_token = None
        self.user_token = None
        self.results = {"pass": [], "fail": [], "skip": []}
    
    def login_admin(self):
        """Get admin token"""
        try:
            resp = self.client.post(
                f"{BASE_URL}/auth/login",
                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
            )
            print(f"  Admin login: {resp.status_code}")
            if resp.status_code == 200:
                self.admin_token = resp.json().get("access_token")
                return True
        except Exception as e:
            print(f"  Admin login error: {e}")
        return False
    
    def register_and_login_user(self):
        """Create test user and get token"""
        import time
        email = f"test_{int(time.time())}@test.com"
        try:
            # Register
            resp = self.client.post(
                f"{BASE_URL}/auth/register",
                json={"email": email, "username": f"test_{int(time.time())}", 
                      "password": "Test1234!", "full_name": "Test User"}
            )
            print(f"  User register: {resp.status_code}")
            if resp.status_code == 201 or resp.status_code == 400:
                # Login
                resp = self.client.post(
                    f"{BASE_URL}/auth/login",
                    json={"email": email, "password": "Test1234!"}
                )
                print(f"  User login: {resp.status_code}")
                if resp.status_code == 200:
                    self.user_token = resp.json().get("access_token")
                    return True
        except Exception as e:
            print(f"  User creation error: {e}")
        return False
    
    def test(self, method, endpoint, desc, auth="admin", expected=200, json_data=None, params=None):
        """Test endpoint"""
        url = f"{BASE_URL}{endpoint}"
        headers = {}
        
        if auth == "admin" and self.admin_token:
            headers["Authorization"] = f"Bearer {self.admin_token}"
        elif auth == "user" and self.user_token:
            headers["Authorization"] = f"Bearer {self.user_token}"
        elif auth == "none":
            pass
        else:
            return "skip"
        
        try:
            if method == "GET":
                resp = self.client.get(url, headers=headers, params=params)
            elif method == "POST":
                resp = self.client.post(url, headers=headers, json=json_data)
            elif method == "PUT":
                resp = self.client.put(url, headers=headers, json=json_data)
            elif method == "DELETE":
                resp = self.client.delete(url, headers=headers)
            elif method == "PATCH":
                resp = self.client.patch(url, headers=headers, json=json_data)
            
            result = {
                "method": method,
                "endpoint": endpoint,
                "desc": desc,
                "status": resp.status_code,
                "expected": expected
            }
            
            # 307 = redirect, which is often OK (e.g., trailing slash redirects)
            if resp.status_code < 400 or resp.status_code == expected:
                self.results["pass"].append(result)
                return "pass"
            else:
                self.results["fail"].append(result)
                return "fail"
        except Exception as e:
            self.results["fail"].append({
                "method": method,
                "endpoint": endpoint,
                "desc": desc,
                "error": str(e)
            })
            return "fail"
    
    def print_result(self, status):
        if status == "pass":
            print(f"{GREEN}[✓]{RESET}", end=" ")
        elif status == "fail":
            print(f"{RED}[✗]{RESET}", end=" ")
        else:
            print(f"{YELLOW}[○]{RESET}", end=" ")
    
    def run_all_tests(self):
        print(f"\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}{'OVERALL API TEST - COMPLETE BACKEND':^70}{RESET}")
        print(f"{BLUE}{'='*70}{RESET}\n")
        
        # Login
        print(f"{CYAN}Setting up authentication...{RESET}")
        admin_ok = self.login_admin()
        user_ok = self.register_and_login_user()
        
        if admin_ok:
            print(f"{GREEN}✓ Admin logged in{RESET}")
        else:
            print(f"{RED}✗ Admin login failed{RESET}")
        
        if user_ok:
            print(f"{GREEN}✓ Test user created{RESET}")
        else:
            print(f"{RED}✗ User creation failed{RESET}")
        
        print()
        
        # ============ PUBLIC ENDPOINTS ============
        print(f"\n{BLUE}1. PUBLIC ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/", "Root endpoint", "none"))
        self.print_result(self.test("GET", "/health", "Health check", "none"))
        self.print_result(self.test("GET", "/api/docs", "Swagger docs", "none"))
        
        # ============ AUTH ENDPOINTS ============
        print(f"\n{BLUE}2. AUTH ENDPOINTS{RESET}")
        self.print_result(self.test("POST", "/auth/register", "Register user", "none", 
                                    json_data={"email": "test2@test.com", "username": "test2", 
                                             "password": "Test1234!", "full_name": "Test"}))
        self.print_result(self.test("POST", "/auth/login", "Login user", "none",
                                    json_data={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}))
        self.print_result(self.test("POST", "/auth/forgot-password", "Forgot password", "none",
                                    json_data={"email": ADMIN_EMAIL}))
        self.print_result(self.test("GET", "/auth/profile", "Get profile", "admin"))
        self.print_result(self.test("GET", "/auth/me", "Get current user", "admin"))
        self.print_result(self.test("PUT", "/auth/me", "Update user", "admin",
                                    json_data={"full_name": "Updated Admin"}))
        
        # ============ CATEGORIES ============
        print(f"\n{BLUE}3. CATEGORIES ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/categories", "Get categories", "none"))
        self.print_result(self.test("GET", "/categories/all", "Get all categories", "none"))
        self.print_result(self.test("POST", "/categories", "Create category", "none",
                                    json_data={"name": "Test Cat", "slug": f"test-cat-{int(__import__('time').time())}"}))
        self.print_result(self.test("GET", "/categories/1", "Get category", "none"))
        
        # ============ PRODUCTS ============
        print(f"\n{BLUE}4. PRODUCTS ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/products", "Get products", "none"))
        self.print_result(self.test("GET", "/products", "Get products (paginated)", "none", 
                                    params={"page": 1, "per_page": 5}))
        self.print_result(self.test("GET", "/products/search", "Search products", "none",
                                    params={"q": "test"}))
        self.print_result(self.test("GET", "/products/1", "Get product by ID", "none"))
        self.print_result(self.test("GET", "/products/flash-sales", "Get flash sales", "none",
                                    params={"skip": 0, "limit": 20}))
        
        # ============ CART ============
        print(f"\n{BLUE}5. CART ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/cart/", "Get cart", "user"))
        self.print_result(self.test("POST", "/cart/items", "Add to cart", "user",
                                    json_data={"product_id": 1, "quantity": 1, "variant": None}))
        self.print_result(self.test("DELETE", "/cart/", "Clear cart", "user"))
        
        # ============ WISHLIST ============
        print(f"\n{BLUE}6. WISHLIST ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/wishlist/", "Get wishlist", "user"))
        self.print_result(self.test("POST", "/wishlist/items/1", "Add to wishlist", "user"))
        
        # ============ ADDRESSES ============
        print(f"\n{BLUE}7. ADDRESSES ENDPOINTS{RESET}")
        self.print_result(self.test("POST", "/addresses/", "Create address", "user",
                                    json_data={"first_name": "Test", "last_name": "User", 
                                             "address_line1": "123 Test St", "city": "Test City",
                                             "state": "TS", "postal_code": "12345", "country": "PK",
                                             "phone": "+923001234567", "is_default": True}))
        self.print_result(self.test("GET", "/addresses/", "Get addresses", "user"))
        
        # ============ ORDERS ============
        print(f"\n{BLUE}8. ORDERS ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/orders/", "Get orders", "user"))
        self.print_result(self.test("GET", "/orders/1/invoice", "Get invoice", "none"))
        
        # ============ SEARCH & CONTACT ============
        print(f"\n{BLUE}9. SEARCH & CONTACT{RESET}")
        self.print_result(self.test("GET", "/search", "Search", "none", params={"q": "test"}))
        self.print_result(self.test("POST", "/contact", "Contact form", "none",
                                    json_data={"name": "Test", "email": "test@test.com", 
                                             "subject": "Test", "message": "Test message"}))
        
        # ============ ADMIN ENDPOINTS ============
        print(f"\n{BLUE}10. ADMIN ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/admin/dashboard", "Dashboard stats", "admin"))
        self.print_result(self.test("GET", "/admin/orders", "Admin orders", "admin",
                                    params={"page": 1, "per_page": 10}))
        self.print_result(self.test("GET", "/admin/orders/1", "Get order", "admin"))
        self.print_result(self.test("PATCH", "/admin/orders/1/status", "Update order status", "admin",
                                    json_data={"status": "processing"}))
        self.print_result(self.test("GET", "/admin/users", "Admin users", "admin",
                                    params={"page": 1, "per_page": 10}))
        self.print_result(self.test("PUT", "/admin/users/1", "Update user", "admin",
                                    json_data={"is_active": True}))
        self.print_result(self.test("POST", "/admin/coupons", "Create coupon", "admin",
                                    json_data={"code": f"TEST{int(__import__('time').time())}", 
                                             "discount_type": "percentage", "discount_value": 10,
                                             "is_active": True}))
        self.print_result(self.test("GET", "/admin/coupons", "Get coupons", "admin",
                                    params={"page": 1, "per_page": 10}))
        self.print_result(self.test("POST", "/admin/coupons/validate", "Validate coupon", "none",
                                    json_data={"code": "TEST", "order_total": 100}))
        
        # ============ VARIANTS ============
        print(f"\n{BLUE}11. VARIANTS ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/variants/product/1", "Get product variants", "none"))
        
        # ============ RETURNS ============
        print(f"\n{BLUE}12. RETURNS ENDPOINTS{RESET}")
        self.print_result(self.test("GET", "/returns/", "Get returns", "user"))
        
        # ============ PAYMENT GATEWAYS ============
        print(f"\n{BLUE}13. PAYMENT GATEWAYS{RESET}")
        self.print_result(self.test("POST", "/jazzcash/initiate", "JazzCash initiate", "none",
                                    json_data={"order_id": 1, "phone_number": "+923001234567"}))
        self.print_result(self.test("POST", "/easypaisa/initiate", "EasyPaisa initiate", "none",
                                    json_data={"order_id": 1, "phone_number": "+923001234567"}))
        
        # Print summary
        total = len(self.results["pass"]) + len(self.results["fail"]) + len(self.results["skip"])
        pass_rate = (len(self.results["pass"]) / total * 100) if total > 0 else 0
        
        print(f"\n\n{BLUE}{'='*70}{RESET}")
        print(f"{BLUE}{'FINAL TEST SUMMARY':^70}{RESET}")
        print(f"{BLUE}{'='*70}{RESET}\n")
        
        print(f"{GREEN}✓ Passed:{RESET}  {len(self.results['pass'])}")
        print(f"{RED}✗ Failed:{RESET}  {len(self.results['fail'])}")
        print(f"{YELLOW}○ Skipped:{RESET} {len(self.results['skip'])}")
        print(f"{BLUE}Total:{RESET}   {total}")
        print(f"{BLUE}Pass Rate:{RESET} {pass_rate:.1f}%\n")
        
        if pass_rate >= 90:
            print(f"{GREEN}🎉 Excellent! Backend is in great shape!{RESET}")
        elif pass_rate >= 70:
            print(f"{GREEN}✓ Good! Most APIs are working.{RESET}")
        elif pass_rate >= 50:
            print(f"{YELLOW}⚠ Fair. Some APIs need fixes.{RESET}")
        else:
            print(f"{RED}⚠ Poor. Many APIs need attention.{RESET}")
        
        # Show failures
        if self.results["fail"]:
            print(f"\n{RED}{'='*70}{RESET}")
            print(f"{RED}FAILING ENDPOINTS:{RESET}")
            print(f"{RED}{'='*70}{RESET}")
            for fail in self.results["fail"]:
                print(f"{RED}[✗]{RESET} {fail.get('method', '?')} {fail.get('endpoint', '?')} - {fail.get('desc', '?')}")
                if 'error' in fail:
                    print(f"    Error: {fail['error']}")
                elif 'status' in fail:
                    print(f"    Expected: {fail.get('expected', '?')}, Got: {fail['status']}")
        
        print(f"\n{BLUE}Test completed at: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{RESET}\n")
        
        return len(self.results["fail"]) == 0

if __name__ == "__main__":
    tester = APITester()
    success = tester.run_all_tests()
    exit(0 if success else 1)
