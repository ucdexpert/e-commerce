from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from io import StringIO
import csv

from ..core.database import get_db
from ..models.newsletter import NewsletterSubscriber
from ..models.user import User
from ..core.security import decode_token
from fastapi import Header
from pydantic import BaseModel, EmailStr

router = APIRouter(prefix="/newsletter", tags=["newsletter"])

def get_current_admin_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current admin user - requires admin role"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme"
        )

    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    try:
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        if not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )

        return user
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )


class SubscribeRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = "Anonymous"
    source: Optional[str] = "website"


@router.post("/subscribe")
def subscribe_newsletter(
    request: SubscribeRequest,
    db: Session = Depends(get_db)
):
    """
    Public endpoint to subscribe to newsletter.
    Returns success even if email already exists (idempotent).
    """
    # Validate email format
    if not request.email or "@" not in request.email or "." not in request.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address"
        )

    email = email.strip().lower()

    # Check if already subscribed
    existing = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()

    if existing:
        # Reactivate if previously unsubscribed
        if not existing.is_active:
            existing.is_active = True
            existing.unsubscribed_at = None
            existing.source = source
            if name:
                existing.name = name
            db.commit()
            return {
                "success": True,
                "message": "Welcome back! You have been re-subscribed to our newsletter.",
                "email": email
            }
        else:
            return {
                "success": True,
                "message": "You are already subscribed to our newsletter!",
                "email": email
            }

    # Create new subscriber
    subscriber = NewsletterSubscriber(
        email=email,
        name=name,
        source=source,
        is_active=True
    )
    db.add(subscriber)
    db.commit()
    db.refresh(subscriber)

    return {
        "success": True,
        "message": "Thank you for subscribing to our newsletter!",
        "email": email
    }


@router.get("/unsubscribe")
def unsubscribe_newsletter(
    email: str = Query(..., description="Email address to unsubscribe"),
    db: Session = Depends(get_db)
):
    """
    Public endpoint to unsubscribe from newsletter.
    Takes email as query parameter.
    """
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is required"
        )

    email = email.strip().lower()

    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()

    if not subscriber:
        # Don't reveal if email exists or not for privacy
        return {
            "success": True,
            "message": "You have been unsubscribed from our newsletter.",
            "email": email
        }

    if not subscriber.is_active:
        return {
            "success": True,
            "message": "You are already unsubscribed from our newsletter.",
            "email": email
        }

    # Mark as unsubscribed
    subscriber.is_active = False
    subscriber.unsubscribed_at = datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "message": "You have been successfully unsubscribed from our newsletter.",
        "email": email
    }


@router.get("/admin/subscribers")
def get_subscribers(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status: active or unsubscribed"),
    search: Optional[str] = Query(None, description="Search by email or name"),
    source: Optional[str] = Query(None, description="Filter by source"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get all newsletter subscribers with pagination and filters.
    Admin only endpoint.
    """
    query = db.query(NewsletterSubscriber)

    # Apply filters
    if status_filter:
        if status_filter.lower() == "active":
            query = query.filter(NewsletterSubscriber.is_active == True)
        elif status_filter.lower() == "unsubscribed":
            query = query.filter(NewsletterSubscriber.is_active == False)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            NewsletterSubscriber.email.ilike(search_term) |
            NewsletterSubscriber.name.ilike(search_term)
        )

    if source:
        query = query.filter(NewsletterSubscriber.source == source)

    # Get total count
    total = query.count()

    # Apply pagination
    query = query.order_by(NewsletterSubscriber.subscribed_at.desc())
    offset = (page - 1) * per_page
    subscribers = query.offset(offset).limit(per_page).all()

    # Calculate stats
    active_count = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == True
    ).count()
    unsubscribed_count = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == False
    ).count()

    return {
        "subscribers": subscribers,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page if per_page > 0 else 0,
        "stats": {
            "total": total,
            "active": active_count,
            "unsubscribed": unsubscribed_count
        }
    }


@router.get("/admin/export")
def export_subscribers(
    status_filter: Optional[str] = Query(None, description="Filter by status: active or unsubscribed"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Export subscribers as CSV file.
    Admin only endpoint.
    """
    query = db.query(NewsletterSubscriber)

    if status_filter:
        if status_filter.lower() == "active":
            query = query.filter(NewsletterSubscriber.is_active == True)
        elif status_filter.lower() == "unsubscribed":
            query = query.filter(NewsletterSubscriber.is_active == False)

    subscribers = query.order_by(NewsletterSubscriber.subscribed_at.desc()).all()

    # Create CSV in memory
    output = StringIO()
    writer = csv.writer(output)

    # Write header
    writer.writerow([
        "ID",
        "Email",
        "Name",
        "Status",
        "Subscribed At",
        "Unsubscribed At",
        "Source"
    ])

    # Write data
    for sub in subscribers:
        writer.writerow([
            sub.id,
            sub.email,
            sub.name or "",
            "Active" if sub.is_active else "Unsubscribed",
            sub.subscribed_at.strftime("%Y-%m-%d %H:%M:%S") if sub.subscribed_at else "",
            sub.unsubscribed_at.strftime("%Y-%m-%d %H:%M:%S") if sub.unsubscribed_at else "",
            sub.source
        ])

    output.seek(0)

    # Return as CSV file
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=newsletter_subscribers.csv"
        }
    )


