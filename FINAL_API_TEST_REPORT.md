# API TEST REPORT

**Date:** 2026-03-20 14:56:13
**Base URL:** http://localhost:8000
**Test User Email:** test_1774000501@test.com
**Test Username:** testuser_1774000501

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total Tests | 56 |
| Passed | 13 |
| Failed | 43 |
| Pass Rate | 23.2% |
| Average Response Time | 1244ms |

---

## Results Table

| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |
|---|----------|--------|----------|--------|--------|---------------|-------|
| 1 | / | GET | 200 | 200 | ✅ | 9765ms | Root: E-Commerce API... |
| 2 | /api/health | GET | 200 | 200 | ✅ | 5ms | Health: ... |
| 3 | /api/auth/register | POST | 201 | 201 | ✅ | 7067ms | Register: ... |
| 4 | /api/auth/login | POST | 200 | 200 | ✅ | 4006ms | Login: ... |
| 5 | /api/auth/refresh | POST | 200 | 200 | ✅ | 983ms | Refresh: ... |
| 6 | /api/auth/me | GET | 200 | 200 | ✅ | 939ms | Get me: ... |
| 7 | /api/auth/me | PUT | 200 | 200 | ✅ | 2170ms | Update me: ... |
| 8 | /api/auth/forgot-password | POST | 200 | 200 | ✅ | 1871ms | Forgot password: If an account with that email exi... |
| 9 | /api/auth/reset-password | POST | 400 | 400 | ✅ | 5ms | Reset password (invalid): Invalid request. Dobara ... |
| 10 | /api/auth/social-login | POST | 400 | 422 | ❌ | 18ms | Social login (fake token): email: Field required |... |
| 11 | /api/auth/verify-email | GET | 400 | 400 | ✅ | 4ms | Verify email (invalid): Invalid request. Dobara tr... |
| 12 | /api/products | GET | 200 | 307 | ❌ | 4ms | ... |
| 13 | /api/products | GET | 200 | 307 | ❌ | 2ms | ... |
| 14 | /api/products/999 | GET | 404 | 404 | ✅ | 1099ms | Get product (non-existent): Yeh item nahi mila... |
| 15 | /api/products/slug/non-existent | GET | 404 | 404 | ✅ | 1167ms | Get product by slug (non-existent): Yeh item nahi ... |
| 16 | /api/products | POST | 401 | 307 | ❌ | 3ms | ... |
| 17 | /api/products | POST | 403 | 307 | ❌ | 2ms | ... |
| 18 | /api/products/1 | PUT | 401 | 200 | ❌ | 3070ms | Update product (no admin): ... |
| 19 | /api/products/1 | DELETE | 401 | 403 | ❌ | 937ms | Delete product (no admin): Aapko permission nahi h... |
| 20 | /api/categories | GET | 200 | 307 | ❌ | 3ms | ... |
| 21 | /api/categories | POST | 401 | 307 | ❌ | 3ms | ... |
| 22 | /api/categories/1 | PUT | 401 | 200 | ❌ | 4247ms | Update category (no admin): ... |
| 23 | /api/categories/1 | DELETE | 401 | 204 | ❌ | 2252ms | ... |
| 24 | /api/cart | GET | 200 | 307 | ❌ | 4ms | ... |
| 25 | /api/cart/items | POST | 200 | 400 | ❌ | 1788ms | Add to cart: Invalid request. Dobara try karein... |
| 26 | /api/cart/items/1 | PUT | 200 | 0 | ❌ | 0ms | No cart item ID... |
| 27 | /api/cart/items/1 | DELETE | 200 | 0 | ❌ | 0ms | No cart item ID... |
| 28 | /api/cart | DELETE | 200 | 307 | ❌ | 3ms | ... |
| 29 | /api/orders | GET | 200 | 307 | ❌ | 7ms | ... |
| 30 | /api/orders/999 | GET | 404 | 404 | ✅ | 1119ms | Get order (non-existent): Yeh item nahi mila... |
| 31 | /api/cart/items | POST | 200 | 400 | ❌ | 3970ms | Add item for order: Invalid request. Dobara try ka... |
| 32 | /api/orders | POST | 200 | 307 | ❌ | 11ms | ... |
| 33 | /api/orders/1/cancel | POST | 200 | 0 | ❌ | 0ms | No order ID... |
| 34 | /api/addresses | GET | 200 | 307 | ❌ | 5ms | ... |
| 35 | /api/addresses | POST | 201 | 307 | ❌ | 7ms | ... |
| 36 | /api/addresses/1 | PUT | 200 | 0 | ❌ | 0ms | No address ID... |
| 37 | /api/addresses/1 | DELETE | 200 | 0 | ❌ | 0ms | No address ID... |
| 38 | /api/wishlist | GET | 200 | 307 | ❌ | 3ms | ... |
| 39 | /api/wishlist/items/1 | POST | 200 | 201 | ❌ | 8395ms | Add to wishlist: ... |
| 40 | /api/wishlist/items/1 | DELETE | 200 | 0 | ❌ | 0ms | No wishlist item ID... |
| 41 | /api/search | GET | 200 | 307 | ❌ | 3ms | ... |
| 42 | /api/search | GET | 200 | 307 | ❌ | 3ms | ... |
| 43 | /api/admin/dashboard | GET | 401 | 403 | ❌ | 1881ms | Dashboard (no admin): Aapko permission nahi hai... |
| 44 | /api/admin/orders | GET | 401 | 403 | ❌ | 1910ms | All orders (no admin): Aapko permission nahi hai... |
| 45 | /api/admin/orders/1 | GET | 401 | 403 | ❌ | 1505ms | Order details (no admin): Aapko permission nahi ha... |
| 46 | /api/admin/orders/1/status | PATCH | 401 | 403 | ❌ | 1446ms | Update status (no admin): Aapko permission nahi ha... |
| 47 | /api/admin/users | GET | 401 | 403 | ❌ | 1076ms | All users (no admin): Aapko permission nahi hai... |
| 48 | /api/admin/users/1 | PUT | 401 | 403 | ❌ | 1014ms | Update user (no admin): Aapko permission nahi hai... |
| 49 | /api/admin/users/1 | DELETE | 401 | 403 | ❌ | 983ms | Delete user (no admin): Aapko permission nahi hai... |
| 50 | /api/admin/coupons | POST | 401 | 403 | ❌ | 1884ms | Create coupon (no admin): Aapko permission nahi ha... |
| 51 | /api/admin/coupons | GET | 401 | 403 | ❌ | 1237ms | List coupons (no admin): Aapko permission nahi hai... |
| 52 | /api/admin/coupons/1 | PUT | 401 | 403 | ❌ | 876ms | Update coupon (no admin): Aapko permission nahi ha... |
| 53 | /api/admin/coupons/1 | DELETE | 401 | 403 | ❌ | 918ms | Delete coupon (no admin): Aapko permission nahi ha... |
| 54 | /api/admin/coupons/validate | POST | 200 | 422 | ❌ | 8ms | Validate coupon: order_total: Field required... |
| 55 | /api/upload | POST | 422 | 404 | ❌ | 4ms | Upload (no file): Yeh item nahi mila... |
| 56 | /api/contact | POST | 200 | 307 | ❌ | 4ms | ... |

