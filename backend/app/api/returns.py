from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random
import string
from ..core.database import get_db
from ..core.security import decode_token
from ..models import Return, Order, OrderItem, User
from pydantic import BaseModel, EmailStr, Field

router = APIRouter(prefix="/returns", tags=["Returns"])


def generate_return_number() -> str:
    """Generate unique return number"""
    timestamp = ''.join(random.choices(string.digits, k=8))
    return f"RET-{timestamp}"


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    return user


def get_current_admin_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current admin user - requires admin role"""
    user = get_current_user(authorization, db)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ============ Schemas ============

class ReturnItemSchema(BaseModel):
    order_item_id: int
    product_id: int
    quantity: int
    reason: str


class ReturnCreateSchema(BaseModel):
    order_id: int
    reason: str  # damaged, wrong_item, not_as_described, size_issue, other
    reason_detail: Optional[str] = None
    items: List[ReturnItemSchema]
    refund_method: str = "original"  # original, store_credit, exchange
    images: List[str] = []


class ReturnUpdateSchema(BaseModel):
    status: Optional[str] = None  # pending, approved, rejected, processed, completed
    admin_notes: Optional[str] = None


class ReturnResponse(BaseModel):
    id: int
    return_number: str
    order_id: int
    user_id: Optional[int]
    guest_email: Optional[str]
    status: str
    reason: str
    reason_detail: Optional[str]
    items: list
    refund_amount: float
    refund_method: str
    images: list
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    reviewed_at: Optional[datetime]
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============ User Endpoints ============

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_return(
    return_data: ReturnCreateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new return request.
    User can request return for their order.
    """
    # Verify order exists and belongs to user
    order = db.query(Order).filter(Order.id == return_data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only return your own orders")
    
    # Check if order is eligible for return (within 30 days)
    days_since_order = (datetime.utcnow() - order.created_at).days
    if days_since_order > 30:
        raise HTTPException(
            status_code=400,
            detail="Return window expired. Orders can only be returned within 30 days."
        )
    
    # Check order status
    if order.status not in ["delivered", "completed"]:
        raise HTTPException(
            status_code=400,
            detail="Only delivered orders can be returned"
        )
    
    # Validate items
    order_item_ids = [item.id for item in order.items]
    for return_item in return_data.items:
        if return_item.order_item_id not in order_item_ids:
            raise HTTPException(
                status_code=400,
                detail=f"Item {return_item.order_item_id} not found in order"
            )
    
    # Calculate refund amount
    refund_amount = 0
    items_to_return = []
    
    for return_item in return_data.items:
        order_item = db.query(OrderItem).filter(OrderItem.id == return_item.order_item_id).first()
        if order_item:
            item_refund = order_item.price * return_item.quantity
            refund_amount += item_refund
            items_to_return.append({
                "order_item_id": return_item.order_item_id,
                "product_id": return_item.product_id,
                "product_name": order_item.product.name if order_item.product else "Unknown",
                "quantity": return_item.quantity,
                "reason": return_item.reason,
                "refund": item_refund
            })
    
    # Create return
    return_obj = Return(
        return_number=generate_return_number(),
        order_id=return_data.order_id,
        user_id=current_user.id,
        guest_email=order.guest_email,
        status="pending",
        reason=return_data.reason,
        reason_detail=return_data.reason_detail,
        items=items_to_return,
        refund_amount=refund_amount,
        refund_method=return_data.refund_method,
        images=return_data.images
    )
    
    db.add(return_obj)
    db.commit()
    db.refresh(return_obj)
    
    return {
        "message": "Return request submitted successfully",
        "return": return_obj
    }


@router.get("/", response_model=List[ReturnResponse])
def get_my_returns(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's return requests.
    """
    returns = db.query(Return).filter(
        Return.user_id == current_user.id
    ).order_by(Return.created_at.desc()).offset(skip).limit(limit).all()
    
    return returns


@router.get("/{return_id}", response_model=ReturnResponse)
def get_return(
    return_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific return.
    """
    return_obj = db.query(Return).filter(Return.id == return_id).first()
    if not return_obj:
        raise HTTPException(status_code=404, detail="Return not found")
    
    # Check ownership
    if return_obj.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return return_obj


# ============ Admin Endpoints ============

@router.get("/admin/all", response_model=List[ReturnResponse])
def get_all_returns(
    status_filter: Optional[str] = Query(None, alias="status"),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all return requests (Admin only).
    Can filter by status: pending, approved, rejected, processed, completed
    """
    query = db.query(Return)
    
    if status_filter:
        query = query.filter(Return.status == status_filter)
    
    returns = query.order_by(Return.created_at.desc()).offset(skip).limit(limit).all()
    return returns


@router.get("/admin/{return_id}", response_model=ReturnResponse)
def admin_get_return(
    return_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get return details (Admin only).
    """
    return_obj = db.query(Return).filter(Return.id == return_id).first()
    if not return_obj:
        raise HTTPException(status_code=404, detail="Return not found")
    
    return return_obj


@router.put("/admin/{return_id}", response_model=ReturnResponse)
def update_return(
    return_id: int,
    update_data: ReturnUpdateSchema,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update return status and notes (Admin only).
    Statuses: pending, approved, rejected, processed, completed
    """
    return_obj = db.query(Return).filter(Return.id == return_id).first()
    if not return_obj:
        raise HTTPException(status_code=404, detail="Return not found")
    
    # Update fields
    if update_data.status is not None:
        return_obj.status = update_data.status
        
        # Set timestamps based on status
        if update_data.status in ["approved", "rejected"] and not return_obj.reviewed_at:
            return_obj.reviewed_at = datetime.utcnow()
            return_obj.reviewed_by = current_user.id
        
        if update_data.status == "completed" and not return_obj.completed_at:
            return_obj.completed_at = datetime.utcnow()
    
    if update_data.admin_notes is not None:
        if return_obj.admin_notes:
            return_obj.admin_notes += f"\n\n{datetime.utcnow().strftime('%Y-%m-%d %H:%M')}: {update_data.admin_notes}"
        else:
            return_obj.admin_notes = update_data.admin_notes
    
    db.commit()
    db.refresh(return_obj)
    
    # Send email notification (optional)
    # TODO: Implement email notification
    
    return return_obj


@router.post("/admin/{return_id}/approve")
def approve_return(
    return_id: int,
    refund_amount: Optional[float] = None,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Approve return request (Admin only).
    """
    return_obj = db.query(Return).filter(Return.id == return_id).first()
    if not return_obj:
        raise HTTPException(status_code=404, detail="Return not found")
    
    return_obj.status = "approved"
    return_obj.reviewed_at = datetime.utcnow()
    return_obj.reviewed_by = current_user.id
    
    if refund_amount is not None:
        return_obj.refund_amount = refund_amount
    
    db.commit()
    
    return {
        "message": "Return approved successfully",
        "return_number": return_obj.return_number,
        "refund_amount": return_obj.refund_amount
    }


@router.post("/admin/{return_id}/reject")
def reject_return(
    return_id: int,
    reason: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Reject return request (Admin only).
    """
    return_obj = db.query(Return).filter(Return.id == return_id).first()
    if not return_obj:
        raise HTTPException(status_code=404, detail="Return not found")
    
    return_obj.status = "rejected"
    return_obj.reviewed_at = datetime.utcnow()
    return_obj.reviewed_by = current_user.id
    return_obj.admin_notes = f"Rejection reason: {reason}"
    
    db.commit()
    
    return {
        "message": "Return rejected",
        "return_number": return_obj.return_number,
        "reason": reason
    }
