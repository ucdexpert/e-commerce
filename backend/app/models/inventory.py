from ..core.database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from datetime import datetime


class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity_change = Column(Integer, nullable=False)  # Positive for add, negative for subtract
    reason = Column(String)  # sale, return, restock, adjustment
    reference_type = Column(String)  # order, return, manual
    reference_id = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
