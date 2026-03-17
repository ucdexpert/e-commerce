from ..core.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON, Table
from sqlalchemy.orm import relationship
from datetime import datetime


# Association table for many-to-many relationship between products and categories
product_categories = Table(
    'product_categories',
    Base.metadata,
    Column('product_id', Integer, ForeignKey('products.id')),
    Column('category_id', Integer, ForeignKey('categories.id'))
)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    description = Column(Text)
    image = Column(String)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)

    # Relationships
    parent = relationship("Category", remote_side=[id], backref="children")
    products = relationship("Product", secondary=product_categories, back_populates="categories")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text)
    short_description = Column(String)
    price = Column(Float, nullable=False, index=True)
    compare_price = Column(Float)  # Original price for discounts
    cost = Column(Float)  # Cost price for profit calculation
    sku = Column(String, unique=True, index=True)
    barcode = Column(String)
    stock_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    is_active = Column(Boolean, default=True, index=True)
    is_featured = Column(Boolean, default=False, index=True)
    is_on_sale = Column(Boolean, default=False, index=True)
    images = Column(JSON, default=list)  # List of image URLs
    attributes = Column(JSON, default=dict)  # e.g., {"color": ["red", "blue"], "size": ["S", "M", "L"]}
    variants = Column(JSON, default=list)  # Product variants
    weight = Column(Float)
    dimensions = Column(JSON)  # {"length": 10, "width": 5, "height": 3}
    rating = Column(Float, default=0, index=True)
    review_count = Column(Integer, default=0)
    sold_count = Column(Integer, default=0, index=True)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    categories = relationship("Category", secondary=product_categories, back_populates="products")
    reviews = relationship("Review", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_items = relationship("WishlistItem", back_populates="product")
