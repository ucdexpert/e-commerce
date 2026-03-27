"""
Add sms_notifications_enabled column to users table.

Run this script to add the SMS notifications preference field to existing users.
Usage: python add_sms_notification_field.py
"""

import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text, inspect
from app.core.database import Base, engine
from app.models.user import User


def add_sms_notification_field():
    """Add sms_notifications_enabled column to users table if it doesn't exist."""
    
    # Check if column already exists
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'sms_notifications_enabled' in columns:
        print("✓ Column 'sms_notifications_enabled' already exists in users table")
        return True
    
    print("Adding 'sms_notifications_enabled' column to users table...")
    
    try:
        # Use raw SQL to add the column with default value
        with engine.connect() as conn:
            conn.execute(text(
                "ALTER TABLE users ADD COLUMN sms_notifications_enabled BOOLEAN DEFAULT TRUE"
            ))
            conn.commit()
        
        print("✓ Successfully added 'sms_notifications_enabled' column to users table")
        print("  - Default value: TRUE (SMS notifications enabled by default)")
        print("  - Existing users will have SMS notifications enabled")
        return True
        
    except Exception as e:
        print(f"✗ Error adding column: {e}")
        return False


def verify_column_exists():
    """Verify that the column was added successfully."""
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('users')]
    
    if 'sms_notifications_enabled' in columns:
        print("✓ Verification successful: 'sms_notifications_enabled' column exists")
        return True
    else:
        print("✗ Verification failed: 'sms_notifications_enabled' column not found")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("SMS Notification Field Migration")
    print("=" * 60)
    
    success = add_sms_notification_field()
    
    if success:
        verify_column_exists()
        print("\n" + "=" * 60)
        print("Migration completed successfully!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("Migration failed. Please check the error above.")
        print("=" * 60)
        sys.exit(1)
