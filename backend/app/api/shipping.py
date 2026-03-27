from fastapi import APIRouter, Depends, HTTPException, status, Query, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.database import get_db
from ..core.security import decode_token
from ..models import ShippingCompany, ShippingZone, ShippingRate, User, Order
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/shipping", tags=["Shipping"])


# ============ Schemas ============

class ShippingCompanyCreate(BaseModel):
    name: str
    code: str
    logo: Optional[str] = None
    tracking_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class ShippingCompanyUpdate(BaseModel):
    name: Optional[str] = None
    logo: Optional[str] = None
    tracking_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None


class ShippingCompanyResponse(BaseModel):
    id: int
    name: str
    code: str
    logo: Optional[str]
    tracking_url: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ShippingRateCalculate(BaseModel):
    city: str
    total_amount: float
    weight_kg: float = 1.0


class ShippingRateResponse(BaseModel):
    company_id: int
    company_name: str
    zone_name: str
    price: float
    estimated_days: str
    free_shipping: bool = False


# ============ Helper Functions ============

def get_current_admin_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Get current admin user"""
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
    
    if not user or not user.is_superuser:
        raise HTTPException(status_code=403, detail="Superuser access required")

    return user


# ============ Public Endpoints ============

@router.get("/companies", response_model=List[ShippingCompanyResponse])
def get_shipping_companies(
    db: Session = Depends(get_db)
):
    """
    Get all active shipping companies.
    Public endpoint.
    """
    companies = db.query(ShippingCompany).filter(ShippingCompany.is_active == True).all()
    return companies


@router.post("/calculate")
def calculate_shipping(
    data: ShippingRateCalculate,
    db: Session = Depends(get_db)
):
    """
    Calculate shipping rates for a given location and order.
    Public endpoint.
    """
    rates = []
    
    # Get all active companies with zones and rates
    companies = db.query(ShippingCompany).filter(
        ShippingCompany.is_active == True
    ).all()
    
    for company in companies:
        zones = db.query(ShippingZone).filter(
            ShippingZone.company_id == company.id,
            ShippingZone.is_active == True
        ).all()
        
        for zone in zones:
            # Check if city is in zone
            if data.city.lower() in [c.lower() for c in zone.cities] or not zone.cities:
                # Get applicable rate
                rate = db.query(ShippingRate).filter(
                    ShippingRate.zone_id == zone.id,
                    ShippingRate.is_active == True,
                    ShippingRate.weight_min <= data.weight_kg,
                    ShippingRate.weight_max >= data.weight_kg
                ).first()
                
                if rate:
                    free_shipping = False
                    if rate.free_shipping_above and data.total_amount >= rate.free_shipping_above:
                        free_shipping = True
                    
                    rates.append({
                        "company_id": company.id,
                        "company_name": company.name,
                        "zone_name": zone.name,
                        "price": 0 if free_shipping else rate.price,
                        "estimated_days": f"{zone.min_days}-{zone.max_days} days",
                        "free_shipping": free_shipping
                    })
    
    # Sort by price
    rates.sort(key=lambda x: x["price"])
    
    return {
        "rates": rates,
        "total": len(rates)
    }


@router.get("/track/{tracking_number}")
def track_shipment(
    tracking_number: str,
    company_code: str,
    db: Session = Depends(get_db)
):
    """
    Get tracking information for a shipment.
    Returns tracking URL.
    """
    company = db.query(ShippingCompany).filter(
        ShippingCompany.code == company_code
    ).first()
    
    if not company or not company.tracking_url:
        raise HTTPException(status_code=404, detail="Shipping company not found")
    
    tracking_url = company.tracking_url.replace("{tracking_number}", tracking_number)
    
    return {
        "company": company.name,
        "tracking_number": tracking_number,
        "tracking_url": tracking_url
    }


# ============ Admin Endpoints ============

@router.post("/companies", response_model=ShippingCompanyResponse)
def create_shipping_company(
    company_data: ShippingCompanyCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Create a new shipping company (Admin only).
    """
    # Check if code already exists
    existing = db.query(ShippingCompany).filter(
        ShippingCompany.code == company_data.code
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company code already exists")
    
    company = ShippingCompany(**company_data.dict())
    db.add(company)
    db.commit()
    db.refresh(company)
    
    return company


@router.put("/companies/{company_id}", response_model=ShippingCompanyResponse)
def update_shipping_company(
    company_id: int,
    company_data: ShippingCompanyUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update shipping company (Admin only).
    """
    company = db.query(ShippingCompany).filter(
        ShippingCompany.id == company_id
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    
    return company


@router.delete("/companies/{company_id}")
def delete_shipping_company(
    company_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Delete shipping company (Admin only).
    """
    company = db.query(ShippingCompany).filter(
        ShippingCompany.id == company_id
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db.delete(company)
    db.commit()
    
    return {"message": "Company deleted successfully"}


@router.get("/companies/{company_id}/zones")
def get_company_zones(
    company_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get all zones for a shipping company (Admin only).
    """
    company = db.query(ShippingCompany).filter(
        ShippingCompany.id == company_id
    ).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    zones = db.query(ShippingZone).filter(
        ShippingZone.company_id == company_id
    ).all()
    
    return {
        "company": company.name,
        "zones": zones,
        "total": len(zones)
    }
