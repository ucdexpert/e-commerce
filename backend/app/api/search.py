from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from ..core.database import get_db
from ..models import Product, Category
from ..schemas import SearchResponse, ProductResponse, CategoryResponse

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/", response_model=SearchResponse)
async def search_products(
    q: Optional[str] = Query(None, min_length=1, description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(12, ge=1, le=50, description="Items per page"),
    db: Session = Depends(get_db)
):
    """Search products with pagination"""
    if not q:
        return SearchResponse(products=[], categories=[], total_results=0)
    
    try:
        # Search products
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
        products = query.offset(
            (page - 1) * per_page
        ).limit(per_page).all()

        # Search categories
        categories = db.query(Category).filter(
            or_(
                Category.name.ilike(f"%{q}%"),
                Category.description.ilike(f"%{q}%")
            )
        ).limit(10).all()

        return SearchResponse(
            products=products,
            categories=categories,
            total_results=total
        )
    except Exception as e:
        print(f"Search error: {e}")
        return SearchResponse(products=[], categories=[], total_results=0)

@router.get("/suggestions")
async def search_suggestions(
    q: str = Query("", min_length=1),
    limit: int = Query(6, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get search suggestions for autocomplete with product details"""
    if not q or len(q) < 2:
        return {"suggestions": []}
    
    try:
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
                "image": p.images[0] if p.images and len(p.images) > 0 else None
            }
            for p in products
        ]

        return {"suggestions": suggestions}
    except Exception as e:
        print(f"Search suggestions error: {e}")
        return {"suggestions": []}
