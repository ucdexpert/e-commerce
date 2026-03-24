# 📱 JazzCash & EasyPaisa Payment Integration Guide

**Date:** March 24, 2026  
**Status:** 📋 Setup Required

---

## 🎯 Overview

Ye guide aapko step-by-step batayegi ke JazzCash aur EasyPaisa payment gateway ko apne e-commerce platform mein kaise integrate karte hain.

---

## 📋 Part 1: JazzCash Merchant Account Setup

### Step 1: JazzCash Merchant Account Register Karein

#### Option A: Online Registration
1. **Website visit karein:**
   - JazzCash Merchant Portal: https://www.jazzcash.com.pk/business/
   - Ya JazzCash Merchant API Portal: https://sandbox.jazzcash.com.pk/

2. **Required Documents:**
   - CNIC copy (owner/business)
   - Business registration documents (agar business hai)
   - Bank account details
   - Mobile number (JazzCash number)
   - Email address

3. **Registration Form:**
   - Business name aur type select karein
   - Contact information fill karein
   - Bank account details provide karein

#### Option B: JazzCash Office Visit
- Nearest JazzCash business center visit karein
- Merchant account opening form fill karein
- Documents submit karein
- 3-5 working days mein account activate ho jayega

---

### Step 2: API Credentials Obtain Karein

#### Sandbox (Testing) Credentials
1. **Sandbox Portal par jayen:**
   ```
   https://sandbox.jazzcash.com.pk/
   ```

2. **Login/Register:**
   - Agar account nahi hai to "Register" karein
   - Apna JazzCash merchant number use karein

3. **API Credentials section mein jayen:**
   - **Merchant ID** (e.g., `MC00001`)
   - **Password** (API password)
   - **Integrity Salt/Hash Key** (e.g., `ABC123XYZ`)

#### Live (Production) Credentials
- Merchant account approve hone ke baad
- JazzCash team aapko live credentials provide karegi
- Email ke through bheje jayenge

---

### Step 3: JazzCash API Configuration

#### Required Credentials Summary:
```
✅ Merchant ID (Sandbox + Live)
✅ Password (Sandbox + Live)
✅ Integrity Salt/Hash Key (Sandbox + Live)
✅ Customer CNIC (last 6 digits - mandatory for API v2.0)
```

#### API Endpoints:
```
Sandbox Base URL: https://sandbox.jazzcash.com.pk/ApplicationAPI/API/
Live Base URL: https://payments.jazzcash.com.pk/ApplicationAPI/API/

Payment Endpoint: DoMWalletTransaction
Status Inquiry: TransactionInquiry
Callback URL: https://your-domain.com/api/jazzcash/callback
```

---

## 📋 Part 2: EasyPaisa Merchant Account Setup

### Step 1: EasyPaisa Merchant Account Register Karein

#### Option A: Online Registration
1. **Website visit karein:**
   - EasyPaisa Merchant Portal: https://www.easypaisa.com.pk/merchant
   - Telenor EasyPay Portal: https://www.telenor.pk/business/

2. **Required Documents:**
   - CNIC copy
   - Business registration (NTN/STN - agar applicable)
   - Bank account details
   - Mobile number (EasyPaisa number)
   - Email address

3. **Registration Process:**
   - Online form fill karein
   - Documents upload karein
   - Verification call ka intezar karein

#### Option B: EasyPaisa Office Visit
- Nearest Telenor/EasyPaisa franchise visit karein
- Merchant account form fill karein
- Documents verify karwayen
- 5-7 working days mein activation

---

### Step 2: EasyPaisa API Credentials Obtain Karein

#### API Credentials Request Karein:
1. **Merchant portal login karein:**
   ```
   https://www.easypaisa.com.pk/merchant/login
   ```

2. **API Access Request:**
   - "Developer" ya "API Integration" section mein jayen
   - API integration request submit karein
   - Use case describe karein (e-commerce payments)

3. **Credentials receive honge:**
   - **Store ID** (Merchant ID)
   - **API Username**
   - **API Password**
   - **Secret Key/Token**

#### Contact for API Access:
```
Email: api-support@telenor.com.pk
       easypaisa-merchant@telenor.com.pk

Phone: 0800-TELENOR (0800-8353667)
       +92-42-111-000-324
```

