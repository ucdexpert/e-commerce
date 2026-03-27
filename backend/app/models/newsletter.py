from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.core.database import Base
from datetime import datetime

class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"
    
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    subscribed_at = Column(DateTime, default=datetime.utcnow)
    unsubscribed_at = Column(DateTime, nullable=True)
    source = Column(String, default="website")
