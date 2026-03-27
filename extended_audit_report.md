# EXTENDED API AUDIT REPORT

**Date:** 2026-03-25 20:40:11
**Base URL:** http://localhost:8000
**Test User Email:** extended_test_20260325_203918@test.com

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 44 |
| Passed | 24 |
| Failed | 20 |
| Pass Rate | 54.5% |
| Average Response Time | 1185ms |

---

## Results Table

| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |
|---|----------|--------|----------|--------|--------|---------------|-------|
| 1 | /api/auth/register | POST | 201 | 201 | ✅ PASS | 10014ms | Register new user for extended tests |
| 2 | /api/auth/login | POST | 200 | 200 | ✅ PASS | 2974ms | Login user |
| 3 | /api/auth/2fa/setup | POST | 200 | 200 | ✅ PASS | 4996ms | Setup 2FA - get QR code and secret |
| 4 | /api/auth/2fa/verify-setup | POST | 400 | 422 | ❌ FAIL | 1828ms | Verify 2FA setup with invalid code |
| 5 | /api/auth/2fa/verify | POST | 400 | 422 | ❌ FAIL | 7ms | Verify 2FA during login (no temp token) |
| 6 | /api/auth/2fa/disable | POST | 400 | 422 | ❌ FAIL | 1214ms | Disable 2FA (not enabled yet) |
| 7 | /api/newsletter/subscribe | POST | 200 | 422 | ❌ FAIL | 8ms | Subscribe to newsletter |
| 8 | /api/newsletter/subscribe | POST | 200 | 422 | ❌ FAIL | 12ms | Subscribe again (idempotent) |
| 9 | /api/newsletter/unsubscribe | GET | 200 | 200 | ✅ PASS | 1629ms | Unsubscribe from newsletter |
| 10 | /api/newsletter/admin/subscribers | GET | 403 | 403 | ✅ PASS | 1537ms | Get subscribers (requires admin) |
| 11 | /api/newsletter/admin/export | GET | 403 | 403 | ✅ PASS | 1732ms | Export subscribers CSV (requires admin) |
| 12 | /api/newsletter/admin/stats | GET | 403 | 403 | ✅ PASS | 1545ms | Get newsletter stats (requires admin) |
| 13 | /api/referral/my-referral | GET | 200 | 404 | ❌ FAIL | 15ms | Get my referral code and stats |
| 14 | /api/referral/referrals | GET | 200 | 404 | ❌ FAIL | 40ms | Get my referrals list |
| 15 | /api/referral/apply | POST | 400 | 404 | ❌ FAIL | 16ms | Apply invalid referral code |
| 16 | /api/shipping/companies | GET | 200 | 200 | ✅ PASS | 1447ms | Get all shipping companies |
| 17 | /api/shipping/calculate | POST | 200 | 200 | ✅ PASS | 1542ms | Calculate shipping rates |
| 18 | /api/shipping/track/INVALID123 | GET | 404 | 404 | ✅ PASS | 1740ms | Track shipment (invalid tracking) |
| 19 | /api/shipping/companies | POST | 403 | 403 | ✅ PASS | 1326ms | Create shipping company (requires admin) |
| 20 | /api/returns/ | GET | 200 | 200 | ✅ PASS | 2142ms | Get my return requests |
| 21 | /api/returns/ | POST | 404 | 404 | ✅ PASS | 1842ms | Create return (no valid order) |
| 22 | /api/returns/admin/all | GET | 403 | 403 | ✅ PASS | 1748ms | Get all returns (requires admin) |
| 23 | /api/bulk/products/export | GET | 403 | 404 | ❌ FAIL | 24ms | Export products CSV (requires admin) |
| 24 | /api/bulk/products/import | POST | 403 | 404 | ❌ FAIL | 18ms | Import products CSV (requires admin) |
| 25 | /api/upload/ | POST | 200 | 200 | ✅ PASS | 12ms | Upload root endpoint info |
| 26 | /api/upload/images | POST | 422 | 422 | ✅ PASS | 22ms | Upload images (no files provided) |
| 27 | /api/contact/ | POST | 200 | 200 | ✅ PASS | 2004ms | Submit contact form |
| 28 | /api/jazzcash/initiate | POST | 422 | 404 | ❌ FAIL | 12ms | JazzCash initiate (missing required fields) |
| 29 | /api/jazzcash/callback | POST | 422 | 500 | ❌ FAIL | 20ms | JazzCash callback (missing required fields) |
| 30 | /api/easypaisa/initiate | POST | 422 | 404 | ❌ FAIL | 14ms | EasyPaisa initiate (missing required fields) |
| 31 | /api/easypaisa/callback | POST | 422 | 400 | ❌ FAIL | 26ms | EasyPaisa callback (missing required fields) |
| 32 | /api/variants/99999 | GET | 404 | 404 | ✅ PASS | 12ms | Get variants for non-existent product |
| 33 | /api/variants/1 | POST | 403 | 404 | ❌ FAIL | 10ms | Create product variant (requires admin) |
| 34 | /api/roles/ | GET | 403 | 404 | ❌ FAIL | 5ms | Get all roles (requires admin) |
| 35 | /api/roles/ | POST | 403 | 404 | ❌ FAIL | 5ms | Create role (requires admin) |
| 36 | /api/products/flash-sales | GET | 200 | 422 | ❌ FAIL | 8ms | Get flash sale products |
| 37 | /api/products/99999/reviews | GET | 404 | 404 | ✅ PASS | 1321ms | Get reviews for non-existent product |
| 38 | /api/products/99999/reviews | POST | 404 | 422 | ❌ FAIL | 1485ms | Add review to non-existent product |
| 39 | /api/products/99999/related | GET | 404 | 404 | ✅ PASS | 1371ms | Get related products for non-existent product |
| 40 | /api/categories/all | GET | 200 | 200 | ✅ PASS | 2115ms | Get all categories (flat list) |
| 41 | /api/categories/99999 | GET | 404 | 404 | ✅ PASS | 1401ms | Get non-existent category |
| 42 | /api/categories/99999 | PUT | 404 | 404 | ✅ PASS | 1408ms | Update non-existent category |
| 43 | /api/categories/99999 | DELETE | 404 | 404 | ✅ PASS | 1492ms | Delete non-existent category |
| 44 | /api/profile | GET | 200 | 401 | ❌ FAIL | 5ms | Get user profile |

