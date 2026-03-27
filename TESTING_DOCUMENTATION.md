# 🧪 Complete Testing Documentation

Comprehensive testing suite for the E-Shop e-commerce platform.

---

## 📋 Overview

This project includes a complete testing setup:

- ✅ **Backend Tests** - 66+ tests using Pytest
- ✅ **Frontend Tests** - Component tests using Jest & React Testing Library
- ✅ **Test Coverage** - HTML coverage reports
- ✅ **CI/CD Integration** - Tests run automatically on GitHub Actions

---

## 🚀 Quick Start

### Run All Tests

```bash
# From project root
python run_tests.py

# Or using Make
make test
```

### Run with Coverage

```bash
# With coverage report
python run_tests.py --coverage

# Or using Make
make test-coverage
```

---

## 🐍 Backend Testing

### Setup

Backend tests use a separate test database. Configure via environment:

```bash
export TEST_DATABASE_URL="postgresql://testuser:testpass@localhost:5432/testdb"
```

### Run Tests

```bash
cd backend

# All tests
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
├── test_auth.py         # Authentication tests (9 tests)
├── test_products.py     # Product & category tests (14 tests)
├── test_cart.py         # Cart functionality tests (8 tests)
├── test_orders.py       # Order processing tests (11 tests)
├── test_admin.py        # Admin panel tests (14 tests)
└── test_categories.py   # Category CRUD tests (10 tests)
```

### Available Fixtures

| Fixture | Description |
|---------|-------------|
| `client` | TestClient for API requests |
| `db` | Database session |
| `auth_headers` | Authenticated headers (regular user) |
| `admin_headers` | Admin authenticated headers |

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

### Test Coverage Report

```bash
# Generate HTML report
pytest --cov=app --cov-report=html

# Open in browser
# Windows:
start htmlcov\index.html
# Mac/Linux:
open htmlcov/index.html
```

---

## ⚛️ Frontend Testing

### Setup

Testing dependencies are pre-configured:

- Jest - Test runner
- React Testing Library - React testing utilities
- Jest DOM - DOM matchers

### Run Tests

```bash
cd frontend

# All tests
npm test

# Watch mode (reruns on changes)
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

### Coverage Report

```bash
# Generate coverage
npm run test:coverage

# Open report
# Windows:
start coverage\index.html
# Mac/Linux:
open coverage/index.html
```

---

## 📊 Test Coverage Summary

### Backend Tests

| Category | Tests | Status |
|----------|-------|--------|
| Authentication | 9 | ✅ |
| Products | 14 | ✅ |
| Cart | 8 | ✅ |
| Orders | 11 | ✅ |
| Admin | 14 | ✅ |
| Categories | 10 | ✅ |
| **Total** | **66** | **✅** |

### Frontend Tests

| Component | Tests | Status |
|-----------|-------|--------|
| ProductCard | 10 | ✅ |
| Header | 5 | ✅ |
| Login Page | 6 | ✅ |
| Utils | 5 | ✅ |
| **Total** | **26** | **✅** |

### Overall

- **Total Tests: 92**
- **Estimated Coverage: 75%+**

---

## 🔄 CI/CD Integration

Tests run automatically on:

1. **Every Push** to `main` or `develop`
2. **Pull Requests**
3. **Manual Trigger** via GitHub Actions

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

## 🎯 Writing Tests

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
| Backend API | 80% | 75%+ |
| Frontend Components | 70% | 70%+ |
| Critical Paths | 100% | 90%+ |

### Critical Paths

These must have 100% coverage:
- ✅ Authentication (login, register, 2FA)
- ✅ Payment processing
- ✅ Order creation
- ✅ Cart operations
- ✅ Admin functions

---

## 🛠️ Makefile Commands

```bash
# Run all tests
make test

# Run backend tests only
make test-backend

# Run frontend tests only
make test-frontend

# Run with coverage
make test-coverage

# Run frontend tests in watch mode
make test-watch
```

---

## 📚 Resources

- [Pytest Documentation](https://docs.pytest.org)
- [Testing Library](https://testing-library.com)
- [Jest Documentation](https://jestjs.io)
- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)

---

## 🆘 Support

For testing issues:
1. Check test logs
2. Review test data
3. Verify database connection
4. Check fixture setup

---

**Happy Testing! 🎉**
