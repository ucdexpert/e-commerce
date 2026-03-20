from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_
from typing import List, Optional
from ..core.database import get_db
from ..core.security import get_current_user
from ..models import Product, Category, Review, User
from ..schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    CategoryResponse,
)
from datetime import datetime
from ..utils.cloudinary import upload_base64_image
from .admin import get_current_admin_user
import uuid
import re

router = APIRouter(prefix="/products", tags=["Products"])

def generate_sku(name: str) -> str:
    """Generate unique SKU from product name + random UUID"""
    clean_name = re.sub(r'[^a-zA-Z0-9]', '', name)[:6].upper()
    random_part = str(uuid.uuid4())[:8].upper()
    return f"{clean_name}-{random_part}"

def get_product_by_id(product_id: int, db: Session):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return product

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    # Check if slug exists
    existing = db.query(Product).filter(Product.slug == product_data.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this slug already exists"
        )

    # If SKU is empty or whitespace, generate a unique one
    if not product_data.sku or product_data.sku.strip() == '':
        product_data.sku = generate_sku(product_data.name)
    
    # Check if generated SKU already exists, if so generate another
    existing_sku = db.query(Product).filter(Product.sku == product_data.sku).first()
    if existing_sku:
        product_data.sku = generate_sku(product_data.name)

    # Process images - upload base64 images to Cloudinary
    processed_images = []
    if product_data.images:
        for img in product_data.images:
            if img and img.startswith("data:image"):
                # Upload base64 image to Cloudinary
                try:
                    url = upload_base64_image(img)
                    processed_images.append(url)
                except Exception as e:
                    print(f"Failed to upload image: {e}")
                    # Skip failed uploads or raise error
                    continue
            elif img:
                # Already a URL, use as-is
                processed_images.append(img)

    # Create product with processed image URLs
    product_dict = product_data.model_dump(exclude=['category_ids', 'images'])
    product_dict['images'] = processed_images

    product = Product(**product_dict)
    db.add(product)
    db.commit()
    db.refresh(product)

    # Add categories
    if product_data.category_ids:
        categories = db.query(Category).filter(
            Category.id.in_(product_data.category_ids)
        ).all()
        product.categories = categories
        db.commit()
        db.refresh(product)
    else:
        product.categories = []

    return product

@router.get("/", response_model=ProductListResponse)
def get_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    is_featured: Optional[bool] = None,
    is_on_sale: Optional[bool] = None,
    sort_by: str = Query("created_at", regex="^(created_at|price|rating|sold_count|name)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    db: Session = Depends(get_db)
):
    # Use eager loading to prevent N+1 queries
    query = db.query(Product).options(
        joinedload(Product.categories)
    ).filter(Product.is_active == True)

    # Search
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%"),
            Product.sku.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    # Category filter
    if category_id:
        query = query.filter(Product.categories.any(Category.id == category_id))
    
    # Price filter
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Featured filter
    if is_featured is not None:
        query = query.filter(Product.is_featured == is_featured)
    
    # On sale filter
    if is_on_sale is not None:
        query = query.filter(Product.is_on_sale == is_on_sale)
    
    # Sorting
    sort_column = getattr(Product, sort_by)
    if sort_order == "desc":
        sort_column = sort_column.desc()
    else:
        sort_column = sort_column.asc()
    
    query = query.order_by(sort_column)
    
    # Pagination
    total = query.count()
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    
    return ProductListResponse(
        products=products,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page
    )

