"""
Database Seed Script - Adds categories and demo products
Run with: python backend/seed_data.py
"""
import sys
import os
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models.product import Category, Product, product_categories
from app.core.security import get_password_hash
from slugify import slugify
import random


def get_or_create_category(db: Session, name: str, description: str, slug: str = None, parent_id: int = None):
    """Get existing category or create new one"""
    if not slug:
        slug = slugify(name)
    
    category = db.query(Category).filter(Category.slug == slug).first()
    if not category:
        category = Category(
            name=name,
            slug=slug,
            description=description,
            parent_id=parent_id
        )
        db.add(category)
        db.commit()
        db.refresh(category)
        print(f"✓ Created category: {name}")
    else:
        print(f"⊙ Category already exists: {name}")
    return category


def create_product(db: Session, name: str, description: str, price: float, 
                   category_ids: list, stock: int = 50, is_featured: bool = False,
                   is_on_sale: bool = False, sku: str = None, images: list = None,
                   short_description: str = None):
    """Create a product and link to categories"""
    slug = slugify(name)
    
    # Check if product already exists
    existing = db.query(Product).filter(Product.slug == slug).first()
    if existing:
        print(f"  ⊙ Product already exists: {name}")
        return existing
    
    if not sku:
        sku = f"SKU-{slug.upper().replace('-', '')}"
    
    if not short_description:
        short_description = description[:100]
    
    product = Product(
        name=name,
        slug=slugify(name),
        description=description,
        short_description=short_description,
        price=price,
        compare_price=price * 1.2 if is_on_sale else None,
        stock_quantity=stock,
        is_featured=is_featured,
        is_on_sale=is_on_sale,
        sku=sku,
        images=images or [],
        rating=round(random.uniform(3.5, 5.0), 1),
        review_count=random.randint(5, 150),
        sold_count=random.randint(10, 500),
        view_count=random.randint(100, 5000)
    )
    
    db.add(product)
    db.commit()
    db.refresh(product)
    
    # Link to categories
    for cat_id in category_ids:
        stmt = product_categories.insert().values(product_id=product.id, category_id=cat_id)
        db.execute(stmt)
    
    db.commit()
    print(f"  ✓ Created product: {name} (${price})")
    return product