---

## Failed Tests (Detailed)

### Test #4: /api/auth/2fa/verify-setup

- **Endpoint:** `http://localhost:8000/api/auth/2fa/verify-setup`
- **Method:** POST
- **Expected Status:** 400
- **Actual Status:** 422
- **Category:** 2FA
- **Notes:** Verify 2FA setup with invalid code
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "code: Field required"}`

---

### Test #5: /api/auth/2fa/verify

- **Endpoint:** `http://localhost:8000/api/auth/2fa/verify`
- **Method:** POST
- **Expected Status:** 400
- **Actual Status:** 422
- **Category:** 2FA
- **Notes:** Verify 2FA during login (no temp token)
- **Request Body:** `{"code": "123456", "temp_token": "invalid"}`
- **Response Body:** `{"detail": "code: Field required | temp_token: Field required"}`

---

### Test #6: /api/auth/2fa/disable

- **Endpoint:** `http://localhost:8000/api/auth/2fa/disable`
- **Method:** POST
- **Expected Status:** 400
- **Actual Status:** 422
- **Category:** 2FA
- **Notes:** Disable 2FA (not enabled yet)
- **Request Body:** `{"code": "123456"}`
- **Response Body:** `{"detail": "code: Field required"}`

---

### Test #7: /api/newsletter/subscribe

- **Endpoint:** `http://localhost:8000/api/newsletter/subscribe`
- **Method:** POST
- **Expected Status:** 200
- **Actual Status:** 422
- **Category:** Newsletter
- **Notes:** Subscribe to newsletter
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "email: Field required"}`

---

### Test #8: /api/newsletter/subscribe

- **Endpoint:** `http://localhost:8000/api/newsletter/subscribe`
- **Method:** POST
- **Expected Status:** 200
- **Actual Status:** 422
- **Category:** Newsletter
- **Notes:** Subscribe again (idempotent)
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "email: Field required"}`

---

### Test #13: /api/referral/my-referral

- **Endpoint:** `http://localhost:8000/api/referral/my-referral`
- **Method:** GET
- **Expected Status:** 200
- **Actual Status:** 404
- **Category:** Referral
- **Notes:** Get my referral code and stats
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #14: /api/referral/referrals

