import os
from twilio.rest import Client


def send_sms(to_phone: str, message: str) -> bool:
    """
    Send SMS message using Twilio.
    
    Args:
        to_phone: Recipient phone number in E.164 format (e.g., +1234567890)
        message: Message content to send
        
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_PHONE_NUMBER")

    if not all([account_sid, auth_token, from_number]):
        print("Twilio not configured - SMS notifications disabled")
        return False

    try:
        client = Client(account_sid, auth_token)
        client.messages.create(
            body=message,
            from_=from_number,
            to=to_phone
        )
        print(f"SMS sent successfully to {to_phone}")
        return True
    except Exception as e:
        print(f"SMS error: {e}")
        return False


def send_order_sms(phone: str, order_number: str, status: str) -> bool:
    """
    Send order status update SMS.
    
    Args:
        phone: Recipient phone number
        order_number: Order number/ID
        status: Order status (pending, processing, shipped, delivered, cancelled)
        
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    messages = {
        "pending": f"E-Shop: Order #{order_number} received! We'll process it shortly.",
        "processing": f"E-Shop: Order #{order_number} is being processed.",
        "shipped": f"E-Shop: Order #{order_number} has been shipped! Track your order in the app.",
        "delivered": f"E-Shop: Order #{order_number} has been delivered! Thank you for shopping with us.",
        "cancelled": f"E-Shop: Order #{order_number} has been cancelled. Contact us for help.",
        "return_requested": f"E-Shop: Order #{order_number} return request received. We'll process it shortly.",
        "returned": f"E-Shop: Order #{order_number} return has been processed. Refund will be issued.",
    }
    message = messages.get(status, f"E-Shop: Order #{order_number} status: {status}")
    return send_sms(phone, message)


def send_otp_sms(phone: str, otp: str) -> bool:
    """
    Send OTP verification SMS.
    
    Args:
        phone: Recipient phone number
        otp: One-time password to send
        
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    return send_sms(phone, f"E-Shop: Your OTP is {otp}. Valid for 5 minutes. Do not share.")


def send_promotional_sms(phone: str, message: str) -> bool:
    """
    Send promotional SMS (only if user has opted in).
    
    Args:
        phone: Recipient phone number
        message: Promotional message content
        
    Returns:
        bool: True if SMS sent successfully, False otherwise
    """
    full_message = f"E-Shop: {message} Reply STOP to unsubscribe."
    return send_sms(phone, full_message)
