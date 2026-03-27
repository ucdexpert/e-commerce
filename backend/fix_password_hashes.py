"""
Fix corrupted password hashes in the database
Run this script to reset passwords for all users
"""

from app.core.database import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User
from sqlalchemy import text

def fix_password_hashes():
    db = SessionLocal()
    try:
        # Get all users
        users = db.query(User).all()
        
        print(f"Found {len(users)} users")
        
        for user in users:
            # Check if password hash is valid
            if not user.hashed_password or len(user.hashed_password) < 60:
                print(f"⚠️  User {user.email} has invalid password hash")
                print(f"   Current hash: {user.hashed_password}")
                
                # You can either:
                # 1. Reset to a default password
                default_password = "TempPass123!"
                user.hashed_password = get_password_hash(default_password)
                print(f"   ✓ Reset password to: {default_password}")
                
                # OR
                # 2. Mark user for password reset
                
        db.commit()
        print("\n✓ Password hashes fixed!")
        print("\nIMPORTANT: Users should reset their passwords after this fix")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Fixing Corrupted Password Hashes")
    print("=" * 50)
    fix_password_hashes()
