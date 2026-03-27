from ..core.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)  # Added index
    guest_email = Column(String, nullable=True, index=True)  # Email for guest orders
    status = Column(String, default="pending", index=True)  # Added index
    payment_status = Column(String, default="pending", index=True)
    payment_method = Column(String)
    payment_intent_id = Column(String)
    subtotal = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    shipping_cost = Column(Float, default=0)
    discount = Column(Float, default=0)
    total = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    notes = Column(Text)
    shipping_address_id = Column(Integer, ForeignKey('addresses.id'))
    billing_address_id = Column(Integer, ForeignKey('addresses.id'))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)  # Added index
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    shipped_at = Column(DateTime, index=True)
    delivered_at = Column(DateTime, index=True)
    cancelled_at = Column(DateTime)
    
    # Tracking fields
    tracking_number = Column(String, nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    tracking_events = Column(JSON, default=list)

    # Relationships
    user = relationship("User", back_populates="orders", foreign_keys=[user_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    returns = relationship("Return", back_populates="order", cascade="all, delete-orphan")
    shipping_address = relationship("Address", foreign_keys=[shipping_address_id])
    billing_address = relationship("Address", foreign_keys=[billing_address_id])


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # Price at time of purchase
    variant = Column(JSON)
    subtotal = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
