# 🧪 Complete Testing Guide

Comprehensive testing suite for the e-commerce application.

---

## 📋 Overview

This project includes:
- ✅ **Backend Tests** - Pytest for API testing
- ✅ **Frontend Tests** - Jest & React Testing Library
- ✅ **Test Coverage** - Coverage reports for both
- ✅ **CI/CD Integration** - Tests run automatically

---

## 🐍 Backend Testing

### Setup

Tests use a separate test database:

```bash
# Set test database URL
export TEST_DATABASE_URL="postgresql://testuser:testpass@localhost:5432/testdb"
```

### Run Tests

```bash
# All tests
cd backend
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/test_auth.py -v

# Specific test function
pytest tests/test_auth.py::test_login -v

# Watch mode (rerun on changes)
pytest -x --tb=short
```

### Test Structure

```
backend/tests/
├── conftest.py          # Test fixtures & setup
├── test_auth.py         # Authentication tests
├── test_products.py     # Product & category tests
├── test_cart.py         # Cart functionality tests
├── test_orders.py       # Order processing tests
└── test_admin.py        # Admin panel tests
```

### Fixtures

Available fixtures in `conftest.py`:

- `client` - TestClient instance
- `db` - Database session
- `auth_headers` - Authenticated headers (regular user)
- `admin_headers` - Authenticated headers (admin user)

### Example Test

```python
def test_login(client):
    # Register first
    client.post("/api/auth/register", json={
        "email": "test@test.com",
        "password": "Test123!",
        "username": "testuser"
    })
    
    # Login
    response = client.post("/api/auth/login", json={
        "email": "test@test.com",
        "password": "Test123!"
    })
    
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

## ⚛️ Frontend Testing

### Setup

Testing dependencies are pre-installed:

```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom jest
```

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage

# Specific test file
npm test -- ProductCard.test.tsx
```

### Test Structure

```
frontend/src/__tests__/
├── components/
│   ├── ProductCard.test.tsx
│   ├── Header.test.tsx
│   └── Cart.test.tsx
├── pages/
│   ├── login.test.tsx
│   └── products.test.tsx
└── utils/
    └── formatPrice.test.ts
```

### Example Test

```tsx
import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 99.99,
  // ... other fields
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/99\.99/)).toBeInTheDocument()
  })
})
```

---

## 🎯 Test Coverage

### Backend Coverage

```bash
# Generate HTML report
pytest --cov=app --cov-report=html

# Open in browser
open htmlcov/index.html  # Mac/Linux
start htmlcov\index.html  # Windows
```

### Frontend Coverage

```bash
# Generate coverage
npm run test:coverage

# Open in browser
open coverage/index.html  # Mac/Linux
start coverage\index.html  # Windows
```

---

## 🔄 CI/CD Integration

Tests run automatically on:
- Every push to `main` or `develop`
- Every pull request
- Manual trigger via GitHub Actions

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI - Test & Lint

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        # ... database setup
    
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: pytest --cov=app
  
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
```

---

## 📊 Test Database

### Setup Test Database

```bash
# PostgreSQL
createdb testdb

# Or using psql
psql -U postgres
CREATE DATABASE testdb;
\q
```

### Teardown

```bash
# Drop all tables after tests
# (handled automatically by conftest.py)
```

---

## 🧪 Writing Tests

### Best Practices

1. **Test One Thing Per Test**
   ```python
   def test_login_success(): ...
   def test_login_wrong_password(): ...
   ```

2. **Use Descriptive Names**
   ```python
   def test_add_to_cart_with_valid_product(): ...
   def test_add_to_cart_with_out_of_stock_product(): ...
   ```

3. **Arrange-Act-Assert Pattern**
   ```python
   def test_example():
       # Arrange
       data = {...}
       
       # Act
       response = client.post("/api/endpoint", json=data)
       
       # Assert
       assert response.status_code == 200
   ```

4. **Test Edge Cases**
   - Empty inputs
   - Invalid data
   - Boundary values
   - Error conditions

5. **Keep Tests Independent**
   - Each test should run alone
   - No shared state
   - Clean database between tests

---

## 🐛 Troubleshooting

### Tests Fail Randomly

**Cause:** Database state issues

**Fix:**
```bash
# Drop and recreate test database
dropdb testdb
createdb testdb

# Run tests again
pytest
```

### Import Errors

**Fix:**
```bash
# Make sure you're in the right directory
cd backend
pytest

# Check PYTHONPATH
export PYTHONPATH=$PYTHONPATH:$(pwd)
```

### Frontend Tests Not Running

**Fix:**
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Coverage Not Showing

**Backend:**
```bash
# Install coverage package
pip install pytest-cov

# Run with coverage
pytest --cov=app
```

**Frontend:**
```bash
# Check jest.config.ts has coverage config
coverageReporters: ['text', 'lcov']
```

---

## 📈 Coverage Goals

| Component | Goal | Current |
|-----------|------|---------|
| Backend API | 80% | - |
| Frontend Components | 70% | - |
| Critical Paths | 100% | - |

### Critical Paths

These must have 100% coverage:
- ✅ Authentication (login, register, 2FA)
- ✅ Payment processing
- ✅ Order creation
- ✅ Cart operations
- ✅ Admin functions

---

## 🎯 Running in Production

### Pre-Deployment Checklist

```bash
# Run all tests
pytest --cov=app
npm test

# Check coverage thresholds
# (configured in pytest.ini and jest.config.ts)

# Run security scan
safety check
npm audit
```

### CI/CD Gates

Tests must pass before:
- ✅ Merging to main
- ✅ Production deployment
- ✅ Creating release

---

## 📚 Resources

- [Pytest Documentation](https://docs.pytest.org)
- [Testing Library](https://testing-library.com)
- [Jest Documentation](https://jestjs.io)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)

---

## 🆘 Support

For testing issues:
1. Check test logs
2. Review test data
3. Verify database connection
4. Check fixture setup

---

**Happy Testing! 🎉**
