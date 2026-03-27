from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.security import decode_token, get_password_hash
from ..models import User
from pydantic import BaseModel, EmailStr
from datetime import datetime

router = APIRouter(prefix="/roles", tags=["Roles & Permissions"])


# ============ Schemas ============

class PermissionCreate(BaseModel):
    name: str
    description: str = ""


class UserCreateSchema(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str = ""
    is_superuser: bool = False


class UserUpdateSchema(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    is_superuser: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    phone: Optional[str]
    avatar: Optional[str]
    is_active: bool
    is_verified: bool
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============ Dependencies ============

def get_current_superuser(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current superuser - requires superuser role"""
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
    
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser access required")
    
    return user


def get_current_admin(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current admin or superuser - simplified to just superuser"""
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
    
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser access required")
    
    return user


# ============ Predefined Permissions ============

PREDEFINED_PERMISSIONS = [
    {"name": "products.view", "description": "View products"},
    {"name": "products.create", "description": "Create new products"},
    {"name": "products.edit", "description": "Edit existing products"},
    {"name": "products.delete", "description": "Delete products"},
    {"name": "orders.view", "description": "View orders"},
    {"name": "orders.edit", "description": "Edit orders"},
    {"name": "orders.cancel", "description": "Cancel orders"},
    {"name": "orders.refund", "description": "Process refunds"},
    {"name": "users.view", "description": "View users"},
    {"name": "users.edit", "description": "Edit users"},
    {"name": "users.delete", "description": "Delete users"},
    {"name": "categories.manage", "description": "Manage categories"},
    {"name": "coupons.manage", "description": "Manage coupons"},
    {"name": "reviews.moderate", "description": "Moderate reviews"},
    {"name": "returns.manage", "description": "Manage returns"},
    {"name": "analytics.view", "description": "View analytics"},
]


# ============ Endpoints ============

@router.get("/permissions")
def get_available_permissions():
    """
    Get list of all available permissions.
    Public endpoint - anyone can see available permissions.
    """
    return {
        "permissions": PREDEFINED_PERMISSIONS,
        "total": len(PREDEFINED_PERMISSIONS)
    }


@router.get("/users", response_model=List[UserResponse])
def get_all_users(
    role_filter: Optional[str] = Query(None, alias="role"),
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get all users (Superuser only).
    Optional role filter: superuser, customer
    """
    query = db.query(User)
    
    if role_filter == "superuser":
        query = query.filter(User.is_superuser == True)
    elif role_filter == "customer":
        query = query.filter(User.is_superuser == False)
    
    users = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get user by ID (Superuser only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_with_role(
    user_data: UserCreateSchema,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Create a new user with specific role (Superuser only).
    """
    # Check if email already exists
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if username already exists
    existing = db.query(User).filter(User.username == user_data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    # Create user
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        is_superuser=user_data.is_superuser,
        is_verified=True
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdateSchema,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Update user details (Superuser only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.phone is not None:
        user.phone = user_data.phone
    if user_data.is_superuser is not None:
        user.is_superuser = user_data.is_superuser
    
    db.commit()
    db.refresh(user)
    
    return user


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Delete a user (Superuser only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully"}


@router.post("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Activate a user account (Superuser only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    
    return {"message": "User activated successfully"}


@router.post("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Deactivate a user account (Superuser only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deactivating yourself
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}


@router.get("/me/permissions")
def get_my_permissions(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get current user's permissions.
    """
    # Superusers have all permissions
    if current_user.is_superuser:
        return {
            "permissions": [p["name"] for p in PREDEFINED_PERMISSIONS],
            "is_superuser": True,
            "has_all_permissions": True
        }
    
    # Regular users have no special permissions
    return {
        "permissions": [],
        "is_superuser": False,
        "has_all_permissions": False
    }


@router.get("/stats")
def get_role_statistics(
    current_user: User = Depends(get_current_superuser),
    db: Session = Depends(get_db)
):
    """
    Get statistics about user roles (Superuser only).
    """
    total_users = db.query(User).count()
    superuser_count = db.query(User).filter(User.is_superuser == True).count()
    
    # Regular customers
    customer_count = db.query(User).filter(User.is_superuser == False).count()
    
    return {
        "total_users": total_users,
        "roles": {
            "superusers": superuser_count,
            "customers": customer_count
        }
    }
