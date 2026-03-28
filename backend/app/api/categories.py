from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..models import Category
from ..schemas import CategoryCreate, CategoryUpdate, CategoryResponse
import uuid
import os

# Disable Redis caching to prevent timeout issues
def cache(expire: int):
    def decorator(func):
        return func
    return decorator

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db)
):
    # Check if slug exists, if so generate unique slug
    slug = category_data.slug
    original_slug = slug
    counter = 1

    while db.query(Category).filter(Category.slug == slug).first():
        slug = f"{original_slug}-{uuid.uuid4().hex[:6]}"
        counter += 1
        if counter > 100:  # Safety limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not generate unique slug"
            )

    # Create category with unique slug
    category_dict = category_data.model_dump()
    category_dict['slug'] = slug

    category = Category(**category_dict)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

@router.get("/", response_model=List[CategoryResponse])
@cache(expire=600)  # Cache for 10 minutes
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.parent_id == None).all()
    return categories

@router.get("/all", response_model=List[CategoryResponse])
@cache(expire=3600)  # Cache for 1 hour
def get_all_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return categories

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: int,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    update_data = category_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    db.delete(category)
    db.commit()