---

### Step 3: EasyPaisa API Configuration

#### Required Credentials Summary:
```
✅ Store ID / Merchant ID
✅ API Username
✅ API Password
✅ Secret Key / Token
✅ Callback/Return URL
```

#### API Endpoints (Reference):
```
Sandbox: https://sandbox.easypaisa.com.pk/merchantservices/
Live: https://easypaisa.com.pk/merchantservices/

Payment Initiate: /initiate
Payment Confirm: /confirm
Status Check: /status
```

---

## 🛠️ Part 3: Integration Steps (Technical)

### Backend Configuration (FastAPI)

#### 1. Environment Variables Add Karein

**File:** `backend/.env`

```env
# ============ JazzCash Configuration ============
JAZZCASH_ENVIRONMENT=sandbox  # sandbox ya live
JAZZCASH_MERCHANT_ID=MC00001
JAZZCASH_PASSWORD=your_password_here
JAZZCASH_INTEGRITY_SALT=your_integrity_salt_here
JAZZCASH_CUSTOMER_CNIC_LAST6=123456
JAZZCASH_SANDBOX_URL=https://sandbox.jazzcash.com.pk/ApplicationAPI/API/
JAZZCASH_LIVE_URL=https://payments.jazzcash.com.pk/ApplicationAPI/API/
JAZZCASH_CALLBACK_URL=https://your-domain.com/api/jazzcash/callback

# ============ EasyPaisa Configuration ============
EASYPaisA_ENVIRONMENT=sandbox  # sandbox ya live
EASYPaisA_STORE_ID=your_store_id
EASYPaisA_API_USERNAME=your_api_username
EASYPaisA_API_PASSWORD=your_api_password
EASYPaisA_SECRET_KEY=your_secret_key
EASYPaisA_SANDBOX_URL=https://sandbox.easypaisa.com.pk/merchantservices/
EASYPaisA_LIVE_URL=https://easypaisa.com.pk/merchantservices/
EASYPaisA_CALLBACK_URL=https://your-domain.com/api/easypaisa/callback
```

---

#### 2. Payment Method Database Update

**File:** `backend/app/models/order.py`

```python
# payment_method field update:
# Existing: payment_method = Column(String)
# Values: "stripe", "cod", "jazzcash", "easypaisa"
```

---

#### 3. New API Endpoints Create Karein

**File:** `backend/app/api/jazzcash.py` (NEW FILE)

