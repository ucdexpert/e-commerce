from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Add tracking columns to orders table
    conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR"))
    conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP"))
    conn.execute(text("ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_events JSON DEFAULT '[]'::json"))
    conn.commit()
    print("✓ Order tracking columns added successfully!")
