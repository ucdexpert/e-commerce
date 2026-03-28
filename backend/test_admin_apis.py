"""
Admin API Test Script
Tests all admin endpoints with admin credentials
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
RESET = '\033[0m'

def get_admin_token():
    """Login and get admin token"""
    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("access_token")
        else:
            print(f"{RED}Failed to get admin token: {response.text}{RESET}")
            return None

def test_endpoint(method, endpoint, description, token, json_data=None, params=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        with httpx.Client(timeout=30.0) as client:
            if method == "GET":
                response = client.get(url, headers=headers, params=params)
            elif method == "POST":
                response = client.post(url, headers=headers, json=json_data)
            elif method == "PUT":
                response = client.put(url, headers=headers, json=json_data)
            elif method == "DELETE":
                response = client.delete(url, headers=headers)
            elif method == "PATCH":
                response = client.patch(url, headers=headers, json=json_data)
            else:
                return None
        
        if response.status_code < 300:
            print(f"{GREEN}[PASS]{RESET} {method} {endpoint} - {description} ({response.status_code})")
            return response
        else:
            print(f"{RED}[FAIL]{RESET} {method} {endpoint} - {description} ({response.status_code})")
            if response.text:
                try:
                    error = response.json()
                    print(f"       Error: {json.dumps(error, indent=2)[:200]}")
                except:
                    print(f"       Error: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"{RED}[ERROR]{RESET} {method} {endpoint} - {description} ({str(e)})")
        return None

def main():
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}{'ADMIN API TEST':^60}{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # Get admin token
    print(f"Logging in as {ADMIN_EMAIL}...")
    token = get_admin_token()
    
    if not token:
        print(f"{RED}Cannot proceed without admin token!{RESET}")
        return
    
    print(f"{GREEN}✓ Admin token obtained!{RESET}\n")
    
    results = {"pass": 0, "fail": 0}
    
    # ==================== ADMIN DASHBOARD ====================
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}ADMIN DASHBOARD & STATS{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    resp = test_endpoint("GET", "/admin/dashboard", "Get dashboard stats", token)
    if resp:
        results["pass"] += 1
        data = resp.json()
        print(f"  Total Revenue: ${data.get('total_revenue', 0):.2f}")
        print(f"  Total Orders: {data.get('total_orders', 0)}")
        print(f"  Total Products: {data.get('total_products', 0)}")
        print(f"  Total Users: {data.get('total_users', 0)}")
    else:
        results["fail"] += 1
    
    # ==================== ADMIN ORDERS ====================
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}ADMIN ORDERS MANAGEMENT{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    resp = test_endpoint("GET", "/admin/orders", "Get all orders", token, params={"page": 1, "per_page": 10})
    if resp:
        results["pass"] += 1
        data = resp.json()
        print(f"  Total Orders: {data.get('total', 0)}")
    else:
        results["fail"] += 1
    
    resp = test_endpoint("GET", "/admin/orders/1", "Get order by ID", token)
    if resp:
        results["pass"] += 1
    else:
        results["fail"] += 1
    
    resp = test_endpoint("PATCH", "/admin/orders/1/status", "Update order status", token, 
                         json_data={"status": "processing"})
    if resp:
        results["pass"] += 1
    else:
        results["fail"] += 1
    
    # ==================== ADMIN USERS ====================
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}ADMIN USERS MANAGEMENT{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    resp = test_endpoint("GET", "/admin/users", "Get all users", token, params={"page": 1, "per_page": 10})
    if resp:
        results["pass"] += 1
        data = resp.json()
        print(f"  Total Users: {len(data)}")
    else:
        results["fail"] += 1
    
    resp = test_endpoint("PUT", "/admin/users/1", "Update user", token, 
                         json_data={"is_active": True})
    if resp:
        results["pass"] += 1
    else:
        results["fail"] += 1
    
    # ==================== ADMIN COUPONS ====================
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}ADMIN COUPONS MANAGEMENT{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    # Create coupon
    coupon_data = {
        "code": f"ADMIN_TEST_{int(__import__('time').time())}",
        "discount_type": "percentage",
        "discount_value": 15,
        "min_order_amount": 50,
        "max_discount_amount": 100,
        "is_active": True
    }
    
    resp = test_endpoint("POST", "/admin/coupons", "Create coupon", token, json_data=coupon_data)
    if resp:
        results["pass"] += 1
        coupon_id = resp.json().get("id")
        print(f"  Created coupon ID: {coupon_id}")
        
        # Update coupon
        resp = test_endpoint("PUT", f"/admin/coupons/{coupon_id}", "Update coupon", token,
                             json_data={"discount_value": 20})
        if resp:
            results["pass"] += 1
        else:
            results["fail"] += 1
        
        # Delete coupon
        resp = test_endpoint("DELETE", f"/admin/coupons/{coupon_id}", "Delete coupon", token)
        if resp:
            results["pass"] += 1
        else:
            results["fail"] += 1
    else:
        results["fail"] += 1
    
    # Get all coupons
    resp = test_endpoint("GET", "/admin/coupons", "Get all coupons", token, params={"page": 1, "per_page": 10})
    if resp:
        results["pass"] += 1
    else:
        results["fail"] += 1
    
    # Validate coupon (public endpoint, no auth needed)
    resp = test_endpoint("POST", "/admin/coupons/validate", "Validate coupon", None,
                         json_data={"code": "TEST10", "order_total": 100})
    if resp:
        results["pass"] += 1
    else:
        results["fail"] += 1
    
    # ==================== SUMMARY ====================
    print(f"\n{BLUE}{'='*60}{RESET}")
    print(f"{BLUE}TEST SUMMARY{RESET}")
    print(f"{BLUE}{'='*60}{RESET}\n")
    
    total = results["pass"] + results["fail"]
    pass_rate = (results["pass"] / total * 100) if total > 0 else 0
    
    print(f"{GREEN}✓ Passed:{RESET} {results['pass']}")
    print(f"{RED}✗ Failed:{RESET} {results['fail']}")
    print(f"{BLUE}Total:{RESET} {total}")
    print(f"{BLUE}Pass Rate:{RESET} {pass_rate:.1f}%")
    
    if results["fail"] == 0:
        print(f"\n{GREEN}🎉 All admin APIs are working!{RESET}")
    else:
        print(f"\n{RED}⚠️ Some admin APIs need attention{RESET}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{YELLOW}Tests interrupted by user{RESET}")
    except Exception as e:
        print(f"\n{RED}Fatal error: {e}{RESET}")
