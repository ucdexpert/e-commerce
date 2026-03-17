from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from ..core.database import get_db
from ..models import Product, Category
from ..schemas import SearchResponse, ProductResponse, CategoryResponse

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/", response_model=SearchResponse)
def search(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    # Search products
    products = db.query(Product).filter(
        Product.is_active == True,
        or_(
            Product.name.ilike(f"%{q}%"),
            Product.description.ilike(f"%{q}%"),
            Product.short_description.ilike(f"%{q}%"),
            Product.sku.ilike(f"%{q}%")
        )
    ).limit(limit).all()
    
    # Search categories
    categories = db.query(Category).filter(
        or_(
            Category.name.ilike(f"%{q}%"),
            Category.description.ilike(f"%{q}%")
        )
    ).limit(limit).all()
    
    return SearchResponse(
        products=products,
        categories=categories,
        total_results=len(products) + len(categories)
    )

@router.get("/suggestions")
def search_suggestions(
    q: str = Query(..., min_length=1),
    limit: int = Query(6, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get search suggestions for autocomplete with product details"""
    products = db.query(
        Product.id,
        Product.name,
        Product.slug,
        Product.price,
        Product.images
    ).filter(
        Product.is_active == True,
        or_(
            Product.name.ilike(f"%{q}%"),
            Product.description.ilike(f"%{q}%")
        )
    ).order_by(Product.rating.desc(), Product.sold_count.desc())\
     .limit(limit).all()

    suggestions = [
        {
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "price": p.price,
            "images": p.images if isinstance(p.images, list) else []
        }
        for p in products
    ]
    
    return {"suggestions": suggestions}
