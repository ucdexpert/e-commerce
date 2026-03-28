import httpx

# Test regular products endpoint
r = httpx.get('http://localhost:8000/api/products/')
print(f'Products Status: {r.status_code}')
if r.status_code != 200:
    print(f'Products Response: {r.text[:500]}')
else:
    data = r.json()
    print(f'Products Count: {len(data.get("products", []))}')

# Test flash-sales endpoint
r = httpx.get('http://localhost:8000/api/products/flash-sales')
print(f'\nFlash Sales Status: {r.status_code}')
print(f'Flash Sales Response: {r.text}')
