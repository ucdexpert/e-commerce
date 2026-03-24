from ..core.database import Base
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime


class Return(Base):
    __tablename__ = "returns"

    id = Column(Integer, primary_key=True, index=True)
    return_number = Column(String, unique=True, nullable=False, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    guest_email = Column(String, nullable=True)
    
    # Return details
    status = Column(String, default="pending", index=True)  # pending, approved, rejected, processed, completed
    reason = Column(String, nullable=False)  # damaged, wrong_item, not_as_described, size_issue, other
    reason_detail = Column(Text)  # Additional details
    
    # Items being returned
    items = Column(JSON, default=list)  # [{order_item_id, product_id, quantity, reason}]
    
    # Refund details
    refund_amount = Column(Float, nullable=False)
    refund_method = Column(String, default="original")  # original, store_credit, exchange
    
    # Images/proof
    images = Column(JSON, default=list)
    
    # Admin notes
    admin_notes = Column(Text)
    reviewed_by = Column(Integer, ForeignKey('users.id'))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    reviewed_at = Column(DateTime)
    completed_at = Column(DateTime)

    # Relationships
    order = relationship("Order", back_populates="returns")
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


# Add back-relation to Order and User
# This will be imported in models/__init__.py
