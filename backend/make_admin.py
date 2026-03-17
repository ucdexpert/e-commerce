"""
Make a user an admin in the database.

Usage:
    cd backend
    python make_admin.py
"""

import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User

def make_admin(email: str):
    """
    Update user role to admin in database.
    
    Args:
        email: User email to make admin
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User {email} not found!")
            print("\nAvailable users:")
            users = db.query(User).all()
            for u in users:
                print(f"  - {u.email} (role: {'admin' if u.is_superuser else 'customer'})")
            return
        
        # Check if already admin
        if user.is_superuser:
            print(f"✅ User {email} is already an admin!")
            return
        
        # Update to admin
        user.is_superuser = True
        db.commit()
        
        print("=" * 60)
        print("✅ SUCCESS!")
        print("=" * 60)
        print(f"User: {email}")
        print(f"Role: customer → admin")
        print(f"User ID: {user.id}")
        print("=" * 60)
        print("\nYou can now access /admin endpoints!")
        print("Please log out and log back in for changes to take effect.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Default email
    email = "hk202504@gmail.com"
    
    # Allow override from command line
    if len(sys.argv) > 1:
        email = sys.argv[1]
    
    print(f"Making user admin: {email}")
    print("-" * 60)
    make_admin(email)
