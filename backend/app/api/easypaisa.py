from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import Order
import hashlib
import requests
import os
from datetime import datetime
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
    """
    Get EasyPaisa authentication token.
    This is a simplified version - actual implementation depends on EasyPaisa's auth flow.
    """
    # EasyPaisa typically uses OAuth2 or API key authentication
    # This is a placeholder - update based on actual EasyPaisa documentation
    credentials = f"{API_USERNAME}:{API_PASSWORD}"
    encoded_credentials = hashlib.sha256(credentials.encode()).hexdigest()
    return encoded_credentials

@router.post("/initiate-payment")
def initiate_payment(
    order_id: int,
    phone_number: str,
    db: Session = Depends(get_db)
):
    """
    Initiate EasyPaisa payment for order.
    Returns redirect URL for payment.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")
    
    # Validate credentials
    if not all([STORE_ID, API_USERNAME, API_PASSWORD]):
        raise HTTPException(
            status_code=500,
            detail="EasyPaisa configuration missing. Please contact admin."
        )
    
    # Prepare payment request
    amount = str(int(order.total * 100))  # Convert to cents/paisa
    reference_id = f"EP{order_id}{int(time.time())}"
    callback_url = os.getenv("EASYPaisA_CALLBACK_URL", "http://localhost:8000/api/easypaisa/callback")
    
    # Clean phone number
    clean_phone = phone_number.replace("-", "").replace(" ", "")
    if clean_phone.startswith("0"):
        clean_phone = "92" + clean_phone[1:]
    
    # EasyPaisa payment request payload
    payload = {
        "storeId": STORE_ID,
        "orderId": reference_id,
        "orderAmount": amount,
        "currency": "PKR",
        "productTitle": f"Order #{order.order_number}",
        "productDescription": order.notes or f"Payment for order {order.order_number}",
        "returnUrl": callback_url,
        "customerMobileNumber": clean_phone,
        "customerEmail": order.guest_email or "guest@example.com"
    }
    
    try:
        # Get auth token
        auth_token = get_auth_token()
        
        # Send request to EasyPaisa
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {auth_token}",
            "X-STORE-ID": STORE_ID
        }
        
        response = requests.post(
            f"{BASE_URL}initiate",
            json=payload,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            # Check response status
            if result.get("status") == "success" or result.get("responseCode") == "000":
                # Update order with EasyPaisa reference
                order.payment_intent_id = reference_id
                db.commit()
                
                redirect_url = result.get("redirectUrl") or result.get("paymentUrl")
                
                return {
                    "status": "success",
                    "redirect_url": redirect_url,
                    "order_id": order_id,
                    "easypaisa_reference": reference_id,
                    "message": "Payment initiated successfully. Redirecting to EasyPaisa..."
                }
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"EasyPaisa error: {result.get('responseMessage', 'Unknown error')}"
                )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"EasyPaisa API error: {response.text}"
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
async def easypaisa_callback(request: Request, db: Session = Depends(get_db)):
    """
    Handle EasyPaisa payment callback.
    EasyPaisa will redirect to this endpoint after payment completion.
    """
    try:
        # Get query parameters or form data
        if request.method == "GET":
            data = dict(request.query_params)
        else:
            body = await request.form()
            data = dict(body)
        
        # Extract order_id from reference
        order_reference = data.get("orderId") or data.get("order_id")
        status = data.get("status") or data.get("paymentStatus")
        transaction_id = data.get("transactionId") or data.get("transaction_id")
        
        if not order_reference:
            raise HTTPException(status_code=400, detail="Order reference missing")
        
        # Parse order_id from reference
        # Reference format: EP1231234567890
        order_id = None
        if order_reference.startswith("EP"):
            import re
            match = re.match(r"EP(\d+)", order_reference)
            if match:
                order_id = int(match.group(1))
        
        if not order_id:
            raise HTTPException(status_code=400, detail="Invalid order reference")
        
        order = db.query(Order).filter(Order.id == order_id).first()
        
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update order status based on payment status
        if status.lower() in ["completed", "success", "paid"]:
            order.payment_status = "paid"
            order.status = "confirmed"
            if transaction_id:
                order.payment_intent_id = transaction_id
            message = "Payment successful"
        else:
            order.payment_status = "failed"
            message = f"Payment failed: {data.get('message', 'Unknown error')}"
        
        db.commit()
        
        # Send email notification
        try:
            from ..utils.email import send_order_confirmation_email
            if order.payment_status == "paid":
                send_order_confirmation_email(order)
        except Exception as e:
            print(f"Email notification error: {e}")
        
        # Return success response
        return {
            "status": "success",
            "message": message,
            "order_id": order_id,
            "payment_status": order.payment_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"EasyPaisa callback error: {e}")
        raise HTTPException(status_code=500, detail="Callback processing failed")

@router.get("/payment-status/{order_id}")
def check_payment_status(order_id: int, db: Session = Depends(get_db)):
    """
    Check EasyPaisa payment status for an order.
    """
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.payment_method != "easypaisa":
        raise HTTPException(status_code=400, detail="Order was not paid with EasyPaisa")
    
    return {
        "order_id": order_id,
        "order_number": order.order_number,
        "payment_status": order.payment_status,
        "payment_intent_id": order.payment_intent_id,
        "amount": order.total,
        "currency": order.currency
    }
