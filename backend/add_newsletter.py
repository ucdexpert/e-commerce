from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
            id SERIAL PRIMARY KEY,
            email VARCHAR UNIQUE NOT NULL,
            name VARCHAR,
            is_active BOOLEAN DEFAULT TRUE,
            subscribed_at TIMESTAMP DEFAULT NOW(),
            unsubscribed_at TIMESTAMP,
            source VARCHAR DEFAULT 'website'
        )
    """))
    conn.commit()
    print("✓ Newsletter table created!")
