from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..core.database import get_db
from ..core.security import decode_token, get_current_user
from ..models import Order, OrderItem, Cart, CartItem, Product, InventoryLog, Address, User
from ..schemas import (
    OrderCreate,
    OrderResponse,
    OrderUpdate,
    OrderListResponse,
    OrderItemResponse,
)
from ..utils.email import send_order_confirmation_email
import random
import string

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_order_number() -> str:
    """Generate unique order number"""
    timestamp = ''.join(random.choices(string.digits, k=8))
    return f"ORD-{timestamp}"

def get_order_by_id(order_id: int, db: Session) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    return order

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    # Get current user from JWT token
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
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
            detail="Invalid or expired token"
        )
    
    try:
        current_user_id = int(payload.get("sub"))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Get user's cart
    cart = db.query(Cart).filter(Cart.user_id == current_user_id).first()

    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )

    # FIX: Validate stock availability BEFORE creating order
    # Use with_for_update() to lock rows and prevent race conditions
    for item in cart.items:
        product = db.query(Product).filter(
            Product.id == item.product_id
        ).with_for_update().first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )
        
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for '{product.name}'. "
                    f"Available: {product.stock_quantity}, "
                    f"Requested: {item.quantity}"
                )
            )

    # Calculate totals
    subtotal = sum(item.product.price * item.quantity for item in cart.items)
    tax = subtotal * 0.1  # 10% tax
    shipping_cost = 10 if subtotal < 100 else 0  # Free shipping over $100
    discount = 0
    total = subtotal + tax + shipping_cost - discount

    # Create order
    order = Order(
        order_number=generate_order_number(),
        user_id=current_user_id,
        status="pending",
        payment_status="pending",
        payment_method=order_data.payment_method,
        subtotal=subtotal,
        tax=tax,
        shipping_cost=shipping_cost,
        discount=discount,
        total=total,
        shipping_address_id=order_data.shipping_address_id,
        billing_address_id=order_data.billing_address_id or order_data.shipping_address_id,
        notes=order_data.notes
    )
    db.add(order)
    db.flush()  # Get order ID

    # Create order items and deduct stock
    for cart_item in cart.items:
        order_item = OrderItem(
            order_id=order.id,
            product_id=cart_item.product_id,
            quantity=cart_item.quantity,
            price=cart_item.product.price,
            variant=cart_item.variant,
            subtotal=cart_item.product.price * cart_item.quantity
        )
        db.add(order_item)

        # FIX: Deduct stock after order is created
        cart_item.product.stock_quantity -= cart_item.quantity
        cart_item.product.sold_count += cart_item.quantity

        # Create inventory log
        inventory_log = InventoryLog(
            product_id=cart_item.product_id,
            quantity_change=-cart_item.quantity,
            reason="sale",
            reference_type="order",
            reference_id=order.id,
            notes=f"Order {order.order_number}"
        )
        db.add(inventory_log)

    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

    try:
        db.commit()
        db.refresh(order)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order. Please try again."
        )

    # Send order confirmation email
    try:
        user = db.query(User).filter(User.id == current_user_id).first()
        if user and user.email:
            items_data = [
                {"name": item.product.name, "quantity": item.quantity, "price": item.price}
                for item in order.items
            ]
            send_order_confirmation_email(
                email=user.email,
                order_number=order.order_number,
                total=order.total,
                items=items_data
            )
    except Exception as e:
        print(f"Failed to send order confirmation email: {e}")
        # Don't fail order creation if email fails

    return order

@router.get("/", response_model=OrderListResponse)
def get_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Order).filter(Order.user_id == current_user.id)

    if status_filter:
        query = query.filter(Order.status == status_filter)

    query = query.order_by(Order.created_at.desc())

    total = query.count()
    offset = (page - 1) * per_page
    orders = query.offset(offset).limit(per_page).all()

    return OrderListResponse(
        orders=orders,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page
    )

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = get_order_by_id(order_id, db)

    # Check ownership
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order"
        )

    return order

@router.put("/{order_id}", response_model=OrderResponse)
def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: Session = Depends(get_db)
):
    order = get_order_by_id(order_id, db)
    
    update_data = order_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(order, field, value)
    
    db.commit()
    db.refresh(order)
    return order

@router.post("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(
    order_id: int,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = get_order_by_id(order_id, db)

    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this order"
        )

    if order.status in ["delivered", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status: {order.status}"
        )

    order.status = "cancelled"
    order.cancelled_at = func.now()
    order.notes = f"Cancelled: {reason}" if reason else order.notes

    # Restore stock
    for item in order.items:
        item.product.stock_quantity += item.quantity
        item.product.sold_count -= item.quantity

        # Create inventory log
        inventory_log = InventoryLog(
            product_id=item.product_id,
            quantity_change=item.quantity,
            reason="return",
            reference_type="order",
            reference_id=order.id,
            notes=f"Order cancelled: {order.order_number}"
        )
        db.add(inventory_log)

    db.commit()
    db.refresh(order)
    return order

