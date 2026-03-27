from app.core.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Add 2FA columns
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret VARCHAR"))
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE"))
    conn.commit()
    print("✓ 2FA columns added successfully!")
