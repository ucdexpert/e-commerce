import httpx

r = httpx.get('http://localhost:8000/api/products/flash-sales')
print(f'Status: {r.status_code}')
print(f'Response: {r.text}')
