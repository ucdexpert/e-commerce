from app.core.database import SessionLocal, engine
from app.models import Product, Category
from sqlalchemy import inspect

inspector = inspect(engine)
tables = inspector.get_table_names()
print('Tables:', tables)

# Check product_categories columns
if 'product_categories' in tables:
    cols = inspector.get_columns('product_categories')
    print('\nproduct_categories columns:')
    for col in cols:
        print(f'  {col["name"]}: {col["type"]}')

# Check if there's data in product_categories
from sqlalchemy import text
with engine.connect() as conn:
    result = conn.execute(text('SELECT COUNT(*) FROM product_categories'))
    count = result.scalar()
    print(f'\nproduct_categories row count: {count}')
    
    if count > 0:
        result = conn.execute(text('SELECT * FROM product_categories LIMIT 5'))
        print('\nproduct_categories sample data:')
        for row in result:
            print(f'  {row}')
