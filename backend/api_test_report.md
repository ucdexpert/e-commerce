# API TEST REPORT
Date: 2026-03-28 13:29:25
Base URL: http://localhost:8000

## Executive Summary
- Total Tests: 46
- Passed: 41
- Failed: 5
- Errors: 0
- Skipped: 0
- Pass Rate: 89.1%
- Average Response Time: 1945ms

## Results Table
| # | Endpoint | Method | Expected | Actual | Status | Response Time | Notes |
|---|----------|--------|----------|--------|--------|---------------|-------|
| 1 | `/api/health` | GET | 200 | 200 | [PASS] PASS | 2076ms |  |
| 2 | `/api/auth/register` | POST | 201 | 201 | [PASS] PASS | 6146ms | User registered successfully |
| 3 | `/api/auth/login` | POST | 200 | 200 | [PASS] PASS | 1547ms | Login successful, token obtained |
| 4 | `/api/auth/profile` | GET | 200 | 200 | [PASS] PASS | 836ms |  |
| 5 | `/api/auth/me` | GET | 200 | 200 | [PASS] PASS | 803ms |  |
| 6 | `/api/auth/refresh` | POST | 200 | 200 | [PASS] PASS | 844ms |  |
| 7 | `/api/auth/forgot-password` | POST | 200 | 200 | [PASS] PASS | 2035ms |  |
| 8 | `/api/auth/social-login` | POST | 200 | 200 | [PASS] PASS | 3045ms |  |
| 9 | `/api/categories/` | GET | 200 | 200 | [PASS] PASS | 8987ms |  |
| 10 | `/api/categories/all` | GET | 200 | 200 | [PASS] PASS | 9504ms |  |
| 11 | `/api/categories/ POST` | POST | 201 | 201 | [PASS] PASS | 2252ms |  |
| 12 | `/api/products/` | GET | 200 | 200 | [PASS] PASS | 10554ms |  |
| 13 | `/api/products/search` | GET | 200 | 200 | [PASS] PASS | 1301ms |  |
| 14 | `/api/products/flash-sales` | GET | 200 | 422 | [FAIL] FAIL | 11ms |  |
| 15 | `/api/products/ POST` | POST | 201 | 403 | [PASS] PASS | 879ms | 403 expected without admin token |
| 16 | `/api/cart/` | GET | 200 | 200 | [PASS] PASS | 1488ms |  |
| 17 | `/api/wishlist/` | GET | 200 | 200 | [PASS] PASS | 1039ms |  |
| 18 | `/api/addresses/ POST` | POST | 201 | 201 | [PASS] PASS | 2438ms |  |
| 19 | `/api/addresses/ GET` | GET | 200 | 200 | [PASS] PASS | 827ms |  |
| 20 | `/api/orders/ GET` | GET | 200 | 200 | [PASS] PASS | 2506ms |  |
| 21 | `/api/orders/create-payment-intent` | POST | 200 | 400 | [FAIL] FAIL | 3169ms |  |
| 22 | `/api/search/` | GET | 200 | 200 | [PASS] PASS | 1750ms |  |
| 23 | `/api/search/suggestions` | GET | 200 | 200 | [PASS] PASS | 1198ms |  |
| 24 | `/api/admin/dashboard` | GET | 200 | 403 | [PASS] PASS | 805ms | 403 expected without admin role |
| 25 | `/api/admin/orders` | GET | 200 | 403 | [PASS] PASS | 823ms | 403 expected without admin role |
| 26 | `/api/admin/users` | GET | 200 | 403 | [PASS] PASS | 1489ms | 403 expected without admin role |
| 27 | `/api/admin/coupons` | GET | 200 | 403 | [PASS] PASS | 991ms | 403 expected without admin role |
| 28 | `/api/admin/coupons/validate` | POST | 200 | 200 | [PASS] PASS | 850ms |  |
| 29 | `/api/contact/` | POST | 200 | 200 | [PASS] PASS | 1764ms |  |
| 30 | `/api/upload/` | POST | 200 | 200 | [PASS] PASS | 3ms |  |
| 31 | `/api/jazzcash/initiate-payment` | POST | 200 | 500 | [PASS] PASS | 870ms | Expected to fail without JazzCash config |
| 32 | `/api/easypaisa/initiate-payment` | POST | 200 | 500 | [PASS] PASS | 1051ms | Expected to fail without EasyPaisa config |
| 33 | `/api/variants/product/{id}` | GET | 200 | 200 | [PASS] PASS | 1756ms |  |
| 34 | `/api/returns/ GET` | GET | 200 | 200 | [PASS] PASS | 1617ms |  |
| 35 | `/api/returns/admin/all` | GET | 200 | 403 | [PASS] PASS | 1154ms | 403 expected without admin role |
| 36 | `/api/roles/permissions` | GET | 200 | 200 | [PASS] PASS | 2ms |  |
| 37 | `/api/roles/users` | GET | 200 | 403 | [PASS] PASS | 927ms | 403 expected without admin role |
| 38 | `/api/shipping/companies` | GET | 200 | 200 | [PASS] PASS | 1214ms |  |
| 39 | `/api/shipping/calculate` | POST | 200 | 200 | [PASS] PASS | 1097ms |  |
| 40 | `/api/referral/my-referral` | GET | 200 | 200 | [PASS] PASS | 2500ms |  |
| 41 | `/api/referral/referrals` | GET | 200 | 200 | [PASS] PASS | 1071ms |  |
| 42 | `/api/bulk/products/export` | GET | 200 | 403 | [PASS] PASS | 830ms | 403 expected without admin role |
| 43 | `/api/newsletter/subscribe` | POST | 200 | 500 | [FAIL] FAIL | 7ms |  |
| 44 | `/api/newsletter/unsubscribe` | GET | 200 | N/A | [FAIL] FAIL | 32ms |  |
| 45 | `/api/newsletter/admin/stats` | GET | 200 | 403 | [PASS] PASS | 3360ms | 403 expected without admin role |
| 46 | `/api/profile` | GET | 200 | 401 | [FAIL] FAIL | 3ms |  |

