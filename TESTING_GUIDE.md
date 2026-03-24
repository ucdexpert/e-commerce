# 🧪 Complete Testing Guide - New Features

**Date:** March 24, 2026

---

## ✅ Quick Verification (5 Minutes)

### Step 1: Server Check
```bash
curl http://localhost:8000/api/health
# Expected: {"status":"healthy"}
```

### Step 2: API Docs Open Karein
```
http://localhost:8000/api/docs
```

Wahan neeche diye gaye endpoints check karein!

---

## 📋 Feature-by-Feature Testing

### **1. JazzCash & EasyPaisa Payments** ✅

#### Test via API Docs:

**Endpoint:** `POST /api/jazzcash/initiate-payment`

**Request:**
```json
{
  "order_id": 1,
  "phone_number": "03001234567"
}
```

**Expected Response (without credentials):**
```json
{
  "detail": "JazzCash configuration missing. Please contact admin."
}
```
✅ Ye expected hai! Credentials set karne ke baad kaam karega.

**Configuration:**
Edit `backend/.env`:
```env
JAZZCASH_ENVIRONMENT=sandbox
JAZZCASH_MERCHANT_ID=MC00001
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_salt
```

---

### **2. Product Variants** ✅

#### Test via API Docs:

**Step 1:** Get a product ID (e.g., `1`)

**Step 2:** Test endpoint:
```
GET /api/variants/product/1
```

**Expected Response:**
```json
{
  "product_id": 1,
  "product_name": "Some Product",
  "variants": [],
  "total": 0
}
```

**Step 3:** Create variant (Admin token required):
```
POST /api/variants/product/1
```

**Request:**
```json
{
  "name": "Large / Blue",
  "sku": "PROD-LG-BLU",
  "price": 29.99,
  "stock_quantity": 50,
  "attributes": {
    "size": "Large",
    "color": "Blue"
  }
}
```

**Expected Response:**
```json
{
  "message": "Variant created successfully",
  "variant": {...},
  "product": {...}
}
```

---

### **3. Return/Refund System** ✅

#### Test via API Docs:

**Step 1:** Login to get token

**Step 2:** Create return:
```
POST /api/returns/
```

**Request:**
```json
{
  "order_id": 1,
  "reason": "damaged",
  "reason_detail": "Product arrived damaged",
  "items": [
    {
      "order_item_id": 1,
      "product_id": 1,
      "quantity": 1,
      "reason": "damaged"
    }
  ],
  "refund_method": "original"
}
```

**Expected Response:**
```json
{
  "message": "Return request submitted successfully",
  "return": {...}
}
```

**Step 3:** Admin check returns:
```
GET /api/returns/admin/all
```

---

### **4. User Roles & Permissions** ✅

#### Test via API Docs (No Auth Required):

**Endpoint:** `GET /api/roles/permissions`

**Expected Response:**
```json
{
  "permissions": [
    {"name": "products.view", "description": "View products"},
    {"name": "products.create", "description": "Create new products"},
    ... (16 total)
  ],
  "total": 16
}
```

✅ **VERIFIED!** Ye already kaam kar raha hai!

#### Test with Admin Token:

**Endpoint:** `GET /api/roles/stats`

**Expected Response:**
```json
{
  "total_users": 5,
  "roles": {
    "superusers": 1,
    "admins": 0,
    "staff": 0,
    "vendors": 0,
    "customers": 4
  }
}
```

---

## 🎯 Frontend Testing

### **1. Payment Methods**

**URL:** `http://localhost:3000/checkout`

**Steps:**
1. Add product to cart
2. Go to checkout
3. You should see **4 payment options**:
   - 💳 Credit/Debit Card (Stripe) - Blue icon
   - 📱 JazzCash - Red icon
   - 📱 EasyPaisa - Green icon
   - 🚚 Cash on Delivery - Gray icon

**Expected:**
- All 4 radio buttons visible
- Icons showing correctly
- Clicking each shows payment form

---

### **2. Return Form**

**URL:** `http://localhost:3000/orders/{order_id}`

**Steps:**
1. Go to order details
2. Click "Return Items" button
3. Fill return form
4. Submit

---

## 🔐 Authentication Required Tests

### Get Token:

**Via API Docs:**
1. Go to `/api/docs`
2. Find `POST /api/auth/login`
3. Click "Try it out"
4. Enter credentials
5. Execute
6. Copy `access_token` from response

**Via cURL:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "yourpassword"
  }'
```

### Use Token:

Add header to requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## ✅ Verification Checklist

Tick off as you test:

### Backend APIs
- [ ] `GET /api/roles/permissions` - Works without auth ✅
- [ ] `GET /api/variants/product/1` - Returns variants
- [ ] `POST /api/variants/product/1` - Creates variant (admin)
- [ ] `POST /api/returns/` - Creates return (user)
- [ ] `GET /api/returns/admin/all` - Get returns (admin)
- [ ] `POST /api/jazzcash/initiate-payment` - Initiate (needs credentials)
- [ ] `POST /api/easypaisa/initiate-payment` - Initiate (needs credentials)

### Frontend
- [ ] Checkout page shows 4 payment methods
- [ ] JazzCash form visible
- [ ] EasyPaisa form visible
- [ ] Return form accessible

### Database
- [ ] `returns` table exists
- [ ] `is_admin` column in users table
- [ ] `is_staff` column in users table
- [ ] `is_vendor` column in users table
- [ ] `permissions` column in users table

---

## 🐛 Common Issues & Solutions

### Issue: "404 Not Found"
**Solution:** Endpoint URL check karein. All new endpoints start with `/api/`

### Issue: "401 Unauthorized"
**Solution:** Login required. Get token first.

### Issue: "403 Forbidden"
**Solution:** Admin/Superuser access required. User role check karein.

### Issue: "500 Internal Server Error"
**Solution:** Database migration run nahi hua. Run:
```bash
python migrate.py
```

### Issue: Payment not working
**Solution:** Credentials missing in `.env`. Add JazzCash/EasyPaisa config.

---

## 📊 Test Results Template

Copy-paste this to track your tests:

```
TEST RESULTS - [DATE]
=====================

✅ Backend APIs:
- [ ] Roles/Permissions
- [ ] Product Variants
- [ ] Returns
- [ ] JazzCash
- [ ] EasyPaisa

✅ Frontend:
- [ ] Checkout payment options
- [ ] Return form

✅ Database:
- [ ] Migration completed
- [ ] All tables exist

Issues Found:
1. ...
2. ...

Status: PASS / FAIL
```

---

## 🎉 Success Criteria

All features are working if:

1. ✅ API Docs mein saare endpoints show ho rahe hain
2. ✅ `/api/roles/permissions` returns 16 permissions
3. ✅ Checkout page mein 4 payment methods hain
4. ✅ Variants create/update/delete ho rahe hain
5. ✅ Return requests submit ho rahe hain
6. ✅ Database mein `returns` table hai

---

## 📞 Need Help?

1. Check API Docs: http://localhost:8000/api/docs
2. Check server logs for errors
3. Run database migration: `python migrate.py`
4. Review code files for implementation details

---

**Happy Testing!** 🚀
