from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============ Review Schemas ============
class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    product_id: int


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewResponse(ReviewBase):
    id: int
    product_id: int
    user_id: int
    user_name: str
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True
