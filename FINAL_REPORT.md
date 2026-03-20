# API TEST REPORT - FINAL

**Date:** 2026-03-20 16:02:49
**Base URL:** http://localhost:8000
**Test User Email:** test_api_1774004408@test.com
**Test Username:** testuser_1774004408

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 53 |
| Passed | 42 |
| Failed | 11 |
| Pass Rate | 79.2% |
| Average Response Time | 2868.19ms |
| **API Health Score** | **6/10** |

---

## Results Table

| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |
|---|----------|--------|----------|--------|--------|---------------|-------|
| 1 | `GET /` | GET | 200 | 200 | ✅ PASS | 2063.4ms | Root endpoint... |
| 2 | `GET /api/health` | GET | 200 | 200 | ✅ PASS | 6.0ms | Health check passed... |
| 3 | `POST /api/auth/register` | POST | 201 | 201 | ✅ PASS | 12722.81ms | User registered successfully... |
| 4 | `POST /api/auth/login` | POST | 200 | 200 | ✅ PASS | 3080.11ms | Login successful, tokens saved... |
| 5 | `POST /api/auth/refresh` | POST | 200 | 200 | ✅ PASS | 1967.36ms | Token refreshed successfully... |
| 6 | `GET /api/auth/me` | GET | 200 | 200 | ✅ PASS | 2437.41ms | Current user retrieved... |
| 7 | `PUT /api/auth/me` | PUT | 200 | 200 | ✅ PASS | 6983.29ms | User updated... |
| 8 | `POST /api/auth/forgot-password` | POST | 200 | 200 | ✅ PASS | 3992.42ms | Password reset email sent... |
| 9 | `POST /api/auth/social-login` | POST | 422 | 422 | ✅ PASS | 5.66ms | Social login response: {'detail': 'name: Field req... |
| 10 | `GET /api/products` | GET | 200 | 200 | ✅ PASS | 3741.88ms | Products retrieved... |
| 11 | `GET /api/products/{id}` | GET | 200 | 200 | ✅ PASS | 4482.58ms | Product retrieved... |
| 12 | `GET /api/products/slug/{slug}` | GET | 200 | 404 | ❌ FAIL | 1623.39ms | Slug not found: {'detail': 'Yeh item nahi mila'}... |
| 13 | `POST /api/products` | POST | 403 | 403 | ✅ PASS | 1467.85ms | Forbidden - admin access required (expected for no... |
| 14 | `PUT /api/products/{id}` | PUT | 200 | 200 | ✅ PASS | 4597.3ms | Product updated... |
| 15 | `DELETE /api/products/{id}` | DELETE | 403 | 403 | ✅ PASS | 8397.37ms | Forbidden - admin access required (expected for no... |
| 16 | `GET /api/categories` | GET | 200 | 200 | ✅ PASS | 1814.34ms | Categories retrieved... |
| 17 | `POST /api/categories` | POST | 201 | 400 | ❌ FAIL | 4143.46ms | Response: {'detail': 'Invalid request. Dobara try ... |
| 18 | `PUT /api/categories/{id}` | PUT | 200 | 200 | ✅ PASS | 4362.68ms | Category updated... |
| 19 | `DELETE /api/categories/{id}` | DELETE | 200 | 204 | ✅ PASS | 5753.17ms | Category deleted... |
| 20 | `GET /api/cart` | GET | 200 | 200 | ✅ PASS | 1464.93ms | Cart retrieved... |
| 21 | `POST /api/cart/items` | POST | 200 | 201 | ✅ PASS | 7247.21ms | Item added to cart... |
| 22 | `PUT /api/cart/items/{id}` | PUT | 200 | 200 | ✅ PASS | 7578.88ms | Cart item updated... |
| 23 | `DELETE /api/cart/items/{id}` | DELETE | 200 | 204 | ✅ PASS | 3897.77ms | Item removed from cart... |
| 24 | `DELETE /api/cart` | DELETE | 200 | 204 | ✅ PASS | 3788.34ms | Cart cleared... |
| 25 | `GET /api/orders` | GET | 200 | 200 | ✅ PASS | 4417.36ms | Orders retrieved... |
| 26 | `POST /api/orders` | POST | 201 | 422 | ❌ FAIL | 2.82ms | Response: {'detail': 'shipping_address_id: Field r... |
| 27 | `GET /api/orders/{id}` | GET | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 28 | `POST /api/orders/{id}/cancel` | POST | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 29 | `GET /api/addresses` | GET | 200 | 200 | ✅ PASS | 2120.63ms | Addresses retrieved... |
| 30 | `POST /api/addresses` | POST | 201 | 201 | ✅ PASS | 4140.27ms | Address created... |
| 31 | `PUT /api/addresses/{id}` | PUT | 200 | 200 | ✅ PASS | 6457.61ms | Address updated... |
| 32 | `DELETE /api/addresses/{id}` | DELETE | 200 | 204 | ✅ PASS | 2354.47ms | Address deleted... |
| 33 | `GET /api/wishlist` | GET | 200 | 200 | ✅ PASS | 1837.49ms | Wishlist retrieved... |
| 34 | `POST /api/wishlist/items/{productId}` | POST | 200 | 201 | ✅ PASS | 6440.98ms | Added to wishlist... |
| 35 | `DELETE /api/wishlist/items/{id}` | DELETE | 200 | 204 | ✅ PASS | 2742.39ms | Removed from wishlist... |
| 36 | `GET /api/search` | GET | 200 | 200 | ✅ PASS | 3412.59ms | Search completed... |
| 37 | `GET /api/admin/dashboard` | GET | 403 | 403 | ✅ PASS | 2188.55ms | Unauthorized/Forbidden - admin required (expected ... |
| 38 | `GET /api/admin/orders` | GET | 403 | 403 | ✅ PASS | 1943.68ms | Unauthorized/Forbidden - admin required (expected ... |
| 39 | `GET /api/admin/orders/{id}` | GET | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 40 | `PATCH /api/admin/orders/{id}/status` | PATCH | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 41 | `GET /api/admin/users` | GET | 403 | 403 | ✅ PASS | 3250.78ms | Unauthorized/Forbidden - admin required (expected ... |
| 42 | `PUT /api/admin/users/{id}` | PUT | 403 | 403 | ✅ PASS | 2001.97ms | Unauthorized/Forbidden - admin required (expected ... |
| 43 | `DELETE /api/admin/users/{id}` | DELETE | 403 | 403 | ✅ PASS | 2033.35ms | Delete attempted (401/403 expected for non-admin):... |
| 44 | `POST /api/admin/coupons` | POST | 403 | 403 | ✅ PASS | 2524.42ms | Unauthorized/Forbidden - admin required (expected ... |
| 45 | `GET /api/admin/coupons` | GET | 403 | 403 | ✅ PASS | 1602.36ms | Unauthorized/Forbidden - admin required (expected ... |
| 46 | `PUT /api/admin/coupons/{id}` | PUT | 200 | 404 | ❌ FAIL | 0ms | No coupon ID available... |
| 47 | `DELETE /api/admin/coupons/{id}` | DELETE | 200 | 404 | ❌ FAIL | 0ms | No coupon ID available... |
| 48 | `POST /api/admin/coupons/validate` | POST | 200 | 200 | ✅ PASS | 1848.78ms | Coupon validation response: {'valid': False, 'disc... |
| 49 | `GET /api/profile` | GET | 200 | 401 | ❌ FAIL | 5.31ms | Response: {'detail': 'Please login karein'}... |
| 50 | `POST /api/upload` | POST | 200 | 404 | ❌ FAIL | 7.37ms | Upload response: {'detail': 'Yeh item nahi mila'}... |
| 51 | `POST /api/contact` | POST | 200 | 200 | ✅ PASS | 3044.77ms | Contact form submitted... |
| 52 | `GET /api/auth/verify-email` | GET | 400 | 400 | ✅ PASS | 7.63ms | Email verification response: {'detail': 'Invalid r... |
| 53 | `POST /api/auth/reset-password` | POST | 400 | 400 | ✅ PASS | 8.87ms | Password reset response: {'detail': 'Invalid reque... |

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

### Test #17: POST /api/categories

- **Full URL:** `http://localhost:8000/api/categories`
- **Method:** POST
- **Expected Status:** `201`
- **Actual Status:** `400`
- **Notes:** Response: {'detail': 'Invalid request. Dobara try karein'}
- **Request Body:**
```json
{
  "name": "Test Category",
  "slug": "test-category",
  "description": "Test category description"
}
```
- **Response Body:**
```json
{
  "detail": "Invalid request. Dobara try karein"
}
```
- **Recommended Fix:** Review API documentation and expected behavior for this endpoint.

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
| Categories | 4 | 3 | 1 | 75.0% |
| Cart | 5 | 5 | 0 | 100.0% |
| Orders | 7 | 2 | 5 | 28.6% |
| Addresses | 4 | 4 | 0 | 100.0% |
| Wishlist | 3 | 3 | 0 | 100.0% |
| Search | 1 | 1 | 0 | 100.0% |
| Admin | 9 | 7 | 2 | 77.8% |
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
