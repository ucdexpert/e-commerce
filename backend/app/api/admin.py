from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from ..core.database import get_db
from ..models import User, Order, OrderItem, Product, Category, Coupon
from ..schemas import (
    DashboardStats,
    OrderResponse,
    OrderUpdate,
    UserResponse,
    UserUpdate,
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    CouponValidateRequest,
    CouponValidateResponse,
    OrderListResponse,
)
from ..core.security import decode_token
from fastapi import Header

router = APIRouter(prefix="/admin", tags=["Admin"])

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

@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get dashboard statistics including chart data"""
    from sqlalchemy import distinct, text
    from datetime import timedelta
    from ..models.product import product_categories

    # Total revenue (ALL orders, not just paid)
    total_revenue = db.query(
        func.sum(Order.total)
    ).filter(
        Order.status != "cancelled"
    ).scalar() or 0

    # Total orders
    total_orders = db.query(func.count(Order.id)).scalar() or 0

    # Total products
    total_products = db.query(func.count(Product.id)).scalar() or 0

    # Total users
    total_users = db.query(func.count(User.id)).filter(User.is_superuser == False).scalar() or 0

    # Pending orders
    pending_orders = db.query(func.count(Order.id)).filter(
        Order.status == "pending"
    ).scalar() or 0

    # Low stock products (get actual products, not count)
    low_stock_products_list = db.query(Product).filter(
        Product.stock_quantity <= Product.low_stock_threshold,
        Product.is_active == True
    ).limit(10).all()

    # Recent orders (last 10)
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()

    # ============ CHART DATA ============

    # 1. Revenue Last 7 Days (one query per day, ALL orders not just paid)
    from datetime import datetime, timedelta
    today = datetime.utcnow().date()
    revenue_chart = []

    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_revenue = db.query(
            func.sum(Order.total)
        ).filter(
            func.date(Order.created_at) == day,
            Order.status != "cancelled"
        ).scalar() or 0

        revenue_chart.append({
            "date": day.strftime("%a"),  # Mon, Tue, Wed, etc.
            "revenue": float(day_revenue)
        })

    # 2. Orders by Status
    orders_by_status = db.query(
        Order.status,
        func.count(Order.id).label('count')
    ).group_by(Order.status).all()

    orders_by_status_chart = [
        {"status": status, "count": count}
        for status, count in orders_by_status
    ]

    # 3. Top 5 Products by Units Sold
    top_products = db.query(
        Product.id,
        Product.name,
        func.sum(OrderItem.quantity).label('total_sold')
    ).join(OrderItem, Product.id == OrderItem.product_id).group_by(
        Product.id, Product.name
    ).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()

    top_products_chart = [
        {"name": name[:20] + '...' if len(name) > 20 else name, "sold": int(sold)}
        for id, name, sold in top_products
    ]

    # 4. Revenue by Category (FIXED - proper joins through association table)
    revenue_by_category = db.query(
        Category.name,
        func.sum(OrderItem.subtotal).label('revenue')
    ).select_from(OrderItem)\
     .join(Product, Product.id == OrderItem.product_id)\
     .join(product_categories, product_categories.c.product_id == Product.id)\
     .join(Category, Category.id == product_categories.c.category_id)\
     .group_by(Category.id, Category.name)\
     .order_by(func.sum(OrderItem.subtotal).desc())\
     .limit(5).all()

    revenue_by_category_data = [
        {"name": row.name, "revenue": float(row.revenue or 0)}
        for row in revenue_by_category
    ]

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_users": total_users,
        "pending_orders": pending_orders,
        "low_stock_products": low_stock_products_list,
        "recent_orders": recent_orders,
        "revenue_chart": revenue_chart,
        "orders_by_status": orders_by_status_chart,
        "top_products": top_products_chart,
        "revenue_by_category": revenue_by_category_data,
    }

@router.get("/orders")
def get_admin_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all orders with pagination and filters"""
    query = db.query(Order)

    if status_filter:
        query = query.filter(Order.status == status_filter)

    if search:
        query = query.filter(
            Order.order_number.ilike(f"%{search}%") |
            Order.shipping_address_id.in_(
                db.query(User.id).filter(
                    User.email.ilike(f"%{search}%") |
                    User.username.ilike(f"%{search}%")
                )
            )
        )

    # Get total count before pagination
    total = query.count()
    
    query = query.order_by(Order.created_at.desc())

    offset = (page - 1) * per_page
    orders = query.offset(offset).limit(per_page).all()

    # Return in expected format
    return {
        "orders": orders,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page if per_page > 0 else 0
    }

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_admin_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get single order details"""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    return order

@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update order status"""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    new_status = status_data.get("status")
    if new_status:
        order.status = new_status
        
        if new_status == "shipped":
            order.shipped_at = datetime.utcnow()
        elif new_status == "delivered":
            order.delivered_at = datetime.utcnow()
        elif new_status == "cancelled":
            order.cancelled_at = datetime.utcnow()
    
    db.commit()
    db.refresh(order)
    return order

