"""
Migration script to verify database indexes for performance optimization.
Run this once to ensure all indexes are in place.
"""

from sqlalchemy import create_engine, text, inspect
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/ecommerce")

def check_and_add_indexes():
    """Check if indexes exist and add them if missing"""
    engine = create_engine(DATABASE_URL)
    
    indexes_to_add = [
        # Products table
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_slug ON products(slug);", "idx_products_slug"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_active ON products(is_active);", "idx_products_is_active"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_is_featured ON products(is_featured);", "idx_products_is_featured"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created_at ON products(created_at);", "idx_products_created_at"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price ON products(price);", "idx_products_price"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_rating ON products(rating);", "idx_products_rating"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sold_count ON products(sold_count);", "idx_products_sold_count"),
        
        # Users table
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);", "idx_users_email"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);", "idx_users_username"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at);", "idx_users_created_at"),
        
        # Orders table
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_id ON orders(user_id);", "idx_orders_user_id"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);", "idx_orders_status"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);", "idx_orders_created_at"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_order_number ON orders(order_number);", "idx_orders_order_number"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);", "idx_orders_payment_status"),
        
        # Categories table
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug ON categories(slug);", "idx_categories_slug"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);", "idx_categories_parent_id"),
        
        # Order items table
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);", "idx_order_items_order_id"),
        ("CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);", "idx_order_items_product_id"),
    ]
    
    print("Checking and adding database indexes...")
    print("=" * 50)
    
    with engine.connect() as conn:
        # Set isolation level to AUTOCOMMIT for CREATE INDEX CONCURRENTLY
        from sqlalchemy.orm import sessionmaker
        Session = sessionmaker(bind=engine)
        session = Session()
        
        for sql, index_name in indexes_to_add:
            try:
                # Check if index exists
                result = session.execute(text(f"""
                    SELECT 1 FROM pg_indexes 
                    WHERE indexname = '{index_name}'
                """)).fetchone()
                
                if result:
                    print(f"✓ Index {index_name} already exists")
                else:
                    print(f"Creating index {index_name}...")
                    session.execute(text(sql.replace("CONCURRENTLY", "")))  # Remove CONCURRENTLY for normal transaction
                    session.commit()
                    print(f"✓ Created index {index_name}")
            except Exception as e:
                print(f"✗ Error with {index_name}: {e}")
                session.rollback()
        
        session.close()
    
    print("=" * 50)
    print("Index migration complete!")

if __name__ == "__main__":
    check_and_add_indexes()
