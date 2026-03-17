from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from ..core.database import get_db
from ..models import Order, OrderItem, Product, User, Address
from ..schemas import OrderResponse
from ..utils.email import send_reset_email
from pydantic import BaseModel, EmailStr
import os

router = APIRouter(prefix="/contact", tags=["Contact"])


class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


@router.post("/")
async def submit_contact_form(
    contact_data: ContactRequest,
    request: Request
):
    """
    Submit a contact form.
    Sends email to admin with the contact details.
    """
    from ..utils.email import send_contact_email

    try:
        # Send email to admin
        success = send_contact_email(
            name=contact_data.name,
            email=contact_data.email,
            subject=contact_data.subject,
            message=contact_data.message
        )

        if not success:
            raise Exception("Failed to send email")

        return {
            "message": "Thank you for contacting us! We'll respond within 24 hours.",
            "status": "success"
        }

    except Exception as e:
        print(f"Error sending contact email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send message. Please try again later."
        )
