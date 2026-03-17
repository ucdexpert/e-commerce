from ..core.database import Base
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text
from datetime import datetime


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, nullable=False)
    description = Column(Text)
    discount_type = Column(String, nullable=False)  # percentage, fixed
    discount_value = Column(Float, nullable=False)
    min_order_amount = Column(Float, default=0)
    max_discount_amount = Column(Float)
    usage_limit = Column(Integer)
    used_count = Column(Integer, default=0)
    starts_at = Column(DateTime)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