```python
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import Order
import hashlib
import hmac
import requests
import os
from datetime import datetime

router = APIRouter(prefix="/jazzcash", tags=["JazzCash"])

# JazzCash Configuration
JAZZCASH_ENV = os.getenv("JAZZCASH_ENVIRONMENT", "sandbox")
MERCHANT_ID = os.getenv("JAZZCASH_MERCHANT_ID")
PASSWORD = os.getenv("JAZZCASH_PASSWORD")
INTEGRITY_SALT = os.getenv("JAZZCASH_INTEGRITY_SALT")
BASE_URL = os.getenv(
    "JAZZCASH_LIVE_URL" if JAZZCASH_ENV == "live" else "JAZZCASH_SANDBOX_URL"
)

def generate_hash(data: str, integrity_salt: str) -> str:
    """Generate HMAC-SHA256 hash for JazzCash"""
    return hmac.new(
        integrity_salt.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest().upper()

@router.post("/initiate-payment")
def initiate_payment(
    order_id: int,
    db: Session = Depends(get_db)
):
    """Initiate JazzCash payment for order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Prepare payment request
    amount = str(int(order.total * 100))  # Convert to cents/paisa
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    reference_id = f"ORD{order_id}{timestamp}"
    
    # Create hash
    hash_data = f"{MERCHANT_ID}&{amount}&{timestamp}&{reference_id}"
    secure_hash = generate_hash(hash_data, INTEGRITY_SALT)
    
    # JazzCash API request
    payload = {
        "api_version": "v2.0",
        "format": "JSON",
        "transaction_type": "MWALLET",
        "merchant_id": MERCHANT_ID,
        "password": PASSWORD,
        "amount": amount,
        "currency": "PKR",
        "order_id": reference_id,
        "order_desc": f"Order #{order.order_number}",
        "customer_mobile_number": "92" + order.guest_email[:11] if order.guest_email else "923001234567",
        "secure_hash": secure_hash
    }
    
    # Send request to JazzCash
    response = requests.post(
        f"{BASE_URL}DoMWalletTransaction",
        json=payload
    )
    
    if response.status_code == 200:
        result = response.json()
        return {
            "status": "success",
            "redirect_url": result.get("redirect_url"),
            "order_id": order_id,
            "jazzcash_reference": reference_id
        }
    else:
        raise HTTPException(
            status_code=400,
            detail=f"JazzCash payment initiation failed: {response.text}"
        )

@router.post("/callback")
async def jazzcash_callback(request: Request, db: Session = Depends(get_db)):
    """Handle JazzCash payment callback"""
    data = await request.json()
    
    # Verify hash
    received_hash = data.get("pp_SecureHash")
    
    # Create hash from received data for verification
    hash_data = "&".join([
        str(data.get("pp_MerchantID", "")),
        str(data.get("pp_Amount", "")),
        str(data.get("pp_TransactionID", "")),
        str(data.get("pp_ResponseCode", ""))
    ])
    
    calculated_hash = generate_hash(hash_data, INTEGRITY_SALT)
    
    if calculated_hash != received_hash:
        raise HTTPException(status_code=400, detail="Invalid hash")
    
    # Update order status
    order_id = data.get("pp_OrderID")
    response_code = data.get("pp_ResponseCode")
    
    if response_code == "000":  # Success
        # Extract order_id from reference
        order_id_num = int(order_id.replace("ORD", "").split("202")[0])
        order = db.query(Order).filter(Order.id == order_id_num).first()
        if order:
            order.payment_status = "paid"
            order.status = "confirmed"
            db.commit()
    
    return {"status": "success"}
```

---

**File:** `backend/app/api/easypaisa.py` (NEW FILE)

```python
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import Order
import requests
import os
import hashlib
import time

router = APIRouter(prefix="/easypaisa", tags=["EasyPaisa"])

# EasyPaisa Configuration
EASYPaisA_ENV = os.getenv("EASYPaisA_ENVIRONMENT", "sandbox")
STORE_ID = os.getenv("EASYPaisA_STORE_ID")
API_USERNAME = os.getenv("EASYPaisA_API_USERNAME")
API_PASSWORD = os.getenv("EASYPaisA_API_PASSWORD")
SECRET_KEY = os.getenv("EASYPaisA_SECRET_KEY")
BASE_URL = os.getenv(
    "EASYPaisA_LIVE_URL" if EASYPaisA_ENV == "live" else "EASYPaisA_SANDBOX_URL"
)

def get_auth_token():
    """Get EasyPaisa authentication token"""
    # Implementation depends on EasyPaisa's auth method
    pass

@router.post("/initiate-payment")
def initiate_payment(
    order_id: int,
    db: Session = Depends(get_db)
):
    """Initiate EasyPaisa payment for order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    amount = str(int(order.total * 100))
    reference_id = f"EP{order_id}{int(time.time())}"
    
    # EasyPaisa payment request
    payload = {
        "storeId": STORE_ID,
        "orderId": reference_id,
        "orderAmount": amount,
        "currency": "PKR",
        "productTitle": f"Order #{order.order_number}",
        "returnUrl": os.getenv("EASYPaisA_CALLBACK_URL")
    }
    
    # Send request
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {get_auth_token()}"
    }
    
    response = requests.post(
        f"{BASE_URL}initiate",
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        result = response.json()
        return {
            "status": "success",
            "redirect_url": result.get("redirectUrl"),
            "order_id": order_id,
            "easypaisa_reference": reference_id
        }
    else:
        raise HTTPException(
            status_code=400,
            detail=f"EasyPaisa payment initiation failed"
        )

@router.post("/callback")
async def easypaisa_callback(request: Request, db: Session = Depends(get_db)):
    """Handle EasyPaisa payment callback"""
    data = await request.json()
    
    # Verify and update order
    order_id = data.get("orderId")
    status = data.get("status")
    
    if status == "completed":
        # Extract and update order
        order_id_num = int(order_id.replace("EP", "").split(str(int(time.time()))[4:])[0])
        order = db.query(Order).filter(Order.id == order_id_num).first()
        if order:
            order.payment_status = "paid"
            order.status = "confirmed"
            db.commit()
    
    return {"status": "success"}
```

