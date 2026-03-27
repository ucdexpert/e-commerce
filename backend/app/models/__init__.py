# Import all models to make them available when importing from app.models
from .user import User
from .product import Product, Category, product_categories
from .order import Order, OrderItem
from .cart import Cart, CartItem
from .address import Address
from .review import Review
from .wishlist import Wishlist, WishlistItem
from .coupon import Coupon
from .inventory import InventoryLog
from .return_order import Return
from .shipping import ShippingCompany, ShippingZone, ShippingRate
from .referral import Referral
from .newsletter import NewsletterSubscriber

__all__ = [
    "User",
    "Product",
    "Category",
    "product_categories",
    "Order",
    "OrderItem",
    "Cart",
    "CartItem",
    "Address",
    "Review",
    "Wishlist",
    "WishlistItem",
    "Coupon",
    "InventoryLog",
    "Return",
    "ShippingCompany",
    "ShippingZone",
    "ShippingRate",
    "Referral",
    "NewsletterSubscriber",
]
