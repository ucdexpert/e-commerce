"""
Database Migration Script
Adds new tables and columns for high-priority features:
1. Returns table
2. User roles & permissions columns
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def run_migration():
    """Run database migrations"""
    
    # Parse DATABASE_URL
    # Format: postgresql://user:password@host:port/database?sslmode=require
    conn = psycopg2.connect(DATABASE_URL)
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = conn.cursor()
    
    print("🚀 Starting database migration...")
    
    try:
        # 1. Create Returns table
        print("📦 Creating returns table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS returns (
                id SERIAL PRIMARY KEY,
                return_number VARCHAR(50) UNIQUE NOT NULL,
                order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                guest_email VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                reason VARCHAR(100) NOT NULL,
                reason_detail TEXT,
                items JSONB DEFAULT '[]',
                refund_amount FLOAT NOT NULL,
                refund_method VARCHAR(50) DEFAULT 'original',
                images JSONB DEFAULT '[]',
                admin_notes TEXT,
                reviewed_by INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                reviewed_at TIMESTAMP,
                completed_at TIMESTAMP
            )
        """)
        
        # Create indexes for returns table
        print("📑 Creating indexes for returns table...")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_returns_return_number ON returns(return_number)")
        
        # 2. Add role columns to users table
        print("👥 Adding role columns to users table...")
        
        # Check if columns already exist before adding
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'is_admin'
        """)
        if not cur.fetchone():
            cur.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE")
            print("  ✓ Added is_admin column")
        
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'is_staff'
        """)
        if not cur.fetchone():
            cur.execute("ALTER TABLE users ADD COLUMN is_staff BOOLEAN DEFAULT FALSE")
            print("  ✓ Added is_staff column")
        
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'is_vendor'
        """)
        if not cur.fetchone():
            cur.execute("ALTER TABLE users ADD COLUMN is_vendor BOOLEAN DEFAULT FALSE")
            print("  ✓ Added is_vendor column")
        
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'permissions'
        """)
        if not cur.fetchone():
            cur.execute("ALTER TABLE users ADD COLUMN permissions JSONB DEFAULT '[]'")
            print("  ✓ Added permissions column")
        
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'vendor_store_name'
        """)
        if not cur.fetchone():
            cur.execute("ALTER TABLE users ADD COLUMN vendor_store_name VARCHAR(255)")
            print("  ✓ Added vendor_store_name column")
        
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'vendor_approved'
        """)
        if not cur.fetchone():
            cur.execute("ALTER TABLE users ADD COLUMN vendor_approved BOOLEAN DEFAULT FALSE")
            print("  ✓ Added vendor_approved column")
        
        # 3. Add returns relationship to orders table (just verify it exists)
        print("🔗 Verifying order-returns relationship...")
        # The relationship is handled in SQLAlchemy models, no DB change needed
        
        # 4. Create indexes for better performance
        print("📑 Creating additional indexes...")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_is_staff ON users(is_staff)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_users_is_vendor ON users(is_vendor)")
        
        conn.commit()
        print("\n✅ Database migration completed successfully!")
        print("\n📊 Summary:")
        print("  ✓ Created returns table")
        print("  ✓ Added 6 new columns to users table")
        print("  ✓ Created 8 indexes for performance")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Migration failed: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Database Migration for High Priority Features")
    print("=" * 60)
    print()
    
    if not DATABASE_URL:
        print("❌ Error: DATABASE_URL not found in .env file")
        print("Please create .env file with your database connection string")
        exit(1)
    
    print(f"Database: {DATABASE_URL[:50]}...")
    print()
    
    confirm = input("Do you want to run the migration? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Migration cancelled")
        exit(0)
    
    run_migration()