@router.get("/{order_id}/invoice")
async def get_order_invoice(
    order_id: int,
    db: Session = Depends(get_db)
):
    """Generate and download PDF invoice for order"""
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    from io import BytesIO
    from fastapi.responses import StreamingResponse
    
    order = get_order_by_id(order_id, db)
    
    # Get user email for invoice
    from ..models import User
    user = db.query(User).filter(User.id == order.user_id).first()
    
    # Get shipping address
    from ..models import Address
    shipping_address = db.query(Address).filter(Address.id == order.shipping_address_id).first()
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=0.75*inch, leftMargin=0.75*inch, topMargin=0.75*inch, bottomMargin=0.75*inch)
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2563EB'),
        spaceAfter=30,
        alignment=1  # Center
    )
    
    # Title
    elements.append(Paragraph("INVOICE", title_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Order info
    order_info_style = ParagraphStyle(
        'OrderInfo',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
    )
    elements.append(Paragraph(f"<b>Order Number:</b> #{order.order_number}", order_info_style))
    elements.append(Paragraph(f"<b>Order Date:</b> {order.created_at.strftime('%B %d, %Y')}", order_info_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # Customer & Shipping info table
    customer_data = [
        ["Bill To:", "Ship To:"],
        [user.email if user else "N/A", shipping_address.first_name + " " + shipping_address.last_name if shipping_address else "N/A"],
        ["", shipping_address.address_line1 if shipping_address else ""],
        ["", shipping_address.city if shipping_address else ""],
        ["", f"{shipping_address.state} {shipping_address.postal_code}" if shipping_address else ""],
        ["", shipping_address.country if shipping_address else ""],
    ]
    
    t_customer = Table(customer_data, colWidths=[3*inch, 3*inch])
    t_customer.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#F3F4F6')),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#F3F4F6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1F2937')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(t_customer)
    elements.append(Spacer(1, 0.3*inch))
    
    # Items table header
    items_data = [
        ["Product", "Qty", "Price", "Subtotal"]
    ]
    
    # Order items
    for item in order.items:
        items_data.append([
            item.product.name[:40] + "..." if len(item.product.name) > 40 else item.product.name,
            str(item.quantity),
            f"${item.price:.2f}",
            f"${item.subtotal:.2f}"
        ])
    
    # Totals
    items_data.append(["", "", "Subtotal:", f"${order.subtotal:.2f}"])
    items_data.append(["", "", f"Tax ({order.tax/order.subtotal*100 if order.subtotal > 0 else 0:.1f}%):", f"${order.tax:.2f}"])
    items_data.append(["", "", "Shipping:", f"${order.shipping_cost:.2f}"])
    if order.discount > 0:
        items_data.append(["", "", "Discount:", f"-${order.discount:.2f}"])
    items_data.append(["", "", "TOTAL:", f"${order.total:.2f}"])
    
    # Items table styling
    t_items = Table(items_data, colWidths=[3.5*inch, 0.8*inch, 1*inch, 1.2*inch])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563EB')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, -4), (-1, -1), 10),
        ('FONTNAME', (2, -4), (-1, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (2, -1), (-1, -1), colors.HexColor('#DCFCE7')),
        ('TEXTCOLOR', (2, -1), (-1, -1), colors.HexColor('#166534')),
        ('FONTSIZE', (2, -1), (-1, -1), 12),
        ('BOTTOMPADDING', (2, -1), (-1, -1), 12),
    ]))
    elements.append(t_items)
    elements.append(Spacer(1, 0.5*inch))
    
    # Footer
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.grey,
        alignment=1
    )
    elements.append(Paragraph("Thank you for your business!", footer_style))
    elements.append(Paragraph("E-Shop | support@eshop.com | +1 (555) 123-4567", footer_style))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=invoice-{order.order_number}.pdf"}
    )

@router.post("/{order_id}/complete-payment")
def complete_payment(
    order_id: int,
    payment_intent_id: str,
    db: Session = Depends(get_db)
):
    """Complete payment for order (called after Stripe webhook)"""
    order = get_order_by_id(order_id, db)

    order.payment_status = "paid"
    order.payment_intent_id = payment_intent_id
    order.status = "processing"

    db.commit()
    db.refresh(order)

    return {"message": "Payment completed", "order": order}


@router.post("/{order_id}/return-request")
async def create_return_request(
    order_id: int,
    return_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a return request for an order.
    """
    order = get_order_by_id(order_id, db)

    # Check if order belongs to user
    if order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to return this order"
        )

    # Check if order is delivered
    if order.status != 'delivered':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only delivered orders can be returned"
        )

    # Check if within 30 days
    from datetime import datetime
    days_since_delivery = (datetime.utcnow() - order.updated_at).days
    if days_since_delivery > 30:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return period (30 days) has expired"
        )

    # Update order status
    order.status = 'return_requested'
    db.commit()

    # Get user email
    user = db.query(User).filter(User.id == current_user.id).first()

    # Log return request (in production, send email to admin)
    print(f"Return request for order #{order.order_number}:")
    print(f"Reason: {return_data.get('reason')}")
    print(f"Description: {return_data.get('description')}")

    return {
        "message": "Return request submitted successfully. We'll send you a prepaid return label via email.",
        "order_id": order_id
    }