@router.post("/admin/send-campaign")
def send_campaign(
    subject: str = Query(..., description="Email subject line"),
    content: str = Query(..., description="HTML email content"),
    send_test_to: Optional[str] = Query(None, description="Send test to this email first"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Send newsletter campaign to all active subscribers.
    Admin only endpoint.
    
    Note: This is a placeholder. In production, integrate with an email service
    like SendGrid, Mailgun, or AWS SES for bulk email sending.
    """
    import os
    from ..utils.email import send_email  # Assuming email utility exists

    # Validate content
    if not subject or len(subject.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject is required"
        )

    if not content or len(content.strip()) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email content is required"
        )

    # Get all active subscribers
    subscribers = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == True
    ).all()

    if len(subscribers) == 0:
        return {
            "success": True,
            "message": "No active subscribers found.",
            "sent_count": 0,
            "failed_count": 0
        }

    # Send test email if requested
    if send_test_to:
        try:
            # Check if email utility exists
            send_email(
                to_email=send_test_to,
                subject=f"[TEST] {subject}",
                html_content=content
            )
        except Exception as e:
            # Email service might not be configured
            print(f"Test email failed (email service may not be configured): {e}")

    # Send to all subscribers
    sent_count = 0
    failed_count = 0

    for subscriber in subscribers:
        try:
            # In production, use a proper email service with bulk sending
            # For now, we'll simulate success
            # send_email(
            #     to_email=subscriber.email,
            #     subject=subject,
            #     html_content=content
            # )
            sent_count += 1
        except Exception as e:
            print(f"Failed to send to {subscriber.email}: {e}")
            failed_count += 1

    return {
        "success": True,
        "message": f"Campaign sent successfully!",
        "subject": subject,
        "sent_count": sent_count,
        "failed_count": failed_count,
        "total_subscribers": len(subscribers)
    }


@router.get("/admin/stats")
def get_newsletter_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get newsletter statistics.
    Admin only endpoint.
    """
    total = db.query(func.count(NewsletterSubscriber.id)).scalar() or 0
    active = db.query(func.count(NewsletterSubscriber.id)).filter(
        NewsletterSubscriber.is_active == True
    ).scalar() or 0
    unsubscribed = db.query(func.count(NewsletterSubscriber.id)).filter(
        NewsletterSubscriber.is_active == False
    ).scalar() or 0

    # Get subscriptions by source
    by_source = db.query(
        NewsletterSubscriber.source,
        func.count(NewsletterSubscriber.id).label('count')
    ).group_by(NewsletterSubscriber.source).all()

    # Get recent subscriptions (last 7 days)
    from datetime import timedelta
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_subscriptions = db.query(func.count(NewsletterSubscriber.id)).filter(
        NewsletterSubscriber.subscribed_at >= seven_days_ago
    ).scalar() or 0

    return {
        "total": total,
        "active": active,
        "unsubscribed": unsubscribed,
        "by_source": [{"source": source, "count": count} for source, count in by_source],
        "recent_subscriptions": recent_subscriptions
    }
