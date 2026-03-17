from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.security import decode_token
from ..models import Wishlist, WishlistItem, Product
from ..schemas import WishlistResponse, WishlistItemResponse

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

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

def get_user_wishlist(db: Session, user_id: int) -> Wishlist:
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
    if not wishlist:
        wishlist = Wishlist(user_id=user_id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)
    return wishlist

@router.get("/", response_model=WishlistResponse)
def get_wishlist(
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    wishlist = get_user_wishlist(db, current_user_id)
    return wishlist

@router.post("/items/{product_id}", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    wishlist = get_user_wishlist(db, current_user_id)
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if already in wishlist
    existing = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.product_id == product_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already in wishlist"
        )
    
    item = WishlistItem(wishlist_id=wishlist.id, product_id=product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return WishlistItemResponse(
        id=item.id,
        product_id=item.product_id,
        created_at=item.created_at,
        product=item.product
    )

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    item_id: int,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    wishlist = get_user_wishlist(db, current_user_id)

    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.wishlist_id == wishlist.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )

    db.delete(item)
    db.commit()

@router.post("/move-to-cart/{item_id}")
def move_to_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user_id: Optional[int] = Depends(get_current_user_id)
):
    """Move wishlist item to cart"""
    from ..models import Cart, CartItem
    
    if not current_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    wishlist = get_user_wishlist(db, current_user_id)
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.wishlist_id == wishlist.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found"
        )

    # Get or create user cart
    cart = db.query(Cart).filter(Cart.user_id == current_user_id).first()
    if not cart:
        cart = Cart(user_id=current_user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Add to cart
    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item.product_id
    ).first()

    if cart_item:
        cart_item.quantity += 1
    else:
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item.product_id,
            quantity=1
        )
        db.add(cart_item)

    # Remove from wishlist
    db.delete(item)
    db.commit()

    return {"message": "Moved to cart successfully"}