## Failed Tests (Detailed)

### Test #10: /api/auth/social-login
- **Endpoint**: `http://localhost:8000/api/auth/social-login`
- **Method**: POST
- **Expected Status**: 400
- **Actual Status**: 422
- **Notes**: Social login (fake token): email: Field required | name: Field required | provider_id: Field required
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #12: /api/products
- **Endpoint**: `http://localhost:8000/api/products`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #13: /api/products
- **Endpoint**: `http://localhost:8000/api/products`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #16: /api/products
- **Endpoint**: `http://localhost:8000/api/products`
- **Method**: POST
- **Expected Status**: 401
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #17: /api/products
- **Endpoint**: `http://localhost:8000/api/products`
- **Method**: POST
- **Expected Status**: 403
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #18: /api/products/1
- **Endpoint**: `http://localhost:8000/api/products/1`
- **Method**: PUT
- **Expected Status**: 401
- **Actual Status**: 200
- **Notes**: Update product (no admin): 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #19: /api/products/1
- **Endpoint**: `http://localhost:8000/api/products/1`
- **Method**: DELETE
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Delete product (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #20: /api/categories
- **Endpoint**: `http://localhost:8000/api/categories`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #21: /api/categories
- **Endpoint**: `http://localhost:8000/api/categories`
- **Method**: POST
- **Expected Status**: 401
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #22: /api/categories/1
- **Endpoint**: `http://localhost:8000/api/categories/1`
- **Method**: PUT
- **Expected Status**: 401
- **Actual Status**: 200
- **Notes**: Update category (no admin): 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #23: /api/categories/1
- **Endpoint**: `http://localhost:8000/api/categories/1`
- **Method**: DELETE
- **Expected Status**: 401
- **Actual Status**: 204
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #24: /api/cart
- **Endpoint**: `http://localhost:8000/api/cart`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #25: /api/cart/items
- **Endpoint**: `http://localhost:8000/api/cart/items`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 400
- **Notes**: Add to cart: Invalid request. Dobara try karein
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #26: /api/cart/items/1
- **Endpoint**: `http://localhost:8000/api/cart/items/1`
- **Method**: PUT
- **Expected Status**: 200
- **Actual Status**: 0
- **Notes**: No cart item ID
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #27: /api/cart/items/1
- **Endpoint**: `http://localhost:8000/api/cart/items/1`
- **Method**: DELETE
- **Expected Status**: 200
- **Actual Status**: 0
- **Notes**: No cart item ID
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #28: /api/cart
- **Endpoint**: `http://localhost:8000/api/cart`
- **Method**: DELETE
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #29: /api/orders
- **Endpoint**: `http://localhost:8000/api/orders`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #31: /api/cart/items
- **Endpoint**: `http://localhost:8000/api/cart/items`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 400
- **Notes**: Add item for order: Invalid request. Dobara try karein
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #32: /api/orders
- **Endpoint**: `http://localhost:8000/api/orders`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #33: /api/orders/1/cancel
- **Endpoint**: `http://localhost:8000/api/orders/1/cancel`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 0
- **Notes**: No order ID
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #34: /api/addresses
- **Endpoint**: `http://localhost:8000/api/addresses`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #35: /api/addresses
- **Endpoint**: `http://localhost:8000/api/addresses`
- **Method**: POST
- **Expected Status**: 201
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #36: /api/addresses/1
- **Endpoint**: `http://localhost:8000/api/addresses/1`
- **Method**: PUT
- **Expected Status**: 200
- **Actual Status**: 0
- **Notes**: No address ID
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #37: /api/addresses/1
- **Endpoint**: `http://localhost:8000/api/addresses/1`
- **Method**: DELETE
- **Expected Status**: 200
- **Actual Status**: 0
- **Notes**: No address ID
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #38: /api/wishlist
- **Endpoint**: `http://localhost:8000/api/wishlist`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #39: /api/wishlist/items/1
- **Endpoint**: `http://localhost:8000/api/wishlist/items/1`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 201
- **Notes**: Add to wishlist: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #40: /api/wishlist/items/1
- **Endpoint**: `http://localhost:8000/api/wishlist/items/1`
- **Method**: DELETE
- **Expected Status**: 200
- **Actual Status**: 0
- **Notes**: No wishlist item ID
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #41: /api/search
- **Endpoint**: `http://localhost:8000/api/search`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #42: /api/search
- **Endpoint**: `http://localhost:8000/api/search`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #43: /api/admin/dashboard
- **Endpoint**: `http://localhost:8000/api/admin/dashboard`
- **Method**: GET
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Dashboard (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #44: /api/admin/orders
- **Endpoint**: `http://localhost:8000/api/admin/orders`
- **Method**: GET
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: All orders (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #45: /api/admin/orders/1
- **Endpoint**: `http://localhost:8000/api/admin/orders/1`
- **Method**: GET
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Order details (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #46: /api/admin/orders/1/status
- **Endpoint**: `http://localhost:8000/api/admin/orders/1/status`
- **Method**: PATCH
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Update status (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #47: /api/admin/users
- **Endpoint**: `http://localhost:8000/api/admin/users`
- **Method**: GET
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: All users (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #48: /api/admin/users/1
- **Endpoint**: `http://localhost:8000/api/admin/users/1`
- **Method**: PUT
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Update user (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #49: /api/admin/users/1
- **Endpoint**: `http://localhost:8000/api/admin/users/1`
- **Method**: DELETE
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Delete user (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #50: /api/admin/coupons
- **Endpoint**: `http://localhost:8000/api/admin/coupons`
- **Method**: POST
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Create coupon (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #51: /api/admin/coupons
- **Endpoint**: `http://localhost:8000/api/admin/coupons`
- **Method**: GET
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: List coupons (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #52: /api/admin/coupons/1
- **Endpoint**: `http://localhost:8000/api/admin/coupons/1`
- **Method**: PUT
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Update coupon (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #53: /api/admin/coupons/1
- **Endpoint**: `http://localhost:8000/api/admin/coupons/1`
- **Method**: DELETE
- **Expected Status**: 401
- **Actual Status**: 403
- **Notes**: Delete coupon (no admin): Aapko permission nahi hai
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #54: /api/admin/coupons/validate
- **Endpoint**: `http://localhost:8000/api/admin/coupons/validate`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 422
- **Notes**: Validate coupon: order_total: Field required
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #55: /api/upload
- **Endpoint**: `http://localhost:8000/api/upload`
- **Method**: POST
- **Expected Status**: 422
- **Actual Status**: 404
- **Notes**: Upload (no file): Yeh item nahi mila
- **Recommended Fix**: Review endpoint implementation and authentication requirements

### Test #56: /api/contact
- **Endpoint**: `http://localhost:8000/api/contact`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 307
- **Notes**: 
- **Recommended Fix**: Review endpoint implementation and authentication requirements


## Endpoint Category Breakdown

| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Health | 2 | 2 | 0 | 100% |
| Auth | 9 | 8 | 1 | 89% |
| Products | 8 | 2 | 6 | 25% |
| Categories | 4 | 0 | 4 | 0% |
| Cart | 5 | 0 | 5 | 0% |
| Orders | 5 | 1 | 4 | 20% |
| Addresses | 4 | 0 | 4 | 0% |
| Wishlist | 3 | 0 | 3 | 0% |
| Search | 2 | 0 | 2 | 0% |
| Admin | 12 | 0 | 12 | 0% |
| Upload | 1 | 0 | 1 | 0% |
| Contact | 1 | 0 | 1 | 0% |

---

## Overall API Health Score: 2/10

**Scoring Criteria:**
- 90-100% pass rate = 10/10
- 80-89% = 8/10
- 70-79% = 6/10
- 60-69% = 4/10
- Below 60% = 2/10
- Critical auth failures = -2 points

---

## Recommendations

2. Review product endpoints - ensure proper error handling for non-existent items
4. **Performance**: Average response time (1244ms) is high - consider optimizing database queries

---

## Deployment Recommendation

❌ **NO-GO**

**Rationale:** Critical issues need to be resolved before deployment

---

*Report generated by API Test Suite v1.0*