@router.get("/users", response_model=List[UserResponse])
def get_admin_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all users with pagination and filters"""
    query = db.query(User).filter(User.is_superuser == False)
    
    if role:
        # In a real app, you'd have a role field. For now, filter by is_superuser
        pass
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    if search:
        query = query.filter(
            User.email.ilike(f"%{search}%") |
            User.username.ilike(f"%{search}%") |
            User.full_name.ilike(f"%{search}%")
        )
    
    query = query.order_by(User.created_at.desc())
    
    offset = (page - 1) * per_page
    users = query.offset(offset).limit(per_page).all()
    
    return users

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update user role or status"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_data.model_dump(exclude_unset=True)
    
    # Only allow updating role (is_superuser) and is_active
    if "is_active" in update_data:
        user.is_active = update_data["is_active"]
    
    # For role update, you might want to add a role field to UserUpdate
    # For now, we'll skip it as it's not in the schema
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a user"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    db.delete(user)
    db.commit()

# Coupon endpoints
@router.post("/coupons", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
def create_coupon(
    coupon_data: CouponCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new coupon"""
    # Check if code already exists
    existing = db.query(Coupon).filter(Coupon.code == coupon_data.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon code already exists"
        )
    
    coupon = Coupon(**coupon_data.model_dump())
    db.add(coupon)
    db.commit()
    db.refresh(coupon)
    return coupon

@router.get("/coupons", response_model=List[CouponResponse])
def get_coupons(
    page: int = Query(1, ge=1),
    per_page: int = Query(15, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get all coupons"""
    query = db.query(Coupon)
    
    if is_active is not None:
        query = query.filter(Coupon.is_active == is_active)
    
    query = query.order_by(Coupon.created_at.desc())
    
    offset = (page - 1) * per_page
    coupons = query.offset(offset).limit(per_page).all()
    
    return coupons

@router.put("/coupons/{coupon_id}", response_model=CouponResponse)
def update_coupon(
    coupon_id: int,
    coupon_data: CouponUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a coupon"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()
    
    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )
    
    update_data = coupon_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(coupon, field, value)
    
    db.commit()
    db.refresh(coupon)
    return coupon

@router.delete("/coupons/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coupon(
    coupon_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a coupon"""
    coupon = db.query(Coupon).filter(Coupon.id == coupon_id).first()

    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    db.delete(coupon)
    db.commit()

# Public coupon validation endpoint (no auth required)
@router.post("/coupons/validate", response_model=CouponValidateResponse)
def validate_coupon(
    validation_data: CouponValidateRequest,
    db: Session = Depends(get_db)
):
    """
    Validate a coupon code and calculate discount.
    This endpoint does NOT require authentication.
    """
    from datetime import datetime
    
    # Find coupon by code (case-insensitive)
    coupon = db.query(Coupon).filter(
        Coupon.code.ilike(validation_data.code.strip())
    ).first()
    
    # Check if coupon exists
    if not coupon:
        return CouponValidateResponse(
            valid=False,
            discount=0.0,
            message="Invalid coupon code"
        )
    
    # Check if coupon is active
    if not coupon.is_active:
        return CouponValidateResponse(
            valid=False,
            discount=0.0,
            message="This coupon has been deactivated"
        )
    
    # Check if coupon has started
    if coupon.starts_at and coupon.starts_at > datetime.utcnow():
        return CouponValidateResponse(
            valid=False,
            discount=0.0,
            message=f"This coupon starts on {coupon.starts_at.strftime('%Y-%m-%d')}"
        )
    
    # Check if coupon has expired
    if coupon.expires_at and coupon.expires_at < datetime.utcnow():
        return CouponValidateResponse(
            valid=False,
            discount=0.0,
            message=f"This coupon expired on {coupon.expires_at.strftime('%Y-%m-%d')}"
        )
    
    # Check usage limit
    if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
        return CouponValidateResponse(
            valid=False,
            discount=0.0,
            message="This coupon has reached its usage limit"
        )
    
    # Check minimum order amount
    if validation_data.order_total < coupon.min_order_amount:
        return CouponValidateResponse(
            valid=False,
            discount=0.0,
            message=f"Minimum order amount is ${coupon.min_order_amount:.2f}"
        )
    
    # Calculate discount
    if coupon.discount_type == "percentage":
        discount = validation_data.order_total * (coupon.discount_value / 100)
        # Apply max discount cap if set
        if coupon.max_discount_amount:
            discount = min(discount, coupon.max_discount_amount)
    else:  # fixed
        discount = coupon.discount_value
        # Don't allow discount to exceed order total
        discount = min(discount, validation_data.order_total)
    
    # Round to 2 decimal places
    discount = round(discount, 2)
    
    return CouponValidateResponse(
        valid=True,
        discount=discount,
        message=f"Coupon applied successfully! You save ${discount:.2f}"
    )
