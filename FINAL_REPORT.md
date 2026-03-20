# API TEST REPORT - FINAL

**Date:** 2026-03-20 15:28:31
**Base URL:** http://localhost:8000
**Test User Email:** test_api_1774002429@test.com
**Test Username:** testuser_1774002429

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 53 |
| Passed | 41 |
| Failed | 12 |
| Pass Rate | 77.4% |
| Average Response Time | 1480.84ms |
| **API Health Score** | **6/10** |

---

## Results Table

| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |
|---|----------|--------|----------|--------|--------|---------------|-------|
| 1 | `GET /` | GET | 200 | 200 | ✅ PASS | 2456.54ms | Root endpoint... |
| 2 | `GET /api/health` | GET | 200 | 200 | ✅ PASS | 5.65ms | Health check passed... |
| 3 | `POST /api/auth/register` | POST | 201 | 201 | ✅ PASS | 7137.65ms | User registered successfully... |
| 4 | `POST /api/auth/login` | POST | 200 | 200 | ✅ PASS | 2609.7ms | Login successful, tokens saved... |
| 5 | `POST /api/auth/refresh` | POST | 200 | 200 | ✅ PASS | 1389.17ms | Token refreshed successfully... |
| 6 | `GET /api/auth/me` | GET | 200 | 200 | ✅ PASS | 1196.55ms | Current user retrieved... |
| 7 | `PUT /api/auth/me` | PUT | 200 | 200 | ✅ PASS | 2818.95ms | User updated... |
| 8 | `POST /api/auth/forgot-password` | POST | 200 | 200 | ✅ PASS | 2577.11ms | Password reset email sent... |
| 9 | `POST /api/auth/social-login` | POST | 422 | 422 | ✅ PASS | 14.22ms | Social login response: {'detail': 'name: Field req... |
| 10 | `GET /api/products` | GET | 200 | 200 | ✅ PASS | 2190.34ms | Products retrieved... |
| 11 | `GET /api/products/{id}` | GET | 200 | 200 | ✅ PASS | 3093.52ms | Product retrieved... |
| 12 | `GET /api/products/slug/{slug}` | GET | 200 | 404 | ❌ FAIL | 1302.65ms | Slug not found: {'detail': 'Yeh item nahi mila'}... |
| 13 | `POST /api/products` | POST | 403 | 403 | ✅ PASS | 1243.84ms | Forbidden - admin access required (expected for no... |
| 14 | `PUT /api/products/{id}` | PUT | 200 | 200 | ✅ PASS | 2776.3ms | Product updated... |
| 15 | `DELETE /api/products/{id}` | DELETE | 403 | 403 | ✅ PASS | 977.95ms | Forbidden - admin access required (expected for no... |
| 16 | `GET /api/categories` | GET | 200 | 200 | ✅ PASS | 1643.31ms | Categories retrieved... |
| 17 | `POST /api/categories` | POST | 201 | 201 | ✅ PASS | 2342.85ms | Category created... |
| 18 | `PUT /api/categories/{id}` | PUT | 200 | 200 | ✅ PASS | 3476.97ms | Category updated... |
| 19 | `DELETE /api/categories/{id}` | DELETE | 200 | 204 | ✅ PASS | 1765.91ms | Category deleted... |
| 20 | `GET /api/cart` | GET | 200 | 200 | ✅ PASS | 1242.85ms | Cart retrieved... |
| 21 | `POST /api/cart/items` | POST | 200 | 201 | ✅ PASS | 4200.88ms | Item added to cart... |
| 22 | `PUT /api/cart/items/{id}` | PUT | 200 | 200 | ✅ PASS | 3959.19ms | Cart item updated... |
| 23 | `DELETE /api/cart/items/{id}` | DELETE | 200 | 204 | ✅ PASS | 1792.17ms | Item removed from cart... |
| 24 | `DELETE /api/cart` | DELETE | 200 | 204 | ✅ PASS | 1496.58ms | Cart cleared... |
| 25 | `GET /api/orders` | GET | 200 | 200 | ✅ PASS | 1347.19ms | Orders retrieved... |
| 26 | `POST /api/orders` | POST | 201 | 422 | ❌ FAIL | 5.15ms | Response: {'detail': 'shipping_address_id: Field r... |
| 27 | `GET /api/orders/{id}` | GET | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 28 | `POST /api/orders/{id}/cancel` | POST | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 29 | `GET /api/addresses` | GET | 200 | 200 | ✅ PASS | 903.33ms | Addresses retrieved... |
| 30 | `POST /api/addresses` | POST | 201 | 201 | ✅ PASS | 2218.61ms | Address created... |
| 31 | `PUT /api/addresses/{id}` | PUT | 200 | 200 | ✅ PASS | 1948.39ms | Address updated... |
| 32 | `DELETE /api/addresses/{id}` | DELETE | 200 | 204 | ✅ PASS | 1224.02ms | Address deleted... |
| 33 | `GET /api/wishlist` | GET | 200 | 200 | ✅ PASS | 1302.25ms | Wishlist retrieved... |
| 34 | `POST /api/wishlist/items/{productId}` | POST | 200 | 201 | ✅ PASS | 3026.36ms | Added to wishlist... |
| 35 | `DELETE /api/wishlist/items/{id}` | DELETE | 200 | 204 | ✅ PASS | 1308.95ms | Removed from wishlist... |
| 36 | `GET /api/search` | GET | 200 | 500 | ❌ FAIL | 1200.6ms | Response: {'detail': 'Server mein masla aa gaya. T... |
| 37 | `GET /api/admin/dashboard` | GET | 403 | 0 | ❌ FAIL | 21.52ms | Connection error: {'error': '[WinError 10054] An e... |
| 38 | `GET /api/admin/orders` | GET | 403 | 403 | ✅ PASS | 2948.33ms | Unauthorized/Forbidden - admin required (expected ... |
| 39 | `GET /api/admin/orders/{id}` | GET | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 40 | `PATCH /api/admin/orders/{id}/status` | PATCH | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 41 | `GET /api/admin/users` | GET | 403 | 403 | ✅ PASS | 938.98ms | Unauthorized/Forbidden - admin required (expected ... |
| 42 | `PUT /api/admin/users/{id}` | PUT | 403 | 403 | ✅ PASS | 1296.42ms | Unauthorized/Forbidden - admin required (expected ... |
| 43 | `DELETE /api/admin/users/{id}` | DELETE | 403 | 403 | ✅ PASS | 847.72ms | Delete attempted (401/403 expected for non-admin):... |
| 44 | `POST /api/admin/coupons` | POST | 403 | 403 | ✅ PASS | 889.53ms | Unauthorized/Forbidden - admin required (expected ... |
| 45 | `GET /api/admin/coupons` | GET | 403 | 403 | ✅ PASS | 953.57ms | Unauthorized/Forbidden - admin required (expected ... |
| 46 | `PUT /api/admin/coupons/{id}` | PUT | 200 | 404 | ❌ FAIL | 0ms | No coupon ID available... |
| 47 | `DELETE /api/admin/coupons/{id}` | DELETE | 200 | 404 | ❌ FAIL | 0ms | No coupon ID available... |
| 48 | `POST /api/admin/coupons/validate` | POST | 200 | 200 | ✅ PASS | 1246.79ms | Coupon validation response: {'valid': False, 'disc... |
| 49 | `GET /api/profile` | GET | 200 | 401 | ❌ FAIL | 6.56ms | Response: {'detail': 'Please login karein'}... |
| 50 | `POST /api/upload` | POST | 200 | 404 | ❌ FAIL | 2.3ms | Upload response: {'detail': 'Yeh item nahi mila'}... |
| 51 | `POST /api/contact` | POST | 200 | 200 | ✅ PASS | 1122.65ms | Contact form submitted... |
| 52 | `GET /api/auth/verify-email` | GET | 400 | 400 | ✅ PASS | 6.84ms | Email verification response: {'detail': 'Invalid r... |
| 53 | `POST /api/auth/reset-password` | POST | 400 | 400 | ✅ PASS | 7.53ms | Password reset response: {'detail': 'Invalid reque... |

---

## Failed Tests (Detailed)

### Test #12: GET /api/products/slug/{slug}

- **Full URL:** `http://localhost:8000/api/products/slug/{slug}`
- **Method:** GET
- **Expected Status:** `200`
- **Actual Status:** `404`
- **Notes:** Slug not found: {'detail': 'Yeh item nahi mila'}
- **Response Body:**
```json
{
  "detail": "Yeh item nahi mila"
}
```
- **Recommended Fix:** Resource not found. Verify the ID exists or create the resource first.

### Test #26: POST /api/orders

- **Full URL:** `http://localhost:8000/api/orders`
- **Method:** POST
- **Expected Status:** `201`
- **Actual Status:** `422`
- **Notes:** Response: {'detail': 'shipping_address_id: Field required'}
- **Response Body:**
```json
{
  "detail": "shipping_address_id: Field required"
}
```
- **Recommended Fix:** Validation error. Check request body fields match API schema requirements.

### Test #27: GET /api/orders/{id}

- **Full URL:** `http://localhost:8000/api/orders/{id}`
- **Method:** GET
- **Expected Status:** `200`
- **Actual Status:** `404`
- **Notes:** No order ID available
- **Recommended Fix:** Resource not found. Verify the ID exists or create the resource first.

### Test #28: POST /api/orders/{id}/cancel

- **Full URL:** `http://localhost:8000/api/orders/{id}/cancel`
- **Method:** POST
- **Expected Status:** `200`
- **Actual Status:** `404`
- **Notes:** No order ID available
- **Recommended Fix:** Resource not found. Verify the ID exists or create the resource first.

### Test #36: GET /api/search

- **Full URL:** `http://localhost:8000/api/search`
- **Method:** GET
- **Expected Status:** `200`
- **Actual Status:** `500`
- **Notes:** Response: {'detail': 'Server mein masla aa gaya. Thodi der mein try karein.'}
- **Response Body:**
```json
{
  "detail": "Server mein masla aa gaya. Thodi der mein try karein."
}
```
- **Recommended Fix:** Server error. Check backend logs for stack trace and fix the underlying issue.

### Test #37: GET /api/admin/dashboard

- **Full URL:** `http://localhost:8000/api/admin/dashboard`
- **Method:** GET
- **Expected Status:** `403`
- **Actual Status:** `0`
- **Notes:** Connection error: {'error': '[WinError 10054] An existing connection was forcibly closed by the remote host'}
- **Response Body:**
```json
{
  "error": "[WinError 10054] An existing connection was forcibly closed by the remote host"
}
```
- **Recommended Fix:** Connection error. Ensure the API server is running and accessible.

### Test #39: GET /api/admin/orders/{id}

- **Full URL:** `http://localhost:8000/api/admin/orders/{id}`
- **Method:** GET
- **Expected Status:** `200`
- **Actual Status:** `404`
- **Notes:** No order ID available
- **Recommended Fix:** Resource not found. Verify the ID exists or create the resource first.

### Test #40: PATCH /api/admin/orders/{id}/status

- **Full URL:** `http://localhost:8000/api/admin/orders/{id}/status`
- **Method:** PATCH
- **Expected Status:** `200`
- **Actual Status:** `404`
- **Notes:** No order ID available
- **Recommended Fix:** Resource not found. Verify the ID exists or create the resource first.

### Test #46: PUT /api/admin/coupons/{id}

- **Full URL:** `http://localhost:8000/api/admin/coupons/{id}`
- **Method:** PUT
- **Expected Status:** `200`
- **Actual Status:** `404`
- **Notes:** No coupon ID available
- **Recommended Fix:** Resource not found. Verify the ID exists or create the resource first.

### Test #47: DELETE /api/admin/coupons/{id}

- **Full URL:** `http://localhost:8000/api/admin/coupons/{id}`
- **Method:** DELETE
- **Expected Status:** `200`
- **Actual Status:** `404`
- **Notes:** No coupon ID available
- **Recommended Fix:** Resource not found. Verify the ID exists or create the resource first.

### Test #49: GET /api/profile

- **Full URL:** `http://localhost:8000/api/profile`
- **Method:** GET
- **Expected Status:** `200`
- **Actual Status:** `401`
- **Notes:** Response: {'detail': 'Please login karein'}
- **Response Body:**
```json
{
  "detail": "Please login karein"
}
```
- **Recommended Fix:** Ensure valid authentication token is provided. Check token expiry and refresh if needed.

### Test #50: POST /api/upload

- **Full URL:** `http://localhost:8000/api/upload`
- **Method:** POST
- **Expected Status:** `200`
- **Actual Status:** `404`
- **Notes:** Upload response: {'detail': 'Yeh item nahi mila'}
- **Response Body:**
```json
{
  "detail": "Yeh item nahi mila"
}
```
- **Recommended Fix:** Resource not found. Verify the ID exists or create the resource first.

---

## Endpoint Category Breakdown

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Public | 2 | 2 | 0 | 100.0% |
| Auth | 9 | 9 | 0 | 100.0% |
| Products | 6 | 5 | 1 | 83.3% |
| Categories | 4 | 4 | 0 | 100.0% |
| Cart | 5 | 5 | 0 | 100.0% |
| Orders | 7 | 2 | 5 | 28.6% |
| Addresses | 4 | 4 | 0 | 100.0% |
| Wishlist | 3 | 3 | 0 | 100.0% |
| Search | 1 | 0 | 1 | 0.0% |
| Admin | 9 | 6 | 3 | 66.7% |
| Other | 3 | 1 | 2 | 33.3% |

---

## Recommendations

### Critical Issues
2. **Admin Access Issues:** Ensure admin user exists and has proper permissions.

### General Recommendations

1. **Error Handling:** Ensure all endpoints return consistent error response formats
2. **Input Validation:** Add comprehensive validation for all request bodies
3. **Rate Limiting:** Implement rate limiting for public endpoints
4. **Logging:** Add detailed logging for debugging failed requests
5. **Documentation:** Update API documentation to match actual endpoint behavior

---

## Go/No-Go Recommendation

### ⚠️ **CONDITIONAL GO**

The API is functional but has some issues that should be addressed.

**Before Deployment:**
- Fix critical authentication issues
- Review and fix admin endpoint failures
- Add better error handling

**After Deployment:**
- Monitor closely for errors
- Plan quick fixes for known issues
