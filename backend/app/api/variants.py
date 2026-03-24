from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..models import Product
from ..schemas import ProductResponse, ProductUpdate
from ..core.security import decode_token
from ..models import User
from fastapi import Header

router = APIRouter(prefix="/variants", tags=["Product Variants"])


def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user from token (optional for public endpoints)"""
    if not authorization:
        return None
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer":
        return None
    
    payload = decode_token(token)
    if not payload:
        return None
    
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()
    return user


def get_current_admin_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current admin user - requires admin role"""
    user = get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/product/{product_id}")
def get_product_variants(product_id: int, db: Session = Depends(get_db)):
    """
    Get all variants for a specific product.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    variants = product.variants if product.variants else []
    
    return {
        "product_id": product_id,
        "product_name": product.name,
        "variants": variants,
        "total": len(variants)
    }


@router.post("/product/{product_id}")
def create_variant(
    product_id: int,
    variant_data: dict,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new variant for a product.
    Admin only endpoint.
    
    Variant data example:
    {
        "name": "Small / Red",
        "sku": "TSH-SM-RED",
        "price": 29.99,
        "compare_price": 39.99,
        "stock_quantity": 100,
        "attributes": {
            "size": "Small",
            "color": "Red"
        }
    }
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Initialize variants if empty
    if not product.variants:
        product.variants = []
    
    # Validate variant data
    required_fields = ["name"]
    for field in required_fields:
        if field not in variant_data:
            raise HTTPException(status_code=400, detail=f"Field '{field}' is required")
    
    # Add variant
    variant = {
        "id": len(product.variants) + 1,
        **variant_data
    }
    
    product.variants.append(variant)
    
    # Update product stock if variant stock provided
    if "stock_quantity" in variant_data:
        total_stock = sum(v.get("stock_quantity", 0) for v in product.variants)
        product.stock_quantity = total_stock
    
    db.commit()
    db.refresh(product)
    
    return {
        "message": "Variant created successfully",
        "variant": variant,
        "product": {
            "id": product.id,
            "name": product.name,
            "total_variants": len(product.variants)
        }
    }


@router.put("/product/{product_id}/{variant_id}")
def update_variant(
    product_id: int,
    variant_id: int,
    variant_data: dict,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update an existing variant.
    Admin only endpoint.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.variants:
        raise HTTPException(status_code=404, detail="No variants found for this product")
    
    # Find variant
    variant_index = None
    for i, v in enumerate(product.variants):
        if v.get("id") == variant_id:
            variant_index = i
            break
    
    if variant_index is None:
        raise HTTPException(status_code=404, detail=f"Variant {variant_id} not found")
    
    # Update variant
    product.variants[variant_index].update(variant_data)
    
    # Update product stock if variant stock changed
    if "stock_quantity" in variant_data:
        total_stock = sum(v.get("stock_quantity", 0) for v in product.variants)
        product.stock_quantity = total_stock
    
    db.commit()
    db.refresh(product)
    
    return {
        "message": "Variant updated successfully",
        "variant": product.variants[variant_index],
        "product": {
            "id": product.id,
            "name": product.name,
            "total_variants": len(product.variants)
        }
    }


@router.delete("/product/{product_id}/{variant_id}")
def delete_variant(
    product_id: int,
    variant_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete a variant from a product.
    Admin only endpoint.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.variants:
        raise HTTPException(status_code=404, detail="No variants found for this product")
    
    # Find and remove variant
    variant_index = None
    for i, v in enumerate(product.variants):
        if v.get("id") == variant_id:
            variant_index = i
            break
    
    if variant_index is None:
        raise HTTPException(status_code=404, detail=f"Variant {variant_id} not found")
    
    deleted_variant = product.variants.pop(variant_index)
    
    # Update product stock
    total_stock = sum(v.get("stock_quantity", 0) for v in product.variants) if product.variants else 0
    product.stock_quantity = total_stock
    
    db.commit()
    db.refresh(product)
    
    return {
        "message": "Variant deleted successfully",
        "deleted_variant": deleted_variant,
        "product": {
            "id": product.id,
            "name": product.name,
            "total_variants": len(product.variants)
        }
    }


@router.post("/product/{product_id}/bulk")
def create_bulk_variants(
    product_id: int,
    variants_data: List[dict],
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create multiple variants at once.
    Admin only endpoint.
    
    Example:
    [
        {"name": "Small / Red", "sku": "TSH-SM-RED", "price": 29.99, "stock": 50},
        {"name": "Medium / Red", "sku": "TSH-MD-RED", "price": 29.99, "stock": 100},
        {"name": "Large / Red", "sku": "TSH-LG-RED", "price": 29.99, "stock": 75}
    ]
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.variants:
        product.variants = []
    
    # Get current max ID
    current_ids = [v.get("id", 0) for v in product.variants]
    next_id = max(current_ids) + 1 if current_ids else 1
    
    created_variants = []
    for variant_data in variants_data:
        if "name" not in variant_data:
            continue  # Skip invalid variants
        
        variant = {
            "id": next_id,
            **variant_data
        }
        product.variants.append(variant)
        created_variants.append(variant)
        next_id += 1
    
    # Update product stock
    total_stock = sum(v.get("stock_quantity", 0) for v in product.variants)
    product.stock_quantity = total_stock
    
    db.commit()
    db.refresh(product)
    
    return {
        "message": f"{len(created_variants)} variants created successfully",
        "variants": created_variants,
        "product": {
            "id": product.id,
            "name": product.name,
            "total_variants": len(product.variants)
        }
    }


@router.get("/product/{product_id}/variant/{variant_id}")
def get_variant(
    product_id: int,
    variant_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific variant by ID.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if not product.variants:
        raise HTTPException(status_code=404, detail="No variants found")
    
    # Find variant
    for variant in product.variants:
        if variant.get("id") == variant_id:
            return {
                "product_id": product_id,
                "variant": variant
            }
    
    raise HTTPException(status_code=404, detail=f"Variant {variant_id} not found")
