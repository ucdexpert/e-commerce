# API TEST REPORT - FINAL

**Date:** 2026-03-20 15:23:19
**Base URL:** http://localhost:8000
**Test User Email:** test_api_1774002113@test.com
**Test Username:** testuser_1774002113

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 53 |
| Passed | 34 |
| Failed | 19 |
| Pass Rate | 64.2% |
| Average Response Time | 1546.39ms |
| **API Health Score** | **4/10** |

---

## Results Table

| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |
|---|----------|--------|----------|--------|--------|---------------|-------|
| 1 | `GET /` | GET | 200 | 200 | ✅ PASS | 2161.17ms | Root endpoint... |
| 2 | `GET /api/health` | GET | 200 | 200 | ✅ PASS | 4.34ms | Health check passed... |
| 3 | `POST /api/auth/register` | POST | 201 | 201 | ✅ PASS | 6882.86ms | User registered successfully... |
| 4 | `POST /api/auth/login` | POST | 200 | 200 | ✅ PASS | 1714.9ms | Login successful, tokens saved... |
| 5 | `POST /api/auth/refresh` | POST | 200 | 200 | ✅ PASS | 1017.74ms | Token refreshed successfully... |
| 6 | `GET /api/auth/me` | GET | 200 | 200 | ✅ PASS | 860.54ms | Current user retrieved... |
| 7 | `PUT /api/auth/me` | PUT | 200 | 200 | ✅ PASS | 1913.06ms | User updated... |
| 8 | `POST /api/auth/forgot-password` | POST | 200 | 200 | ✅ PASS | 1402.72ms | Password reset email sent... |
| 9 | `POST /api/auth/social-login` | POST | 422 | 422 | ✅ PASS | 5.31ms | Social login response: {'detail': 'name: Field req... |
| 10 | `GET /api/products` | GET | 200 | 200 | ✅ PASS | 1298.32ms | Products retrieved... |
| 11 | `GET /api/products/{id}` | GET | 200 | 200 | ✅ PASS | 2240.72ms | Product retrieved... |
| 12 | `GET /api/products/slug/{slug}` | GET | 200 | 404 | ❌ FAIL | 1047.2ms | Slug not found: {'detail': 'Yeh item nahi mila'}... |
| 13 | `POST /api/products` | POST | 403 | 403 | ✅ PASS | 959.76ms | Forbidden - admin access required (expected for no... |
| 14 | `PUT /api/products/{id}` | PUT | 200 | 200 | ✅ PASS | 2039.34ms | Product updated... |
| 15 | `DELETE /api/products/{id}` | DELETE | 403 | 403 | ✅ PASS | 930.51ms | Forbidden - admin access required (expected for no... |
| 16 | `GET /api/categories` | GET | 200 | 200 | ✅ PASS | 849.57ms | Categories retrieved... |
| 17 | `POST /api/categories` | POST | 201 | 201 | ✅ PASS | 1971.86ms | Category created... |
| 18 | `PUT /api/categories/{id}` | PUT | 200 | 200 | ✅ PASS | 2055.69ms | Category updated... |
| 19 | `DELETE /api/categories/{id}` | DELETE | 403 | 204 | ❌ FAIL | 1547.29ms | Category deleted... |
| 20 | `GET /api/cart` | GET | 200 | 200 | ✅ PASS | 1053.88ms | Cart retrieved... |
| 21 | `POST /api/cart/items` | POST | 200 | 201 | ❌ FAIL | 3539.7ms | Item added to cart... |
| 22 | `PUT /api/cart/items/{id}` | PUT | 200 | 200 | ✅ PASS | 3508.97ms | Cart item updated... |
| 23 | `DELETE /api/cart/items/{id}` | DELETE | 200 | 204 | ❌ FAIL | 1883.29ms | Item removed from cart... |
| 24 | `DELETE /api/cart` | DELETE | 200 | 204 | ❌ FAIL | 1689.64ms | Cart cleared... |
| 25 | `GET /api/orders` | GET | 200 | 200 | ✅ PASS | 2008.72ms | Orders retrieved... |
| 26 | `POST /api/orders` | POST | 201 | 422 | ❌ FAIL | 7.36ms | Response: {'detail': 'shipping_address_id: Field r... |
| 27 | `GET /api/orders/{id}` | GET | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 28 | `POST /api/orders/{id}/cancel` | POST | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 29 | `GET /api/addresses` | GET | 200 | 200 | ✅ PASS | 1076.1ms | Addresses retrieved... |
| 30 | `POST /api/addresses` | POST | 201 | 201 | ✅ PASS | 2526.43ms | Address created... |
| 31 | `PUT /api/addresses/{id}` | PUT | 200 | 200 | ✅ PASS | 2610.7ms | Address updated... |
| 32 | `DELETE /api/addresses/{id}` | DELETE | 200 | 204 | ❌ FAIL | 1359.5ms | Response: {'raw': ''}... |
| 33 | `GET /api/wishlist` | GET | 200 | 200 | ✅ PASS | 1721.66ms | Wishlist retrieved... |
| 34 | `POST /api/wishlist/items/{productId}` | POST | 200 | 201 | ❌ FAIL | 4375.17ms | Added to wishlist... |
| 35 | `DELETE /api/wishlist/items/{id}` | DELETE | 200 | 204 | ❌ FAIL | 1874.61ms | Removed from wishlist... |
| 36 | `GET /api/search` | GET | 200 | 500 | ❌ FAIL | 2403.12ms | Response: {'detail': 'Server mein masla aa gaya. T... |
| 37 | `GET /api/admin/dashboard` | GET | 403 | 0 | ❌ FAIL | 52.16ms | Connection error: {'error': '[WinError 10054] An e... |
| 38 | `GET /api/admin/orders` | GET | 403 | 403 | ✅ PASS | 4097.04ms | Unauthorized/Forbidden - admin required (expected ... |
| 39 | `GET /api/admin/orders/{id}` | GET | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 40 | `PATCH /api/admin/orders/{id}/status` | PATCH | 200 | 404 | ❌ FAIL | 0ms | No order ID available... |
| 41 | `GET /api/admin/users` | GET | 403 | 403 | ✅ PASS | 2027.3ms | Unauthorized/Forbidden - admin required (expected ... |
| 42 | `PUT /api/admin/users/{id}` | PUT | 403 | 403 | ✅ PASS | 1911.89ms | Unauthorized/Forbidden - admin required (expected ... |
| 43 | `DELETE /api/admin/users/{id}` | DELETE | 403 | 403 | ✅ PASS | 2294.46ms | Delete attempted (401/403 expected for non-admin):... |
| 44 | `POST /api/admin/coupons` | POST | 403 | 403 | ✅ PASS | 2962.9ms | Unauthorized/Forbidden - admin required (expected ... |
| 45 | `GET /api/admin/coupons` | GET | 403 | 403 | ✅ PASS | 2037.73ms | Unauthorized/Forbidden - admin required (expected ... |
| 46 | `PUT /api/admin/coupons/{id}` | PUT | 200 | 404 | ❌ FAIL | 0ms | No coupon ID available... |
| 47 | `DELETE /api/admin/coupons/{id}` | DELETE | 200 | 404 | ❌ FAIL | 0ms | No coupon ID available... |
| 48 | `POST /api/admin/coupons/validate` | POST | 200 | 200 | ✅ PASS | 2065.73ms | Coupon validation response: {'valid': False, 'disc... |
| 49 | `GET /api/profile` | GET | 200 | 401 | ❌ FAIL | 10.02ms | Response: {'detail': 'Please login karein'}... |
| 50 | `POST /api/upload` | POST | 200 | 404 | ❌ FAIL | 12.57ms | Upload response: {'detail': 'Yeh item nahi mila'}... |
| 51 | `POST /api/contact` | POST | 200 | 200 | ✅ PASS | 1932.59ms | Contact form submitted... |
| 52 | `GET /api/auth/verify-email` | GET | 400 | 400 | ✅ PASS | 5.7ms | Email verification response: {'detail': 'Invalid r... |
| 53 | `POST /api/auth/reset-password` | POST | 400 | 400 | ✅ PASS | 6.9ms | Password reset response: {'detail': 'Invalid reque... |

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

### Test #19: DELETE /api/categories/{id}

- **Full URL:** `http://localhost:8000/api/categories/{id}`
- **Method:** DELETE
- **Expected Status:** `403`
- **Actual Status:** `204`
- **Notes:** Category deleted
- **Response Body:**
```json
{
  "raw": ""
}
```
- **Recommended Fix:** Review API documentation and expected behavior for this endpoint.

### Test #21: POST /api/cart/items

- **Full URL:** `http://localhost:8000/api/cart/items`
- **Method:** POST
- **Expected Status:** `200`
- **Actual Status:** `201`
- **Notes:** Item added to cart
- **Request Body:**
```json
{
  "product_id": 11,
  "quantity": 1
}
```
- **Response Body:**
```json
{
  "id": 30,
  "product_id": 11,
  "quantity": 1,
  "variant": null,
  "product": {
    "name": "Updated Test Product",
    "slug": "mobiles",
    "description": "mobiles techno",
    "short_description": "",
    "price": 39.99,
    "compare_price": 14.0,
    "sku": "Mobiles",
    "barcode": null,
    "stock_quantity": 4,
    "is_active": true,
    "is_featured": true,
    "is_on_sale": true,
    "images": [
      "https://res.cloudinary.com/dcatzm2ap/image/upload/v1773925180/ecommerce/products/product_ae27de9f6e8f.jpg"
    ],
    "attributes": {},
    "variants": [],
    "category_ids": [],
    "id": 11,
    "rating": 0.0,
    "review_count": 0,
    "sold_count": 0,
    "view_count": 3,
    "created_at": "2026-03-19T13:00:12.761091",
    "updated_at": "2026-03-20T10:22:11.666181",
    "categories": [
      {
        "name": "Mobiles",
        "slug": "mobiles",
        "description": "Mobile phones",
        "image": null,
        "parent_id": null,
        "id": 2
      }
    ]
  }

```
- **Recommended Fix:** Review API documentation and expected behavior for this endpoint.

### Test #23: DELETE /api/cart/items/{id}

- **Full URL:** `http://localhost:8000/api/cart/items/{id}`
- **Method:** DELETE
- **Expected Status:** `200`
- **Actual Status:** `204`
- **Notes:** Item removed from cart
- **Response Body:**
```json
{
  "raw": ""
}
```
- **Recommended Fix:** Review API documentation and expected behavior for this endpoint.

### Test #24: DELETE /api/cart

- **Full URL:** `http://localhost:8000/api/cart`
- **Method:** DELETE
- **Expected Status:** `200`
- **Actual Status:** `204`
- **Notes:** Cart cleared
- **Response Body:**
```json
{
  "raw": ""
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

### Test #32: DELETE /api/addresses/{id}

- **Full URL:** `http://localhost:8000/api/addresses/{id}`
- **Method:** DELETE
- **Expected Status:** `200`
- **Actual Status:** `204`
- **Notes:** Response: {'raw': ''}
- **Response Body:**
```json
{
  "raw": ""
}
```
- **Recommended Fix:** Review API documentation and expected behavior for this endpoint.

### Test #34: POST /api/wishlist/items/{productId}

- **Full URL:** `http://localhost:8000/api/wishlist/items/{productId}`
- **Method:** POST
- **Expected Status:** `200`
- **Actual Status:** `201`
- **Notes:** Added to wishlist
- **Response Body:**
```json
{
  "id": 5,
  "product_id": 11,
  "created_at": "2026-03-20T10:22:53.158554",
  "product": {
    "name": "Updated Test Product",
    "slug": "mobiles",
    "description": "mobiles techno",
    "short_description": "",
    "price": 39.99,
    "compare_price": 14.0,
    "sku": "Mobiles",
    "barcode": null,
    "stock_quantity": 4,
    "is_active": true,
    "is_featured": true,
    "is_on_sale": true,
    "images": [
      "https://res.cloudinary.com/dcatzm2ap/image/upload/v1773925180/ecommerce/products/product_ae27de9f6e8f.jpg"
    ],
    "attributes": {},
    "variants": [],
    "category_ids": [],
    "id": 11,
    "rating": 0.0,
    "review_count": 0,
    "sold_count": 0,
    "view_count": 3,
    "created_at": "2026-03-19T13:00:12.761091",
    "updated_at": "2026-03-20T10:22:11.666181",
    "categories": [
      {
        "name": "Mobiles",
        "slug": "mobiles",
        "description": "Mobile phones",
        "image": null,
        "parent_id": null,
        "id": 2
      }
 
```
- **Recommended Fix:** Review API documentation and expected behavior for this endpoint.

### Test #35: DELETE /api/wishlist/items/{id}

- **Full URL:** `http://localhost:8000/api/wishlist/items/{id}`
- **Method:** DELETE
- **Expected Status:** `200`
- **Actual Status:** `204`
- **Notes:** Removed from wishlist
- **Response Body:**
```json
{
  "raw": ""
}
```
- **Recommended Fix:** Review API documentation and expected behavior for this endpoint.

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
| Categories | 4 | 3 | 1 | 75.0% |
| Cart | 5 | 2 | 3 | 40.0% |
| Orders | 7 | 2 | 5 | 28.6% |
| Addresses | 4 | 3 | 1 | 75.0% |
| Wishlist | 3 | 1 | 2 | 33.3% |
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

### ❌ **NO-GO - DO NOT DEPLOY**

The API has significant issues that must be fixed before deployment.

**Critical Issues to Fix:**
- Multiple endpoint failures detected
- Health score of 4/10 is below acceptable threshold

**Required Actions:**
1. Fix all authentication flow issues
2. Ensure admin endpoints work correctly
3. Add proper error handling
4. Re-run full test suite after fixes
