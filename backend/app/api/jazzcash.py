from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import Order
import hashlib
import hmac
import requests
import os
from datetime import datetime
import xml.etree.ElementTree as ET

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
    phone_number: str,
    db: Session = Depends(get_db)
):
    """
    Initiate JazzCash payment for order.
    Returns redirect URL for payment.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")
    
    # Validate credentials
    if not all([MERCHANT_ID, PASSWORD, INTEGRITY_SALT]):
        raise HTTPException(
            status_code=500,
            detail="JazzCash configuration missing. Please contact admin."
        )
    
    # Prepare payment request
    amount = str(int(order.total * 100))  # Convert to cents/paisa
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    reference_id = f"ORD{order_id}{timestamp}"
    
    # Create hash
    hash_data = f"{MERCHANT_ID}&{amount}&{timestamp}&{reference_id}"
    secure_hash = generate_hash(hash_data, INTEGRITY_SALT)
    
    # JazzCash API request payload
    payload = {
        "api_version": "v2.0",
        "format": "JSON",
        "transaction_type": "MWALLET",
        "merchant_id": MERCHANT_ID,
        "password": PASSWORD,
        "amount": amount,
        "currency": "PKR",
        "order_id": reference_id,
        "order_desc": f"Order #{order.order_number} - {order.guest_email or 'Guest Order'}",
        "customer_mobile_number": phone_number.replace("-", "").replace(" ", ""),
        "secure_hash": secure_hash
    }
    
    try:
        # Send request to JazzCash
        response = requests.post(
            f"{BASE_URL}DoMWalletTransaction",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Check response code
            if result.get("response_code") == "000":
                # Update order with JazzCash reference
                order.payment_intent_id = reference_id
                db.commit()
                
                return {
                    "status": "success",
                    "redirect_url": result.get("redirect_url"),
                    "order_id": order_id,
                    "jazzcash_reference": reference_id,
                    "message": "Payment initiated successfully. Redirecting to JazzCash..."
                }
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"JazzCash error: {result.get('response_message', 'Unknown error')}"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"JazzCash API error: {response.text}"
            )
            
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500,
            detail=f"Connection error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Payment initiation failed: {str(e)}"
        )

@router.post("/callback")
async def jazzcash_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handle JazzCash payment callback.
    JazzCash will POST to this endpoint after payment completion.
    """
    try:
        # Get form data (JazzCash sends form-urlencoded)
        body = await request.form()
        data = dict(body)
        
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
            raise HTTPException(status_code=400, detail="Invalid hash - security verification failed")
        
        # Extract order_id from reference (format: ORD{order_id}{timestamp})
        order_reference = data.get("pp_OrderID", "")
        response_code = data.get("pp_ResponseCode", "")
        
        # Parse order_id from reference
        # Reference format: ORD12320260324120000
        order_id = None
        if order_reference.startswith("ORD"):
            # Extract numeric part
            import re
            match = re.match(r"ORD(\d+)", order_reference)
            if match:
                order_id = int(match.group(1))
        
        if not order_id:
            raise HTTPException(status_code=400, detail="Invalid order reference")
        
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update order status based on response
        if response_code == "000":  # Success
            order.payment_status = "paid"
            order.status = "confirmed"
            message = "Payment successful"
        else:  # Failed
            order.payment_status = "failed"
            message = f"Payment failed: {data.get('pp_ResponseMessage', 'Unknown error')}"
        
        db.commit()
        
        # Send email notification
        try:
            from ..utils.email import send_order_confirmation_email
            if order.payment_status == "paid":
                send_order_confirmation_email(order)
        except Exception as e:
            print(f"Email notification error: {e}")
        
        # Return success response to JazzCash
        return {
            "status": "success",
            "message": message,
            "order_id": order_id,
            "payment_status": order.payment_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"JazzCash callback error: {e}")
        raise HTTPException(status_code=500, detail="Callback processing failed")

@router.get("/payment-status/{order_id}")
def check_payment_status(order_id: int, db: Session = Depends(get_db)):
    """
    Check JazzCash payment status for an order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_method != "jazzcash":
        raise HTTPException(status_code=400, detail="Order was not paid with JazzCash")
    
    return {
        "order_id": order_id,
        "order_number": order.order_number,
        "payment_status": order.payment_status,
        "payment_intent_id": order.payment_intent_id,
        "amount": order.total,
        "currency": order.currency
    }
