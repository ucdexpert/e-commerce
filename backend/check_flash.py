from app.core.database import engine
from sqlalchemy import text

# Check product_categories data
with engine.connect() as conn:
    result = conn.execute(text('SELECT * FROM product_categories'))
    print('product_categories data:')
    for row in result:
        print(f'  product_id={row[0]} (type={type(row[0]).__name__}), category_id={row[1]} (type={type(row[1]).__name__})')
    
    # Check products data
    result = conn.execute(text('SELECT id, name, flash_sale_price, flash_sale_end FROM products WHERE flash_sale_price IS NOT NULL'))
    print('\nProducts with flash sales:')
    for row in result:
        print(f'  id={row[0]}, name={row[1]}, flash_sale_price={row[2]}, flash_sale_end={row[3]}')
