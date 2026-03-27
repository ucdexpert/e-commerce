from ..core.database import Base
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime


class ShippingCompany(Base):
    __tablename__ = "shipping_companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # TCS, Leopards, etc.
    code = Column(String, unique=True, nullable=False)  # tcs, leopards
    logo = Column(String)
    tracking_url = Column(String)  # Template: https://tcstracking.com/?track={tracking_number}
    phone = Column(String)
    email = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    zones = relationship("ShippingZone", back_populates="company")


class ShippingZone(Base):
    __tablename__ = "shipping_zones"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey('shipping_companies.id'), nullable=False)
    name = Column(String, nullable=False)  # e.g., "Punjab", "Sindh", "Nationwide"
    cities = Column(JSON, default=list)  # List of city names
    min_days = Column(Integer, default=1)  # Minimum delivery days
    max_days = Column(Integer, default=5)  # Maximum delivery days
    is_active = Column(Boolean, default=True)

    # Relationships
    company = relationship("ShippingCompany", back_populates="zones")
    rates = relationship("ShippingRate", back_populates="zone")


class ShippingRate(Base):
    __tablename__ = "shipping_rates"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey('shipping_zones.id'), nullable=False)
    weight_min = Column(Float, default=0)  # Minimum weight in kg
    weight_max = Column(Float, default=999)  # Maximum weight in kg
    price = Column(Float, nullable=False)
    free_shipping_above = Column(Float)  # Free shipping if order total > this
    is_active = Column(Boolean, default=True)

    # Relationships
    zone = relationship("ShippingZone", back_populates="rates")
