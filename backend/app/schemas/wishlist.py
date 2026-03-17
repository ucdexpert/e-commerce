from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from .product import ProductResponse


# ============ Wishlist Schemas ============
class WishlistItemResponse(BaseModel):
    id: int
    product_id: int
    created_at: datetime
    product: ProductResponse

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    id: int
    user_id: int
    items: List[WishlistItemResponse] = []

    class Config:
        from_attributes = True
