from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.product import Product
from app.models.user import User
import csv
import io
import re
from datetime import datetime

router = APIRouter(prefix="/bulk", tags=["Bulk Operations"])


@router.get("/products/export")
async def export_products_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Export all products to CSV file"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    products = db.query(Product).all()

    output = io.StringIO()
    writer = csv.writer(output)

    # Headers
    writer.writerow([
        'id', 'name', 'slug', 'description', 'short_description',
        'price', 'compare_price', 'cost', 'sku', 'barcode',
        'stock_quantity', 'low_stock_threshold', 'is_active',
        'is_featured', 'is_on_sale', 'weight', 'rating',
        'review_count', 'sold_count', 'created_at'
    ])

    for p in products:
        writer.writerow([
            p.id, p.name, p.slug, p.description, p.short_description,
            p.price, p.compare_price, p.cost, p.sku, p.barcode,
            p.stock_quantity, p.low_stock_threshold, p.is_active,
            p.is_featured, p.is_on_sale, p.weight, p.rating,
            p.review_count, p.sold_count, p.created_at
        ])

    output.seek(0)
    filename = f"products_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/products/import")
async def import_products_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Import products from CSV file"""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode('utf-8')))

    created = 0
    updated = 0
    errors = []

    for i, row in enumerate(reader):
        try:
            sku = row.get('sku', '').strip()
            if not sku:
                errors.append(f"Row {i+2}: SKU is required")
                continue

            existing = db.query(Product).filter(Product.sku == sku).first()

            # Generate slug if not provided
            name = row.get('name', '').strip()
            slug = row.get('slug', '').strip()
            if not slug and name:
                slug = re.sub(r'[^a-z0-9-]', '-', name.lower())
                slug = re.sub(r'-+', '-', slug).strip('-')

            product_data = {
                'name': name,
                'slug': slug,
                'description': row.get('description', '').strip(),
                'short_description': row.get('short_description', '').strip() or name[:100] if name else '',
                'price': float(row.get('price', 0) or 0),
                'compare_price': float(row['compare_price']) if row.get('compare_price') else None,
                'cost': float(row.get('cost', 0) or 0),
                'sku': sku,
                'barcode': row.get('barcode', sku),
                'stock_quantity': int(row.get('stock_quantity', 0) or 0),
                'low_stock_threshold': int(row.get('low_stock_threshold', 10) or 10),
                'is_active': str(row.get('is_active', 'true')).lower() == 'true',
                'is_featured': str(row.get('is_featured', 'false')).lower() == 'true',
                'is_on_sale': str(row.get('is_on_sale', 'false')).lower() == 'true',
                'weight': float(row['weight']) if row.get('weight') else None,
            }

            if existing:
                # Update existing product
                for k, v in product_data.items():
                    setattr(existing, k, v)
                updated += 1
            else:
                # Create new product
                product_data['images'] = '[]'
                product_data['attributes'] = '{}'
                product_data['variants'] = '{}'
                product_data['dimensions'] = '{}'
                product = Product(**product_data)
                db.add(product)
                created += 1

        except Exception as e:
            errors.append(f"Row {i+2}: {str(e)}")

    db.commit()

    return {
        "message": f"Import complete: {created} created, {updated} updated",
        "created": created,
        "updated": updated,
        "errors": errors
    }