---

#### 4. Main API Router Update

**File:** `backend/app/main.py`

```python
# Add new routers
from .api import jazzcash, easypaisa

app.include_router(jazzcash.router)
app.include_router(easypaisa.router)
```

---

### Frontend Integration (Next.js)

#### 1. Payment Method Selection Update

**File:** `frontend/components/CheckoutForm.tsx` (ya similar)

```tsx
// Payment methods update
const paymentMethods = [
  {
    id: 'stripe',
    name: 'Credit/Debit Card',
    description: 'Visa, Mastercard, American Express',
    icon: '💳'
  },
  {
    id: 'jazzcash',
    name: 'JazzCash',
    description: 'Pay with JazzCash Mobile Wallet',
    icon: '📱'
  },
  {
    id: 'easypaisa',
    name: 'EasyPaisa',
    description: 'Pay with EasyPaisa Mobile Wallet',
    icon: '📲'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    description: 'Pay when you receive your order',
    icon: '💵'
  }
];
```

---

#### 2. Payment Handler Component

**File:** `frontend/components/JazzCashPayment.tsx` (NEW FILE)

```tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function JazzCashPayment({ order }: { order: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jazzcash/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: order.id,
          phone_number: phoneNumber
        })
      });

      const data = await response.json();

      if (data.redirect_url) {
        // Redirect to JazzCash payment page
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      console.error('JazzCash payment error:', error);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">JazzCash Payment</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          JazzCash Mobile Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="0300-1234567"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || !phoneNumber}
        className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Pay with JazzCash'}
      </button>
    </div>
  );
}
```

---

**File:** `frontend/components/EasyPaisaPayment.tsx` (NEW FILE)

```tsx
import { useState } from 'react';

export default function EasyPaisaPayment({ order }: { order: any }) {
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/easypaisa/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: order.id,
          phone_number: phoneNumber
        })
      });

      const data = await response.json();

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (error) {
      console.error('EasyPaisa payment error:', error);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">EasyPaisa Payment</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          EasyPaisa Mobile Number
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="0345-1234567"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || !phoneNumber}
        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Pay with EasyPaisa'}
      </button>
    </div>
  );
}
```

---

## ✅ Part 4: Testing Checklist

### JazzCash Testing:
- [ ] Sandbox account create kiya
- [ ] Test credentials receive huye
- [ ] Payment initiation test kiya
- [ ] Callback handler test kiya
- [ ] Success/failure scenarios test kiye

### EasyPaisa Testing:
- [ ] Merchant account apply kiya
- [ ] API credentials receive huye
- [ ] Payment flow test kiya
- [ ] Webhook verification test kiya

---

## 📞 Part 5: Support Contacts

### JazzCash Support:
```
Helpline: 111-123-223
Email: support@jazzcash.com.pk
Website: https://www.jazzcash.com.pk
```

### EasyPaisa Support:
```
Helpline: 0800-TELENOR (0800-8353667)
Email: easypaisa-support@telenor.com.pk
Website: https://www.easypaisa.com.pk
```

---

## 🎯 Next Steps

1. **Pehla Step:** JazzCash aur EasyPaisa merchant accounts ke liye apply karein
2. **Dusra Step:** Sandbox credentials obtain karein
3. **Teesra Step:** Mujhe batayein jab credentials mil jayen, main complete integration code likh dunga
4. **Chautha Step:** Testing karein sandbox environment mein
5. **Paanchwan Step:** Live credentials ke baad production deploy karein

---

## 📝 Important Notes

⚠️ **Security:**
- API credentials ko `.env` file mein rakhein
- Git repository mein credentials commit na karein
- HTTPS use karein production mein

⚠️ **Compliance:**
- State Bank of Pakistan guidelines follow karein
- Customer data protection ensure karein
- Transaction logs maintain rakhein

---

**Questions?** Jab bhi aapko credentials mil jayen, mujhe batayein. Main complete integration code ready kar dunga! 🚀