- **Endpoint:** `http://localhost:8000/api/referral/referrals`
- **Method:** GET
- **Expected Status:** 200
- **Actual Status:** 404
- **Category:** Referral
- **Notes:** Get my referrals list
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #15: /api/referral/apply

- **Endpoint:** `http://localhost:8000/api/referral/apply`
- **Method:** POST
- **Expected Status:** 400
- **Actual Status:** 404
- **Category:** Referral
- **Notes:** Apply invalid referral code
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #23: /api/bulk/products/export

- **Endpoint:** `http://localhost:8000/api/bulk/products/export`
- **Method:** GET
- **Expected Status:** 403
- **Actual Status:** 404
- **Category:** Bulk
- **Notes:** Export products CSV (requires admin)
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #24: /api/bulk/products/import

- **Endpoint:** `http://localhost:8000/api/bulk/products/import`
- **Method:** POST
- **Expected Status:** 403
- **Actual Status:** 404
- **Category:** Bulk
- **Notes:** Import products CSV (requires admin)
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #28: /api/jazzcash/initiate

- **Endpoint:** `http://localhost:8000/api/jazzcash/initiate`
- **Method:** POST
- **Expected Status:** 422
- **Actual Status:** 404
- **Category:** Payment
- **Notes:** JazzCash initiate (missing required fields)
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #29: /api/jazzcash/callback

- **Endpoint:** `http://localhost:8000/api/jazzcash/callback`
- **Method:** POST
- **Expected Status:** 422
- **Actual Status:** 500
- **Category:** Payment
- **Notes:** JazzCash callback (missing required fields)
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Kuch masla aa gaya"}`

---

### Test #30: /api/easypaisa/initiate

- **Endpoint:** `http://localhost:8000/api/easypaisa/initiate`
- **Method:** POST
- **Expected Status:** 422
- **Actual Status:** 404
- **Category:** Payment
- **Notes:** EasyPaisa initiate (missing required fields)
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #31: /api/easypaisa/callback

- **Endpoint:** `http://localhost:8000/api/easypaisa/callback`
- **Method:** POST
- **Expected Status:** 422
- **Actual Status:** 400
- **Category:** Payment
- **Notes:** EasyPaisa callback (missing required fields)
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Invalid request. Dobara try karein"}`

---

### Test #33: /api/variants/1

- **Endpoint:** `http://localhost:8000/api/variants/1`
- **Method:** POST
- **Expected Status:** 403
- **Actual Status:** 404
- **Category:** Variants
- **Notes:** Create product variant (requires admin)
- **Request Body:** `{"name": "Test Variant", "value": "Red"}`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #34: /api/roles/

- **Endpoint:** `http://localhost:8000/api/roles/`
- **Method:** GET
- **Expected Status:** 403
- **Actual Status:** 404
- **Category:** Roles
- **Notes:** Get all roles (requires admin)
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #35: /api/roles/

- **Endpoint:** `http://localhost:8000/api/roles/`
- **Method:** POST
- **Expected Status:** 403
- **Actual Status:** 404
- **Category:** Roles
- **Notes:** Create role (requires admin)
- **Request Body:** `{"name": "Test Role", "permissions": []}`
- **Response Body:** `{"detail": "Yeh item nahi mila"}`

---

### Test #36: /api/products/flash-sales

