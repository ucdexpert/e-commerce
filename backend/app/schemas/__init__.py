# Import all schemas to make them available when importing from app.schemas
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserResponse,
    Token,
    TokenWithUser,
    TokenRefresh,
    LoginRequest,
)

from .product import (
    CategoryBase,
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    ProductBase,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    FlashSaleProductResponse,
    FlashSaleListResponse,
)

from .cart import (
    CartItemBase,
    CartItemCreate,
    CartItemUpdate,
    CartItemResponse,
    CartResponse,
)

from .order import (
    OrderItemBase,
    OrderItemCreate,
    OrderItemResponse,
    OrderBase,
    OrderCreate,
    OrderUpdate,
    OrderResponse,
    OrderListResponse,
)

from .address import (
    AddressBase,
    AddressCreate,
    AddressUpdate,
    AddressResponse,
)

from .review import (
    ReviewBase,
    ReviewCreate,
    ReviewUpdate,
    ReviewResponse,
)

from .wishlist import (
    WishlistItemResponse,
    WishlistResponse,
)

from .coupon import (
    CouponBase,
    CouponCreate,
    CouponUpdate,
    CouponResponse,
    CouponValidateRequest,
    CouponValidateResponse,
    SearchResponse,
    DashboardStats,
)

__all__ = [
    # User
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "Token",
    "TokenWithUser",
    "TokenRefresh",
    "LoginRequest",
    # Product & Category
    "CategoryBase",
    "CategoryCreate",
    "CategoryUpdate",
    "CategoryResponse",
    "ProductBase",
    "ProductCreate",
    "ProductUpdate",
    "ProductResponse",
    "ProductListResponse",
    "FlashSaleProductResponse",
    "FlashSaleListResponse",
    # Cart
    "CartItemBase",
    "CartItemCreate",
    "CartItemUpdate",
    "CartItemResponse",
    "CartResponse",
    # Order
    "OrderItemBase",
    "OrderItemCreate",
    "OrderItemResponse",
    "OrderBase",
    "OrderCreate",
    "OrderUpdate",
    "OrderResponse",
    "OrderListResponse",
    # Address
    "AddressBase",
    "AddressCreate",
    "AddressUpdate",
    "AddressResponse",
    # Review
    "ReviewBase",
    "ReviewCreate",
    "ReviewUpdate",
    "ReviewResponse",
    # Wishlist
    "WishlistItemResponse",
    "WishlistResponse",
    # Coupon
    "CouponBase",
    "CouponCreate",
    "CouponUpdate",
    "CouponResponse",
    "CouponValidateRequest",
    "CouponValidateResponse",
    # Search & Dashboard
    "SearchResponse",
    "DashboardStats",
]
