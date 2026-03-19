from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from .product import ProductResponse


# ============ Order Schemas ============
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int
    variant: Optional[Dict[str, Any]] = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    variant: Optional[Dict[str, Any]] = None
    subtotal: float
    product: ProductResponse

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    shipping_address_id: int
    billing_address_id: Optional[int] = None
    payment_method: str = "stripe"
    notes: Optional[str] = None


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None


class OrderResponse(OrderBase):
    id: int
    order_number: str
    user_id: Optional[int] = None  # Made optional for guest orders
    guest_email: Optional[str] = None  # Added for guest orders
    status: str
    payment_status: str
    subtotal: float
    tax: float
    shipping_cost: float
    discount: float
    total: float
    currency: str
    items: List[OrderItemResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    orders: List[OrderResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
