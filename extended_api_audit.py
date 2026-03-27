#!/usr/bin/env python3
"""
Extended API Audit - Testing additional endpoints not covered in main test
Tests: 2FA, Newsletter, Referral, Shipping, Returns, Bulk, Upload, Contact, JazzCash, EasyPaisa
"""

import httpx
import json
import time
from datetime import datetime
from typing import Dict, List, Any, Optional

# Configuration
BASE_URL = "http://localhost:8000"
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")
TEST_EMAIL = f"extended_test_{TIMESTAMP}@test.com"
TEST_PASSWORD = "TestPassword123!"
TEST_USERNAME = f"extended_user_{TIMESTAMP}"

# Test results storage
test_results = []
failed_tests = []
category_stats = {}

def log_result(
    test_num: int,
    endpoint: str,
    method: str,
    expected_status: int,
    actual_status: int,
    response_time: float,
    notes: str = "",
    request_body: Optional[Dict] = None,
    response_body: Optional[Dict] = None,
    category: str = "General"
):
    """Log a test result"""
    status = "✅ PASS" if expected_status == actual_status else "❌ FAIL"

    result = {
        "test_num": test_num,
        "endpoint": endpoint,
        "method": method,
        "expected_status": expected_status,
        "actual_status": actual_status,
        "status": status,
        "response_time": response_time,
        "notes": notes,
        "request_body": request_body,
        "response_body": response_body,
        "category": category
    }

    test_results.append(result)

    # Update category stats
    if category not in category_stats:
        category_stats[category] = {"total": 0, "passed": 0, "failed": 0}
    category_stats[category]["total"] += 1
    if status == "✅ PASS":
        category_stats[category]["passed"] += 1
    else:
        category_stats[category]["failed"] += 1
        failed_tests.append(result)

    print(f"[{status}] Test #{test_num}: {method} {endpoint} - {response_time:.0f}ms - {notes}")

def make_request(
    client: httpx.Client,
    method: str,
    endpoint: str,
    expected_status: int,
    headers: Optional[Dict] = None,
    json_data: Optional[Dict] = None,
    params: Optional[Dict] = None,
    notes: str = "",
    category: str = "General"
) -> Optional[Dict]:
    """Make an HTTP request and log the result"""
    url = f"{BASE_URL}{endpoint}"

    start_time = time.time()
    try:
        if method == "GET":
            response = client.get(url, headers=headers, params=params, timeout=30.0)
        elif method == "POST":
            response = client.post(url, headers=headers, json=json_data, timeout=30.0)
        elif method == "PUT":
            response = client.put(url, headers=headers, json=json_data, timeout=30.0)
        elif method == "PATCH":
            response = client.patch(url, headers=headers, json=json_data, timeout=30.0)
        elif method == "DELETE":
            response = client.delete(url, headers=headers, timeout=30.0)
        else:
            raise ValueError(f"Unknown method: {method}")

        response_time = (time.time() - start_time) * 1000

        try:
            response_body = response.json()
        except:
            response_body = {"raw": response.text}

        log_result(
            test_num=len(test_results) + 1,
            endpoint=endpoint,
            method=method,
            expected_status=expected_status,
            actual_status=response.status_code,
            response_time=response_time,
            notes=notes or f"Status: {response.status_code}",
            request_body=json_data,
            response_body=response_body,
            category=category
        )

        return response_body

    except httpx.ConnectError as e:
        response_time = (time.time() - start_time) * 1000
        log_result(
            test_num=len(test_results) + 1,
            endpoint=endpoint,
            method=method,
            expected_status=expected_status,
            actual_status=0,
            response_time=response_time,
            notes=f"Connection Error: {str(e)}",
            category=category
        )
        return None
    except Exception as e:
        response_time = (time.time() - start_time) * 1000
        log_result(
            test_num=len(test_results) + 1,
            endpoint=endpoint,
            method=method,
            expected_status=expected_status,
            actual_status=0,
            response_time=response_time,
            notes=f"Error: {str(e)}",
            category=category
        )
        return None