@router.get("/search", response_model=ProductListResponse)
def search_products(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(
        Product.is_active == True,
        or_(
            Product.name.ilike(f"%{q}%"),
            Product.description.ilike(f"%{q}%"),
            Product.short_description.ilike(f"%{q}%"),
            Product.sku.ilike(f"%{q}%")
        )
    )
    
    total = query.count()
    offset = (page - 1) * per_page
    products = query.offset(offset).limit(per_page).all()
    
    return ProductListResponse(
        products=products,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=(total + per_page - 1) // per_page
    )

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    product = get_product_by_id(product_id, db)
    
    # Increment view count
    product.view_count += 1
    db.commit()
    
    return product

@router.get("/slug/{slug}", response_model=ProductResponse)
def get_product_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    # Use eager loading for related data
    product = db.query(Product).options(
        joinedload(Product.categories)
    ).filter(Product.slug == slug).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Increment view count
    product.view_count += 1
    db.commit()

    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):
    product = get_product_by_id(product_id, db)

    update_data = product_data.model_dump(exclude_unset=True)
    
    # Process images if provided
    if 'images' in update_data and update_data['images']:
        processed_images = []
        for img in update_data['images']:
            if img and img.startswith("data:image"):
                # Upload base64 image to Cloudinary
                try:
                    url = upload_base64_image(img)
                    processed_images.append(url)
                except Exception as e:
                    print(f"Failed to upload image: {e}")
                    continue
            elif img:
                # Already a URL, use as-is
                processed_images.append(img)
        update_data['images'] = processed_images
    
    # Update product fields
    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    product = get_product_by_id(product_id, db)
    
    # Step 1: Delete cart items with this product
    from app.models.cart import CartItem
    db.query(CartItem).filter(
        CartItem.product_id == product_id
    ).delete()
    
    # Step 2: Delete wishlist items with this product
    from app.models.wishlist import WishlistItem
    db.query(WishlistItem).filter(
        WishlistItem.product_id == product_id
    ).delete()
    
    # Step 3: Delete reviews
    from app.models.review import Review
    db.query(Review).filter(
        Review.product_id == product_id
    ).delete()
    
    # Step 4: Now safe to delete product
    db.delete(product)
    db.commit()

@router.get("/{product_id}/related", response_model=ProductListResponse)
def get_related_products(
    product_id: int,
    limit: int = Query(4, ge=1, le=20),
    db: Session = Depends(get_db)
):
    product = get_product_by_id(product_id, db)

    # Get category IDs
    category_ids = [cat.id for cat in product.categories]

    if not category_ids:
        return ProductListResponse(
            products=[],
            total=0,
            page=1,
            per_page=limit,
            total_pages=0
        )

    # Find related products in same categories with eager loading
    related = db.query(Product).options(
        joinedload(Product.categories)
    ).filter(
        Product.id != product_id,
        Product.is_active == True,
        Product.categories.any(Category.id.in_(category_ids))
    ).limit(limit).all()

    return ProductListResponse(
        products=related,
        total=len(related),
        page=1,
        per_page=limit,
        total_pages=1
    )

@router.get("/{product_id}/reviews")
async def get_product_reviews(
    product_id: int,
    db: Session = Depends(get_db)
):
    """Get all reviews for a product"""
    product = get_product_by_id(product_id, db)
    
    reviews = db.query(Review).filter(
        Review.product_id == product_id,
        Review.is_approved == True
    ).order_by(Review.created_at.desc()).all()
    
    total = len(reviews)
    avg_rating = sum(r.rating for r in reviews) / total if total > 0 else 0
    
    return {
        "reviews": reviews,
        "total": total,
        "average_rating": round(avg_rating, 1)
    }

@router.post("/{product_id}/reviews")
def add_review(
    product_id: int,
    rating: int = Query(..., ge=1, le=5),
    comment: Optional[str] = None,
    title: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a review to a product"""
    product = get_product_by_id(product_id, db)

    # Check if user already reviewed this product
    existing = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aap pehle hi review de chuke hain. Ek se zyada reviews allow nahi hain."
        )

    # Create review with authenticated user
    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=rating,
        title=title,
        comment=comment,
        is_approved=True  # Auto-approve for demo
    )
    db.add(review)

    # Update product rating - fetch ALL reviews including the new one
    total_rating = db.query(Review).filter(
        Review.product_id == product_id,
        Review.is_approved == True
    ).all()

    # Avoid division by zero
    if len(total_rating) > 0:
        product.rating = sum(r.rating for r in total_rating) / len(total_rating)
    else:
        product.rating = 0.0

    # Update review count
    product.review_count = len(total_rating)

    db.commit()
    db.refresh(product)

    return {"message": "Review added successfully", "product": product}
