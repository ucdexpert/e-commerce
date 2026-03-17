from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from .product import ProductResponse


# ============ Cart Schemas ============
class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1
    variant: Optional[Dict[str, Any]] = None


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    variant: Optional[Dict[str, Any]] = None
    product: ProductResponse

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    items: List[CartItemResponse] = []
    subtotal: float = 0
    total: float = 0

    class Config:
        from_attributes = True
