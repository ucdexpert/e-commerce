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
    
    # Referral program
    referral_code = Column(String, unique=True, nullable=True)
    
    # Two-Factor Authentication
    totp_secret = Column(String, nullable=True)
    two_factor_enabled = Column(Boolean, default=False)

    # SMS Notifications
    sms_notifications_enabled = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    orders = relationship("Order", back_populates="user")
    cart = relationship("Cart", back_populates="user", uselist=False)
    reviews = relationship("Review", back_populates="user")
    addresses = relationship("Address", back_populates="user")
    wishlist = relationship("Wishlist", back_populates="user", uselist=False)
    reviewed_returns = relationship("Return", foreign_keys="Return.reviewed_by", back_populates="reviewer")
