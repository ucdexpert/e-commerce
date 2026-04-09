from pydantic import BaseModel, ConfigDict, model_validator
from typing import Optional, List, Dict, Any
from datetime import datetime


# ============ Category Schemas ============
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None


class CategoryResponse(CategoryBase):
    id: int
    # Only include parent_id, not the full parent object, to prevent cycles
    # Users can fetch parent separately if needed via parent_id
    parent: Optional['CategoryResponse'] = None
    children: List['CategoryResponse'] = []

    model_config = ConfigDict(
        from_attributes=True,
        extra='ignore'
    )

    @model_validator(mode='after')
    def break_parent_cycle(self):
        """Prevent infinite recursion by breaking parent-child cycles."""
        if self.parent:
            self.parent.children = []
            if self.parent.parent:
                self.parent.parent = None
        for child in self.children:
            if child.parent:
                child.parent = None
            for grandchild in child.children:
                if grandchild.parent:
                    grandchild.parent = None
        return self


# Forward reference for Pydantic v2
CategoryResponse.model_rebuild()


# Simplified category response for product embedding (no nesting to avoid cycles)
class CategorySimpleResponse(BaseModel):
    """Lightweight category response without parent/children nesting."""
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None
    parent_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


# ============ Product Schemas ============
class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    stock_quantity: int = 0
    is_active: bool = True
    is_featured: bool = False
    is_on_sale: bool = False
    images: List[str] = []
    attributes: Dict[str, Any] = {}
    variants: List[Dict[str, Any]] = []
    category_ids: List[int] = []
    # Flash Sale fields
    flash_sale_price: Optional[float] = None
    flash_sale_start: Optional[datetime] = None
    flash_sale_end: Optional[datetime] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_on_sale: Optional[bool] = None
    images: Optional[List[str]] = None
    attributes: Optional[Dict[str, Any]] = None
    # Flash Sale fields
    flash_sale_price: Optional[float] = None
    flash_sale_start: Optional[datetime] = None
    flash_sale_end: Optional[datetime] = None


class ProductResponse(ProductBase):
    id: int
    rating: float = 0
    review_count: int = 0
    sold_count: int = 0
    view_count: int = 0
    created_at: datetime
    updated_at: datetime
    # Use CategorySimpleResponse to avoid cyclic parent-child references
    categories: List[CategorySimpleResponse] = []

    model_config = ConfigDict(from_attributes=True)


class FlashSaleProductResponse(BaseModel):
    """Simplified product response for flash sales without categories to avoid serialization issues"""
    id: int
    name: str
    slug: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    price: float
    compare_price: Optional[float] = None
    sku: Optional[str] = None
    stock_quantity: int = 0
    is_active: bool = True
    is_featured: bool = False
    is_on_sale: bool = False
    images: List[str] = []
    rating: float = 0
    review_count: int = 0
    sold_count: int = 0
    flash_sale_price: Optional[float] = None
    flash_sale_start: Optional[datetime] = None
    flash_sale_end: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class FlashSaleListResponse(BaseModel):
    products: List[FlashSaleProductResponse]
    total: int
    skip: Optional[int] = None
    limit: Optional[int] = None


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: Optional[int] = None
    per_page: Optional[int] = None
    total_pages: Optional[int] = None
    skip: Optional[int] = None
    limit: Optional[int] = None