def seed_categories_and_products():
    """Main seed function"""
    db = SessionLocal()
    
    try:
        print("\n" + "="*60)
        print("🌱 SEEDING DATABASE - Categories & Products")
        print("="*60 + "\n")
        
        # ========== MAIN CATEGORIES ==========
        print("📦 Creating Categories...\n")
        
        # 1. Electronics
        electronics = get_or_create_category(db, "Electronics", "All electronic items and gadgets")
        
        # Sub-categories of Electronics
        laptops = get_or_create_category(db, "Laptops", "Laptops and computers", parent_id=electronics.id)
        mobiles = get_or_create_category(db, "Mobiles", "Smartphones and mobile devices", parent_id=electronics.id)
        cameras = get_or_create_category(db, "Cameras", "Digital cameras and photography", parent_id=electronics.id)
        audio = get_or_create_category(db, "Audio", "Headphones, speakers and audio devices", parent_id=electronics.id)
        
        # 2. Fashion
        fashion = get_or_create_category(db, "Fashion", "Clothing and fashion items")
        
        clothing = get_or_create_category(db, "Clothing", "Clothing and apparel", parent_id=fashion.id)
        shoes = get_or_create_category(db, "Shoes", "Footwear for all occasions", parent_id=fashion.id)
        watches = get_or_create_category(db, "Watches", "Wristwatches and smartwatches", parent_id=fashion.id)
        accessories = get_or_create_category(db, "Accessories", "Fashion accessories", parent_id=fashion.id)
        
        # 3. Home & Living
        home_living = get_or_create_category(db, "Home & Living", "Home decor and living essentials")
        
        furniture = get_or_create_category(db, "Furniture", "Home and office furniture", parent_id=home_living.id)
        decor = get_or_create_category(db, "Home Decor", "Decorative items and accessories", parent_id=home_living.id)
        kitchen = get_or_create_category(db, "Kitchen", "Kitchen appliances and utensils", parent_id=home_living.id)
        
        # 4. Sports & Fitness
        sports = get_or_create_category(db, "Sports & Fitness", "Sports equipment and fitness gear")
        
        # 5. Books & Media
        books_media = get_or_create_category(db, "Books & Media", "Books, movies and music")
        
        books = get_or_create_category(db, "Books", "Physical and digital books", parent_id=books_media.id)
        movies = get_or_create_category(db, "Movies", "DVDs and digital movies", parent_id=books_media.id)
        
        # 6. Beauty & Health
        beauty = get_or_create_category(db, "Beauty & Health", "Beauty products and health items")
        
        skincare = get_or_create_category(db, "Skincare", "Skincare products", parent_id=beauty.id)
        makeup = get_or_create_category(db, "Makeup", "Cosmetics and makeup", parent_id=beauty.id)
        
        # 7. Toys & Games
        toys = get_or_create_category(db, "Toys & Games", "Toys and gaming products")
        
        # 8. Groceries
        groceries = get_or_create_category(db, "Groceries", "Food and grocery items")
        
        db.commit()
        print("\n✅ All categories created!\n")
        
        # ========== DEMO PRODUCTS ==========
        print("🛍️  Creating Demo Products...\n")
        
        # --- LAPTOPS & COMPUTERS ---
        create_product(db, 
            "MacBook Pro 14-inch M3", 
            "Apple MacBook Pro with M3 chip, 16GB RAM, 512GB SSD. Perfect for professionals and creatives.",
            1999.99, [laptops.id, electronics.id], stock=25, is_featured=True)
        
        create_product(db,
            "Dell XPS 15",
            "Dell XPS 15 laptop with Intel i7, 16GB RAM, 1TB SSD, 15.6\" OLED display.",
            1499.99, [laptops.id, electronics.id], stock=30, is_on_sale=True)
        
        create_product(db,
            "HP Gaming Desktop",
            "High-performance gaming desktop with RTX 4070, AMD Ryzen 7, 32GB RAM, 1TB NVMe.",
            1799.99, [electronics.id], stock=15, is_featured=True)
        
        # --- MOBILES ---
        create_product(db,
            "iPhone 15 Pro Max",
            "Apple iPhone 15 Pro Max with A17 Pro chip, 256GB storage, titanium design.",
            1199.99, [mobiles.id, electronics.id], stock=40, is_featured=True)
        
        create_product(db,
            "Samsung Galaxy S24 Ultra",
            "Samsung flagship with Snapdragon 8 Gen 3, 200MP camera, S Pen included.",
            1099.99, [mobiles.id, electronics.id], stock=35, is_on_sale=True)
        
        create_product(db,
            "Google Pixel 8",
            "Google Pixel 8 with Tensor G3 chip, exceptional camera AI features.",
            699.99, [mobiles.id, electronics.id], stock=50)
        
        # --- CAMERAS ---
        create_product(db,
            "Canon EOS R6 Mark II",
            "Full-frame mirrorless camera with 24.2MP sensor, 4K 60fps video.",
            2499.99, [cameras.id, electronics.id], stock=10)
        
        create_product(db,
            "Sony A7 IV",
            "Professional mirrorless camera with 33MP full-frame sensor.",
            2199.99, [cameras.id, electronics.id], stock=12, is_featured=True)
        
        # --- AUDIO ---
        create_product(db,
            "Sony WH-1000XM5 Headphones",
            "Industry-leading noise cancellation wireless headphones with 30hr battery.",
            399.99, [audio.id, electronics.id], stock=60, is_featured=True)
        
        create_product(db,
            "Bose SoundLink Speaker",
            "Portable Bluetooth speaker with crisp, clear sound and 12hr battery.",
            149.99, [audio.id, electronics.id], stock=45, is_on_sale=True)
        
        create_product(db,
            "AirPods Pro 2nd Gen",
            "Apple AirPods Pro with active noise cancellation and spatial audio.",
            249.99, [audio.id, electronics.id], stock=70)
        
        # --- CLOTHING ---
        create_product(db,
            "Men's Classic Fit Suit",
            "Premium wool blend suit, perfect for formal occasions and business meetings.",
            299.99, [clothing.id, fashion.id], stock=20, is_featured=True)
        
        create_product(db,
            "Women's Summer Dress",
            "Floral print midi dress, lightweight and comfortable for summer days.",
            59.99, [clothing.id, fashion.id], stock=80, is_on_sale=True)
        
        create_product(db,
            "Denim Jacket Unisex",
            "Classic denim jacket with modern fit, versatile layering piece.",
            89.99, [clothing.id, fashion.id], stock=50)
        
        create_product(db,
            "Cotton T-Shirt Pack (3)",
            "Premium cotton t-shirts in assorted colors, comfortable everyday wear.",
            39.99, [clothing.id, fashion.id], stock=150)
        
        # --- SHOES ---
        create_product(db,
            "Nike Air Max 270",
            "Running shoes with Max Air unit for superior cushioning and comfort.",
            149.99, [shoes.id, fashion.id], stock=60, is_featured=True)
        
        create_product(db,
            "Adidas Ultraboost 23",
            "Premium running shoes with Boost technology and Primeknit upper.",
            189.99, [shoes.id, fashion.id], stock=45, is_on_sale=True)
        
        create_product(db,
            "Leather Formal Shoes",
            "Genuine leather oxford shoes for professional and formal occasions.",
            129.99, [shoes.id, fashion.id], stock=35)
        
        # --- WATCHES ---
        create_product(db,
            "Apple Watch Series 9",
            "Advanced smartwatch with health monitoring, GPS, and always-on display.",
            429.99, [watches.id, fashion.id], stock=30, is_featured=True)
        
        create_product(db,
            "Casio G-Shock",
            "Rugged digital watch with shock resistance and 200m water resistance.",
            99.99, [watches.id, fashion.id], stock=70)
        
        create_product(db,
            "Fossil Chronograph Watch",
            "Classic analog chronograph watch with stainless steel band.",
            149.99, [watches.id, fashion.id], stock=40, is_on_sale=True)
        
        # --- ACCESSORIES ---
        create_product(db,
            "Leather Crossbody Bag",
            "Genuine leather crossbody bag with adjustable strap, perfect for daily use.",
            79.99, [accessories.id, fashion.id], stock=55)
        
        create_product(db,
            "Designer Sunglasses",
            "UV protection polarized sunglasses with modern frame design.",
            129.99, [accessories.id, fashion.id], stock=65, is_featured=True)
        
        create_product(db,
            "Silk Scarf Collection",
            "Premium silk scarves in elegant patterns, versatile fashion accessory.",
            49.99, [accessories.id, fashion.id], stock=80)
        
        # --- FURNITURE ---
        create_product(db,
            "Ergonomic Office Chair",
            "Premium mesh office chair with lumbar support and adjustable armrests.",
            399.99, [furniture.id, home_living.id], stock=20, is_featured=True)
        
        create_product(db,
            "Standing Desk Electric",
            "Height-adjustable electric standing desk with memory presets, 60\" surface.",
            599.99, [furniture.id, home_living.id], stock=15, is_on_sale=True)
        
        create_product(db,
            "L-Shaped Gaming Desk",
            "Spacious L-shaped desk with carbon fiber surface and cable management.",
            249.99, [furniture.id, home_living.id], stock=25)
        
        # --- HOME DECOR ---
        create_product(db,
            "Smart LED Floor Lamp",
            "WiFi-enabled floor lamp with 16M colors, voice control compatible.",
            89.99, [decor.id, home_living.id], stock=40, is_featured=True)
        
        create_product(db,
            "Wall Art Canvas Set (3)",
            "Modern abstract canvas prints, gallery-wrapped and ready to hang.",
            79.99, [decor.id, home_living.id], stock=60)
        
        create_product(db,
            "Ceramic Vase Collection",
            "Set of 3 minimalist ceramic vases in matte finish, various sizes.",
            59.99, [decor.id, home_living.id], stock=50, is_on_sale=True)
        
        # --- KITCHEN ---
        create_product(db,
            "KitchenAid Stand Mixer",
            "Professional 5-quart stand mixer with multiple attachments included.",
            379.99, [kitchen.id, home_living.id], stock=25, is_featured=True)
        
        create_product(db,
            "Air Fryer Digital 6Qt",
            "Digital air fryer with 8 presets, cook healthier meals with less oil.",
            119.99, [kitchen.id, home_living.id], stock=45, is_on_sale=True)
        
        create_product(db,
            "Knife Set Professional 15-Piece",
            "High-carbon stainless steel knife set with wooden block.",
            149.99, [kitchen.id, home_living.id], stock=35)
        
        # --- SPORTS & FITNESS ---
        create_product(db,
            "Adjustable Dumbbell Set",
            "Space-saving adjustable dumbbells, 5-52.5 lbs per hand.",
            349.99, [sports.id], stock=20, is_featured=True)
        
        create_product(db,
            "Yoga Mat Premium",
            "Extra thick eco-friendly yoga mat with alignment lines and carry strap.",
            49.99, [sports.id], stock=100)
        
        create_product(db,
            "Fitness Tracker Band",
            "Activity tracker with heart rate monitor, sleep tracking, and GPS.",
            79.99, [sports.id, electronics.id], stock=80, is_on_sale=True)
        
        create_product(db,
            "Resistance Bands Set (5)",
            "5 resistance levels for varied workouts, includes door anchor and carry bag.",
            29.99, [sports.id], stock=120)
        
        # --- BOOKS ---
        create_product(db,
            "Atomic Habits by James Clear",
            "Bestselling book on building good habits and breaking bad ones.",
            16.99, [books.id, books_media.id], stock=150, is_featured=True)
        
        create_product(db,
            "The Psychology of Money",
            "Morgan Housel's timeless lessons on wealth, greed, and happiness.",
            18.99, [books.id, books_media.id], stock=130)
        
        create_product(db,
            "Programming in Python 4th Ed",
            "Comprehensive guide to Python programming for beginners to advanced.",
            49.99, [books.id, books_media.id], stock=60, is_on_sale=True)
        
        create_product(db,
            "The Art of War - Deluxe Edition",
            "Sun Tzu's classic strategy guide in a beautifully crafted deluxe edition.",
            24.99, [books.id, books_media.id], stock=90)
        
        # --- MOVIES ---
        create_product(db,
            "Inception 4K UHD Blu-ray",
            "Christopher Nolan's mind-bending thriller in stunning 4K resolution.",
            29.99, [movies.id, books_media.id], stock=40)
        
        create_product(db,
            "Marvel Collection Box Set",
            "Complete Infinity Saga collection in premium packaging, 23 movies.",
            299.99, [movies.id, books_media.id], stock=15, is_featured=True)
        
        create_product(db,
            "Interstellar Blu-ray",
            "Epic sci-fi adventure in high-definition with bonus features.",
            19.99, [movies.id, books_media.id], stock=55, is_on_sale=True)
        
        # --- SKINCARE ---
        create_product(db,
            "Vitamin C Serum 30ml",
            "Brightening vitamin C serum with hyaluronic acid for radiant skin.",
            34.99, [skincare.id, beauty.id], stock=80, is_featured=True)
        
        create_product(db,
            "Retinol Night Cream",
            "Anti-aging retinol cream to reduce wrinkles and renew skin overnight.",
            39.99, [skincare.id, beauty.id], stock=70)
        
        create_product(db,
            "SPF 50 Sunscreen 100ml",
            "Lightweight broad-spectrum sunscreen, non-greasy formula.",
            24.99, [skincare.id, beauty.id], stock=100, is_on_sale=True)
        
        # --- MAKEUP ---
        create_product(db,
            "Matte Lipstick Set (6)",
            "Long-lasting matte lipsticks in versatile shades, highly pigmented.",
            44.99, [makeup.id, beauty.id], stock=90, is_featured=True)
        
        create_product(db,
            "Foundation Brush Professional",
            "Dense synthetic brush for flawless, streak-free foundation application.",
            19.99, [makeup.id, beauty.id], stock=110)
        
        create_product(db,
            "Eyeshadow Palette 35 Colors",
            "Highly pigmented eyeshadow palette with matte and shimmer finishes.",
            29.99, [makeup.id, beauty.id], stock=75, is_on_sale=True)
        
        # --- TOYS & GAMES ---
        create_product(db,
            "LEGO Technic Porsche 911",
            "Detailed LEGO model with 1,458 pieces, perfect for collectors.",
            149.99, [toys.id], stock=25, is_featured=True)
        
        create_product(db,
            "PlayStation 5 DualSense Controller",
            "Wireless controller with haptic feedback and adaptive triggers.",
            69.99, [toys.id, electronics.id], stock=50)
        
        create_product(db,
            "Board Game Collection",
            "Set of 5 classic family board games for game nights.",
            59.99, [toys.id], stock=40, is_on_sale=True)
        
        create_product(db,
            "RC Drone with Camera",
            "4K camera drone with GPS, follow-me mode, and 30min flight time.",
            399.99, [toys.id, electronics.id], stock=15)
        
        # --- GROCERIES ---
        create_product(db,
            "Organic Coffee Beans 1kg",
            "Premium single-origin organic coffee beans, medium roast.",
            24.99, [groceries.id], stock=100, is_featured=True)
        
        create_product(db,
            "Extra Virgin Olive Oil 750ml",
            "Cold-pressed extra virgin olive oil from Mediterranean olives.",
            18.99, [groceries.id], stock=80)
        
        create_product(db,
            "Mixed Nuts Premium 500g",
            "Deluxe mix of cashews, almonds, pecans, and walnuts.",
            14.99, [groceries.id], stock=120, is_on_sale=True)
        
        create_product(db,
            "Green Tea Collection (20 bags)",
            "Assorted green tea blends including jasmine, mint, and classic.",
            12.99, [groceries.id], stock=150)
        
        db.commit()
        
        print("\n" + "="*60)
        print("✅ SEEDING COMPLETE!")
        print("="*60)
        
        # Print summary
        total_categories = db.query(Category).count()
        total_products = db.query(Product).count()
        
        print(f"\n📊 Summary:")
        print(f"   • Total Categories: {total_categories}")
        print(f"   • Total Products: {total_products}")
        print(f"\n🎉 Your e-commerce store is now populated with demo data!")
        print(f"   Visit your app to see categories and products in action.\n")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding database: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_categories_and_products()
