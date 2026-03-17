from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
from .config import settings
import os

# Get DATABASE_URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", settings.DATABASE_URL)

# Create engine with connection pool settings optimized for NeonDB serverless
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,              # Number of connections to keep open
    max_overflow=10,          # Additional connections beyond pool_size
    pool_timeout=30,          # Seconds to wait for connection from pool
    pool_recycle=1800,        # Recycle connections every 30 minutes (prevents stale connections)
    pool_pre_ping=True,       # KEY FIX: Test connection before using (creates new if dead)
    connect_args={
        "sslmode": "require",           # Require SSL connection
        "connect_timeout": 10,          # Connection timeout in seconds
        "keepalives": 1,                # Enable TCP keepalive
        "keepalives_idle": 30,          # Idle time before sending keepalive
        "keepalives_interval": 10,      # Time between keepalive probes
        "keepalives_count": 5,          # Number of failed probes before disconnect
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Event listener to set timezone on connection (optional but recommended)
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Set timezone on new connection"""
    try:
        cursor = dbapi_connection.cursor()
        cursor.execute("SET TIME ZONE 'UTC'")
        cursor.close()
    except Exception:
        pass  # Ignore if database doesn't support timezone setting

def get_db():
    """
    Database session dependency.
    Yields a database session and ensures it's closed after use.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
