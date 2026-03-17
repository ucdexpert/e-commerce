from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.security import decode_token
from ..models import Cart, CartItem, Product, User
from ..schemas import (
    CartResponse,
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
)

router = APIRouter(prefix="/cart", tags=["Cart"])

def get_current_user_id(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[int]:
    """Get current user ID from token, return None if not authenticated"""
    if not authorization:
        return None
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None
    
    payload = decode_token(token)
    if not payload:
        return None
    
    try:
        return int(payload.get("sub"))
    except (ValueError, TypeError):
        return None

def get_user_cart(db: Session, user_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def calculate_cart_totals(cart: Cart) -> tuple:
    subtotal = 0
    for item in cart.items:
        subtotal += item.product.price * item.quantity
    return subtotal, subtotal  # In real app, add tax and shipping calculations

@router.get("/", response_model=CartResponse)
def get_cart(
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    cart = get_user_cart(db, current_user_id)
    subtotal, total = calculate_cart_totals(cart)

    return CartResponse(
        id=cart.id,
        user_id=cart.user_id,
        items=[CartItemResponse(
            id=item.id,
            product_id=item.product_id,
            quantity=item.quantity,
            variant=item.variant,
            product=item.product
        ) for item in cart.items],
        subtotal=subtotal,
        total=total
    )

@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    item_data: CartItemCreate,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    cart = get_user_cart(db, current_user_id)
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available"
        )
    
    # Check stock
    if product.stock_quantity < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )
    
    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_data.product_id,
        CartItem.variant == item_data.variant
    ).first()
    
    if existing_item:
        # Update quantity
        existing_item.quantity += item_data.quantity
        if existing_item.quantity > product.stock_quantity:
            existing_item.quantity = product.stock_quantity
        db.commit()
        db.refresh(existing_item)
        item = existing_item
    else:
        # Create new cart item
        item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            variant=item_data.variant
        )
        db.add(item)
        db.commit()
        db.refresh(item)
    
    return CartItemResponse(
        id=item.id,
        product_id=item.product_id,
        quantity=item.quantity,
        variant=item.variant,
        product=item.product
    )

@router.put("/items/{item_id}", response_model=CartItemResponse)
def update_cart_item(
    item_id: int,
    item_data: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    cart = get_user_cart(db, current_user_id)

    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    # Check stock
    if item.product.stock_quantity < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )

    item.quantity = item_data.quantity
    db.commit()
    db.refresh(item)

    return CartItemResponse(
        id=item.id,
        product_id=item.product_id,
        quantity=item.quantity,
        variant=item.variant,
        product=item.product
    )

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    cart = get_user_cart(db, current_user_id)

    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    db.delete(item)
    db.commit()

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    cart = get_user_cart(db, current_user_id)

    # Delete all cart items
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()

@router.post("/merge")
def merge_guest_cart(
    guest_cart_id: int,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    """Merge guest cart into user cart when user logs in"""
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    user_cart = get_user_cart(db, current_user_id)
    guest_cart = db.query(Cart).filter(Cart.id == guest_cart_id).first()

    if not guest_cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest cart not found"
        )

    # Move items from guest cart to user cart
    for guest_item in guest_cart.items:
        existing_item = db.query(CartItem).filter(
            CartItem.cart_id == user_cart.id,
            CartItem.product_id == guest_item.product_id,
            CartItem.variant == guest_item.variant
        ).first()

        if existing_item:
            existing_item.quantity += guest_item.quantity
        else:
            new_item = CartItem(
                cart_id=user_cart.id,
                product_id=guest_item.product_id,
                quantity=guest_item.quantity,
                variant=guest_item.variant
            )
            db.add(new_item)

    # Delete guest cart
    db.delete(guest_cart)
    db.commit()

    return {"message": "Cart merged successfully"}