- **Endpoint:** `http://localhost:8000/api/products/flash-sales`
- **Method:** GET
- **Expected Status:** 200
- **Actual Status:** 422
- **Category:** Products
- **Notes:** Get flash sale products
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "product_id: Input should be a valid integer, unable to parse string as an integer"}`

---

### Test #38: /api/products/99999/reviews

- **Endpoint:** `http://localhost:8000/api/products/99999/reviews`
- **Method:** POST
- **Expected Status:** 404
- **Actual Status:** 422
- **Category:** Products
- **Notes:** Add review to non-existent product
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "rating: Field required"}`

---

### Test #44: /api/profile

- **Endpoint:** `http://localhost:8000/api/profile`
- **Method:** GET
- **Expected Status:** 200
- **Actual Status:** 401
- **Category:** Profile
- **Notes:** Get user profile
- **Request Body:** `N/A`
- **Response Body:** `{"detail": "Please login karein"}`

---

## Endpoint Category Breakdown

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Auth | 2 | 2 | 0 | 100.0% |
| 2FA | 4 | 1 | 3 | 25.0% |
| Newsletter | 6 | 4 | 2 | 66.7% |
| Referral | 3 | 0 | 3 | 0.0% |
| Shipping | 4 | 4 | 0 | 100.0% |
| Returns | 3 | 3 | 0 | 100.0% |
| Bulk | 2 | 0 | 2 | 0.0% |
| Upload | 2 | 2 | 0 | 100.0% |
| Contact | 1 | 1 | 0 | 100.0% |
| Payment | 4 | 0 | 4 | 0.0% |
| Variants | 2 | 1 | 1 | 50.0% |
| Roles | 2 | 0 | 2 | 0.0% |
| Products | 4 | 2 | 2 | 50.0% |
| Categories | 4 | 4 | 0 | 100.0% |
| Profile | 1 | 0 | 1 | 0.0% |

---

## Overall API Health Score: 2/10

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

- **2FA** (/api/auth/2fa/verify-setup): Verify 2FA setup with invalid code - Expected 400, got 422
- **2FA** (/api/auth/2fa/verify): Verify 2FA during login (no temp token) - Expected 400, got 422
- **2FA** (/api/auth/2fa/disable): Disable 2FA (not enabled yet) - Expected 400, got 422
- **Newsletter** (/api/newsletter/subscribe): Subscribe to newsletter - Expected 200, got 422
- **Newsletter** (/api/newsletter/subscribe): Subscribe again (idempotent) - Expected 200, got 422
- **Referral** (/api/referral/my-referral): Get my referral code and stats - Expected 200, got 404
- **Referral** (/api/referral/referrals): Get my referrals list - Expected 200, got 404
- **Referral** (/api/referral/apply): Apply invalid referral code - Expected 400, got 404
- **Bulk** (/api/bulk/products/export): Export products CSV (requires admin) - Expected 403, got 404
- **Bulk** (/api/bulk/products/import): Import products CSV (requires admin) - Expected 403, got 404
- **Payment** (/api/jazzcash/initiate): JazzCash initiate (missing required fields) - Expected 422, got 404
- **Payment** (/api/jazzcash/callback): JazzCash callback (missing required fields) - Expected 422, got 500
- **Payment** (/api/easypaisa/initiate): EasyPaisa initiate (missing required fields) - Expected 422, got 404
- **Payment** (/api/easypaisa/callback): EasyPaisa callback (missing required fields) - Expected 422, got 400
- **Variants** (/api/variants/1): Create product variant (requires admin) - Expected 403, got 404
- **Roles** (/api/roles/): Get all roles (requires admin) - Expected 403, got 404
- **Roles** (/api/roles/): Create role (requires admin) - Expected 403, got 404
- **Products** (/api/products/flash-sales): Get flash sale products - Expected 200, got 422
- **Products** (/api/products/99999/reviews): Add review to non-existent product - Expected 404, got 422
- **Profile** (/api/profile): Get user profile - Expected 200, got 401

---

## Go/No-Go Recommendation

### ⚠️ NO-GO - Issues Need Resolution

**Rationale:**

- Pass rate below 80% threshold
- Critical functionality may be broken

---

## Test Configuration

- **Test Framework:** Python httpx
- **Timeout:** 30 seconds per request
- **Test User:** extended_test_20260325_203918@test.com
- **Total Categories Tested:** 15

---

*Report generated automatically by Extended API Audit Suite*
