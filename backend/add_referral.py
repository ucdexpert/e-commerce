from app.core.database import engine
from sqlalchemy import text
import secrets
import string

def generate_referral_code(length=8):
    chars = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(chars) for _ in range(length))

with engine.connect() as conn:
    # Create referrals table
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS referrals (
            id SERIAL PRIMARY KEY,
            referrer_id INTEGER REFERENCES users(id),
            referred_id INTEGER REFERENCES users(id),
            referral_code VARCHAR UNIQUE NOT NULL,
            status VARCHAR DEFAULT 'pending',
            reward_amount FLOAT DEFAULT 10.0,
            reward_given BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            completed_at TIMESTAMP
        )
    """))
    
    # Add referral_code to users table
    conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR UNIQUE"))
    
    # Generate referral codes for existing users who don't have one
    result = conn.execute(text("SELECT id, username FROM users WHERE referral_code IS NULL"))
    users = result.fetchall()
    
    generated_codes = set()
    for user in users:
        code = generate_referral_code()
        while code in generated_codes:
            code = generate_referral_code()
        generated_codes.add(code)
        conn.execute(
            text("UPDATE users SET referral_code = :code WHERE id = :id"),
            {"code": code, "id": user[0]}
        )
    
    conn.commit()
    print(f"✓ Referral system initialized!")
    print(f"✓ Created {len(generated_codes)} referral codes for existing users")
