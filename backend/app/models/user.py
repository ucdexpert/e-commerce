from ..core.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    phone = Column(String)
    avatar = Column(String)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    
    # Role-based access control
    is_superuser = Column(Boolean, default=False)  # Full access (super admin)
    is_admin = Column(Boolean, default=False)  # Admin access
    is_staff = Column(Boolean, default=False)  # Staff with limited permissions
    is_vendor = Column(Boolean, default=False)  # Vendor/seller
    
    # Granular permissions (JSON array)
    # Example: ["products.create", "products.edit", "orders.view"]
    permissions = Column(JSON, default=list)
    
    # Vendor-specific fields
    vendor_store_name = Column(String)  # Store name for vendors
    vendor_approved = Column(Boolean, default=False)  # Whether vendor is approved
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="user")
    cart = relationship("Cart", back_populates="user", uselist=False)
    reviews = relationship("Review", back_populates="user")
    addresses = relationship("Address", back_populates="user")
    wishlist = relationship("Wishlist", back_populates="user", uselist=False)
    reviewed_returns = relationship("Return", foreign_keys="Return.reviewed_by", back_populates="reviewer")