def run_extended_tests():
    """Run extended API tests"""
    print("=" * 80)
    print("EXTENDED API AUDIT - Additional Endpoints")
    print(f"Base URL: {BASE_URL}")
    print(f"Timestamp: {TIMESTAMP}")
    print("=" * 80)

    access_token = None
    refresh_token = None
    admin_token = None
    test_user_id = None

    with httpx.Client(timeout=30.0) as client:

        # ============================================
        # PHASE 1: Register and Login
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 1: Authentication Setup")
        print("=" * 60)

        # Register new user
        register_data = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "username": TEST_USERNAME,
            "full_name": "Extended Test User"
        }
        response = make_request(
            client, "POST", "/api/auth/register", 201,
            json_data=register_data,
            notes="Register new user for extended tests",
            category="Auth"
        )

        if response and "access_token" in response:
            access_token = response["access_token"]
            refresh_token = response.get("refresh_token")
            test_user_id = response.get("user", {}).get("id") or response.get("id")
            print(f"  → Got access_token, user_id: {test_user_id}")

        # Login
        login_data = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
        response = make_request(
            client, "POST", "/api/auth/login", 200,
            json_data=login_data,
            notes="Login user",
            category="Auth"
        )

        if response and "access_token" in response:
            access_token = response["access_token"]
            print(f"  → Login successful")

        auth_headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}

        # ============================================
        # PHASE 2: Two-Factor Authentication (2FA)
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 2: Two-Factor Authentication (2FA)")
        print("=" * 60)

        # Setup 2FA
        make_request(
            client, "POST", "/api/auth/2fa/setup", 200,
            headers=auth_headers,
            notes="Setup 2FA - get QR code and secret",
            category="2FA"
        )

        # Verify 2FA setup (will fail without valid code)
        make_request(
            client, "POST", "/api/auth/2fa/verify-setup", 400,
            headers=auth_headers,
            params={"code": "123456"},
            notes="Verify 2FA setup with invalid code",
            category="2FA"
        )

        # Verify 2FA (will fail without temp_token)
        make_request(
            client, "POST", "/api/auth/2fa/verify", 400,
            json_data={"code": "123456", "temp_token": "invalid"},
            notes="Verify 2FA during login (no temp token)",
            category="2FA"
        )

        # Disable 2FA (will fail without 2FA enabled)
        make_request(
            client, "POST", "/api/auth/2fa/disable", 400,
            headers=auth_headers,
            json_data={"code": "123456"},
            notes="Disable 2FA (not enabled yet)",
            category="2FA"
        )

        # ============================================
        # PHASE 3: Newsletter Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 3: Newsletter Endpoints")
        print("=" * 60)

        # Subscribe to newsletter
        make_request(
            client, "POST", "/api/newsletter/subscribe", 200,
            params={"email": TEST_EMAIL, "name": "Test User", "source": "api_test"},
            notes="Subscribe to newsletter",
            category="Newsletter"
        )

        # Subscribe again (idempotent)
        make_request(
            client, "POST", "/api/newsletter/subscribe", 200,
            params={"email": TEST_EMAIL},
            notes="Subscribe again (idempotent)",
            category="Newsletter"
        )

        # Unsubscribe
        make_request(
            client, "GET", "/api/newsletter/unsubscribe", 200,
            params={"email": TEST_EMAIL},
            notes="Unsubscribe from newsletter",
            category="Newsletter"
        )

        # Get subscribers (admin only - will fail)
        make_request(
            client, "GET", "/api/newsletter/admin/subscribers", 403,
            headers=auth_headers,
            notes="Get subscribers (requires admin)",
            category="Newsletter"
        )

        # Export subscribers (admin only)
        make_request(
            client, "GET", "/api/newsletter/admin/export", 403,
            headers=auth_headers,
            notes="Export subscribers CSV (requires admin)",
            category="Newsletter"
        )

        # Get newsletter stats (admin only)
        make_request(
            client, "GET", "/api/newsletter/admin/stats", 403,
            headers=auth_headers,
            notes="Get newsletter stats (requires admin)",
            category="Newsletter"
        )

        # ============================================
        # PHASE 4: Referral Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 4: Referral Endpoints")
        print("=" * 60)

        # Get my referral code
        make_request(
            client, "GET", "/api/referral/my-referral", 200,
            headers=auth_headers,
            notes="Get my referral code and stats",
            category="Referral"
        )

        # Get referrals list
        make_request(
            client, "GET", "/api/referral/referrals", 200,
            headers=auth_headers,
            notes="Get my referrals list",
            category="Referral"
        )

        # Apply referral code (will fail - can't use own code)
        make_request(
            client, "POST", "/api/referral/apply", 400,
            headers=auth_headers,
            params={"referral_code": "INVALID123"},
            notes="Apply invalid referral code",
            category="Referral"
        )

        # ============================================
        # PHASE 5: Shipping Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 5: Shipping Endpoints")
        print("=" * 60)

        # Get shipping companies
        make_request(
            client, "GET", "/api/shipping/companies", 200,
            notes="Get all shipping companies",
            category="Shipping"
        )

        # Calculate shipping (no rates may exist)
        make_request(
            client, "POST", "/api/shipping/calculate", 200,
            json_data={"city": "Karachi", "total_amount": 100.0, "weight_kg": 1.0},
            notes="Calculate shipping rates",
            category="Shipping"
        )

        # Track shipment (invalid tracking number)
        make_request(
            client, "GET", "/api/shipping/track/INVALID123", 404,
            params={"company_code": "TCS"},
            notes="Track shipment (invalid tracking)",
            category="Shipping"
        )

        # Create shipping company (admin only)
        make_request(
            client, "POST", "/api/shipping/companies", 403,
            headers=auth_headers,
            json_data={"name": "Test Courier", "code": "TEST"},
            notes="Create shipping company (requires admin)",
            category="Shipping"
        )

        # ============================================
        # PHASE 6: Returns Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 6: Returns Endpoints")
        print("=" * 60)

        # Get my returns (empty list expected)
        make_request(
            client, "GET", "/api/returns/", 200,
            headers=auth_headers,
            notes="Get my return requests",
            category="Returns"
        )

        # Create return (will fail - no orders exist)
        make_request(
            client, "POST", "/api/returns/", 404,
            headers=auth_headers,
            json_data={
                "order_id": 99999,
                "reason": "damaged",
                "reason_detail": "Test return",
                "items": [{"order_item_id": 1, "product_id": 1, "quantity": 1, "reason": "damaged"}],
                "refund_method": "original"
            },
            notes="Create return (no valid order)",
            category="Returns"
        )

        # Get all returns (admin only)
        make_request(
            client, "GET", "/api/returns/admin/all", 403,
            headers=auth_headers,
            notes="Get all returns (requires admin)",
            category="Returns"
        )

        # ============================================
        # PHASE 7: Bulk Import/Export Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 7: Bulk Import/Export Endpoints")
        print("=" * 60)

        # Export products (admin only)
        make_request(
            client, "GET", "/api/bulk/products/export", 403,
            headers=auth_headers,
            notes="Export products CSV (requires admin)",
            category="Bulk"
        )

        # Import products (admin only, no file)
        make_request(
            client, "POST", "/api/bulk/products/import", 403,
            headers=auth_headers,
            notes="Import products CSV (requires admin)",
            category="Bulk"
        )

        # ============================================
        # PHASE 8: Upload Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 8: Upload Endpoints")
        print("=" * 60)

        # Upload root endpoint
        make_request(
            client, "POST", "/api/upload/", 200,
            notes="Upload root endpoint info",
            category="Upload"
        )

        # Upload images (no files - expected 422)
        make_request(
            client, "POST", "/api/upload/images", 422,
            headers=auth_headers,
            notes="Upload images (no files provided)",
            category="Upload"
        )

        # ============================================
        # PHASE 9: Contact Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 9: Contact Endpoints")
        print("=" * 60)

        # Submit contact form
        make_request(
            client, "POST", "/api/contact/", 200,
            json_data={
                "name": "Test User",
                "email": TEST_EMAIL,
                "subject": "API Test",
                "message": "This is a test message from API audit"
            },
            notes="Submit contact form",
            category="Contact"
        )

        # ============================================
        # PHASE 10: JazzCash & EasyPaisa Payment
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 10: Payment Gateway Endpoints")
        print("=" * 60)

        # JazzCash endpoints
        make_request(
            client, "POST", "/api/jazzcash/initiate", 422,
            json_data={},
            notes="JazzCash initiate (missing required fields)",
            category="Payment"
        )

        make_request(
            client, "POST", "/api/jazzcash/callback", 422,
            json_data={},
            notes="JazzCash callback (missing required fields)",
            category="Payment"
        )

        # EasyPaisa endpoints
        make_request(
            client, "POST", "/api/easypaisa/initiate", 422,
            json_data={},
            notes="EasyPaisa initiate (missing required fields)",
            category="Payment"
        )

        make_request(
            client, "POST", "/api/easypaisa/callback", 422,
            json_data={},
            notes="EasyPaisa callback (missing required fields)",
            category="Payment"
        )

        # ============================================
        # PHASE 11: Variants Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 11: Product Variants Endpoints")
        print("=" * 60)

        # Get product variants (non-existent product)
        make_request(
            client, "GET", "/api/variants/99999", 404,
            notes="Get variants for non-existent product",
            category="Variants"
        )

        # Create variant (admin only)
        make_request(
            client, "POST", "/api/variants/1", 403,
            headers=auth_headers,
            json_data={"name": "Test Variant", "value": "Red"},
            notes="Create product variant (requires admin)",
            category="Variants"
        )

        # ============================================
        # PHASE 12: Roles Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 12: Roles Endpoints")
        print("=" * 60)

        # Get user roles (admin only)
        make_request(
            client, "GET", "/api/roles/", 403,
            headers=auth_headers,
            notes="Get all roles (requires admin)",
            category="Roles"
        )

        # Create role (admin only)
        make_request(
            client, "POST", "/api/roles/", 403,
            headers=auth_headers,
            json_data={"name": "Test Role", "permissions": []},
            notes="Create role (requires admin)",
            category="Roles"
        )

        # ============================================
        # PHASE 13: Additional Product Endpoints
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 13: Additional Product Endpoints")
        print("=" * 60)

        # Get flash sales
        make_request(
            client, "GET", "/api/products/flash-sales", 200,
            notes="Get flash sale products",
            category="Products"
        )

        # Get product reviews (non-existent product)
        make_request(
            client, "GET", "/api/products/99999/reviews", 404,
            notes="Get reviews for non-existent product",
            category="Products"
        )

        # Add review (will fail - no product)
        make_request(
            client, "POST", "/api/products/99999/reviews", 404,
            headers=auth_headers,
            params={"rating": 5, "comment": "Test review"},
            notes="Add review to non-existent product",
            category="Products"
        )

        # Get related products (non-existent)
        make_request(
            client, "GET", "/api/products/99999/related", 404,
            params={"limit": 4},
            notes="Get related products for non-existent product",
            category="Products"
        )

        # ============================================
        # PHASE 14: Categories Additional
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 14: Additional Category Endpoints")
        print("=" * 60)

        # Get all categories (flat list)
        make_request(
            client, "GET", "/api/categories/all", 200,
            notes="Get all categories (flat list)",
            category="Categories"
        )

        # Get category by ID (non-existent)
        make_request(
            client, "GET", "/api/categories/99999", 404,
            notes="Get non-existent category",
            category="Categories"
        )

        # Update category (non-existent)
        make_request(
            client, "PUT", "/api/categories/99999", 404,
            headers=auth_headers,
            json_data={"name": "Updated Name"},
            notes="Update non-existent category",
            category="Categories"
        )

        # Delete category (non-existent)
        make_request(
            client, "DELETE", "/api/categories/99999", 404,
            headers=auth_headers,
            notes="Delete non-existent category",
            category="Categories"
        )

        # ============================================
        # PHASE 15: Profile Endpoint
        # ============================================
        print("\n" + "=" * 60)
        print("PHASE 15: Profile Endpoint")
        print("=" * 60)

        # Get profile (this is the actual endpoint in main.py)
        make_request(
            client, "GET", "/api/profile", 200,
            headers=auth_headers,
            notes="Get user profile",
            category="Profile"
        )

    # Generate report
    generate_report()

