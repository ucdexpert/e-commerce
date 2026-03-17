from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.security import decode_token
from ..models import Address, User
from ..schemas import AddressCreate, AddressUpdate, AddressResponse

router = APIRouter(prefix="/addresses", tags=["Addresses"])

def get_current_user_id(authorization: Optional[str] = Header(None)) -> int:
    """Get current user ID from JWT token"""
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
        return int(payload.get("sub"))
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

def get_address_by_id(address_id: int, db: Session, user_id: int) -> Address:
    address = db.query(Address).filter(
        Address.id == address_id,
        Address.user_id == user_id
    ).first()
    if not address:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Address not found"
        )
    return address

@router.post("/", response_model=AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    address_data: AddressCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    # If this is set as default, unset other defaults
    if address_data.is_default:
        db.query(Address).filter(
            Address.user_id == current_user_id,
            Address.is_default == True
        ).update({"is_default": False})

    address = Address(**address_data.model_dump(), user_id=current_user_id)
    db.add(address)
    db.commit()
    db.refresh(address)
    return address

@router.get("/", response_model=List[AddressResponse])
def get_addresses(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    addresses = db.query(Address).filter(
        Address.user_id == current_user_id
    ).order_by(Address.is_default.desc()).all()
    return addresses

@router.get("/{address_id}", response_model=AddressResponse)
def get_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    address = get_address_by_id(address_id, db, current_user_id)
    return address

@router.put("/{address_id}", response_model=AddressResponse)
def update_address(
    address_id: int,
    address_data: AddressUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    address = get_address_by_id(address_id, db, current_user_id)

    update_data = address_data.model_dump(exclude_unset=True)

    # If setting as default, unset other defaults
    if update_data.get("is_default"):
        db.query(Address).filter(
            Address.user_id == current_user_id,
            Address.id != address_id,
            Address.is_default == True
        ).update({"is_default": False})

    for field, value in update_data.items():
        setattr(address, field, value)

    db.commit()
    db.refresh(address)
    return address

@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    address = get_address_by_id(address_id, db, current_user_id)
    db.delete(address)
    db.commit()

@router.post("/{address_id}/set-default", response_model=AddressResponse)
def set_default_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user_id)
):
    address = get_address_by_id(address_id, db, current_user_id)

    # Unset other defaults
    db.query(Address).filter(
        Address.user_id == current_user_id,
        Address.id != address_id,
        Address.is_default == True
    ).update({"is_default": False})

    address.is_default = True
    db.commit()
    db.refresh(address)
    return address
