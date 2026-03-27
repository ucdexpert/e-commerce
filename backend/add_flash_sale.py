from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_sale_price FLOAT"))
    conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_sale_start TIMESTAMP"))
    conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS flash_sale_end TIMESTAMP"))
    conn.commit()
    print("✓ Flash sale columns added successfully!")