def generate_report():
    """Generate markdown report"""
    total_tests = len(test_results)
    passed = sum(1 for r in test_results if r["status"] == "✅ PASS")
    failed = total_tests - passed
    pass_rate = (passed / total_tests * 100) if total_tests > 0 else 0
    avg_response_time = sum(r["response_time"] for r in test_results) / total_tests if total_tests > 0 else 0

    report = f"""# EXTENDED API AUDIT REPORT

**Date:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Base URL:** {BASE_URL}
**Test User Email:** {TEST_EMAIL}

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | {total_tests} |
| Passed | {passed} |
| Failed | {failed} |
| Pass Rate | {pass_rate:.1f}% |
| Average Response Time | {avg_response_time:.0f}ms |

---

## Results Table

| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |
|---|----------|--------|----------|--------|--------|---------------|-------|
"""

    for r in test_results:
        report += f"| {r['test_num']} | {r['endpoint']} | {r['method']} | {r['expected_status']} | {r['actual_status']} | {r['status']} | {r['response_time']:.0f}ms | {r['notes']} |\n"

    report += "\n---\n\n## Failed Tests (Detailed)\n"

    if failed_tests:
        for ft in failed_tests:
            report += f"""
### Test #{ft['test_num']}: {ft['endpoint']}

- **Endpoint:** `{BASE_URL}{ft['endpoint']}`
- **Method:** {ft['method']}
- **Expected Status:** {ft['expected_status']}
- **Actual Status:** {ft['actual_status']}
- **Category:** {ft['category']}
- **Notes:** {ft['notes']}
- **Request Body:** `{json.dumps(ft['request_body']) if ft['request_body'] else 'N/A'}`
- **Response Body:** `{json.dumps(ft['response_body']) if ft['response_body'] else 'N/A'}`

---
"""
    else:
        report += "\n*No failed tests!*\n"

    report += "\n## Endpoint Category Breakdown\n\n| Category | Total | Passed | Failed | Pass Rate |\n|----------|-------|--------|--------|-----------|\n"

    for cat, stats in category_stats.items():
        cat_pass_rate = (stats["passed"] / stats["total"] * 100) if stats["total"] > 0 else 0
        report += f"| {cat} | {stats['total']} | {stats['passed']} | {stats['failed']} | {cat_pass_rate:.1f}% |\n"

    # Health score
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

    report += f"""
---

## Overall API Health Score: {health_score}/10

### Scoring Criteria

| Pass Rate | Score |
|-----------|-------|
| 90-100% | 10/10 |
| 80-89% | 8/10 |
| 70-79% | 6/10 |
| 60-69% | 4/10 |
| Below 60% | 2/10 |

---

## Recommendations

"""

    # Generate recommendations based on failures
    if failed_tests:
        for ft in failed_tests:
            report += f"- **{ft['category']}** ({ft['endpoint']}): {ft['notes']} - Expected {ft['expected_status']}, got {ft['actual_status']}\n"
    else:
        report += "- All endpoints are functioning correctly!\n"

    report += f"""
---

## Go/No-Go Recommendation

"""

    if pass_rate >= 80:
        report += """### ✅ GO - Ready for Deployment

**Rationale:**

- Pass rate meets minimum threshold (80%)
- Core functionality is working
- Authentication and authorization working correctly
"""
    else:
        report += """### ⚠️ NO-GO - Issues Need Resolution

**Rationale:**

- Pass rate below 80% threshold
- Critical functionality may be broken
"""

    report += f"""
---

## Test Configuration

- **Test Framework:** Python httpx
- **Timeout:** 30 seconds per request
- **Test User:** {TEST_EMAIL}
- **Total Categories Tested:** {len(category_stats)}

---

*Report generated automatically by Extended API Audit Suite*
"""

    # Save report
    report_path = f"D:\\ecomarce-qwen\\extended_audit_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report)

    print("\n" + "=" * 60)
    print("TEST EXECUTION COMPLETE")
    print("=" * 60)
    print(f"\n📊 Summary: {passed}/{total_tests} tests passed ({pass_rate:.1f}%)")
    print(f"📄 Report saved to: {report_path}")

if __name__ == "__main__":
    run_extended_tests()
