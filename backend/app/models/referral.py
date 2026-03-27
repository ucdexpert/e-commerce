from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True)
    referrer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    referred_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    referral_code = Column(String, unique=True, nullable=False)
    status = Column(String, default="pending")  # pending, completed, rewarded
    reward_amount = Column(Float, default=10.0)
    reward_given = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id], backref="sent_referrals")
    referred_user = relationship("User", foreign_keys=[referred_id], backref="received_referrals")
