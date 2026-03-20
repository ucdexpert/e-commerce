from app.core.database import engine
from sqlalchemy import text

def add_is_verified_column():
    """
    Add is_verified column to users table if it doesn't exist.
    Sets default value to TRUE so existing users can login immediately.
    """
    with engine.connect() as conn:
        try:
            print("Adding is_verified column to users table...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT TRUE
            """))
            conn.commit()
            print("✅ Column added successfully!")
            
            # Update existing users to be verified
            print("Updating existing users to is_verified = TRUE...")
            conn.execute(text("""
                UPDATE users 
                SET is_verified = TRUE 
                WHERE is_verified IS NULL
            """))
            conn.commit()
            print("✅ Existing users updated successfully!")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            conn.rollback()

if __name__ == "__main__":
    add_is_verified_column()
