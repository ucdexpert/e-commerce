from pydantic import BaseModel
from typing import Optional


# ============ Address Schemas ============
class AddressBase(BaseModel):
    first_name: str
    last_name: str
    company: Optional[str] = None
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    postal_code: str
    country: str
    phone: str
    is_default: bool = False
    address_type: str = "shipping"


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