## Failed Tests (Detailed)
### Test #1: /api/products/flash-sales
- **Endpoint**: `/api/products/flash-sales`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 422
- **Error**: product_id: Input should be a valid integer, unable to parse string as an integer
- **Response**: {'detail': 'product_id: Input should be a valid integer, unable to parse string as an integer'}

### Test #2: /api/orders/create-payment-intent
- **Endpoint**: `/api/orders/create-payment-intent`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 400
- **Error**: Invalid request. Dobara try karein
- **Response**: {'detail': 'Invalid request. Dobara try karein'}

### Test #3: /api/newsletter/subscribe
- **Endpoint**: `/api/newsletter/subscribe`
- **Method**: POST
- **Expected Status**: 200
- **Actual Status**: 500
- **Error**: Server mein masla aa gaya. Thodi der mein try karein.
- **Response**: {'detail': 'Server mein masla aa gaya. Thodi der mein try karein.'}

### Test #4: /api/newsletter/unsubscribe
- **Endpoint**: `/api/newsletter/unsubscribe`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 0
- **Error**: Error: [WinError 10054] An existing connection was forcibly closed by the remote host

### Test #5: /api/profile
- **Endpoint**: `/api/profile`
- **Method**: GET
- **Expected Status**: 200
- **Actual Status**: 401
- **Error**: Please login karein
- **Response**: {'detail': 'Please login karein'}

## Endpoint Category Breakdown
| Category | Total | Passed | Failed | Pass Rate |
|----------|-------|--------|--------|-----------|
| Auth | 7 | 7 | 0 | 100% |
| Products | 6 | 5 | 1 | 83% |
| Categories | 3 | 3 | 0 | 100% |
| Cart | 1 | 1 | 0 | 100% |
| Orders | 3 | 2 | 1 | 67% |
| Admin | 7 | 7 | 0 | 100% |
| Search | 3 | 3 | 0 | 100% |
| Shipping | 2 | 2 | 0 | 100% |
| Payment | 3 | 2 | 1 | 67% |
| Other | 14 | 11 | 3 | 79% |

## Overall API Health Score: 8/10

Scoring Criteria:
- 90-100% pass rate = 10/10
- 80-89% = 8/10
- 70-79% = 6/10
- 60-69% = 4/10
- Below 60% = 2/10

## Recommendations
[WARN] API is mostly functional but some endpoints need attention.

---
*Report generated by API Test Script*