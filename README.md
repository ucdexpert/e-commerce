# E-Commerce Full-Stack Application

A complete A-Z e-commerce web application built with **Next.js 14** (Frontend), **FastAPI** (Backend), **NeonDB** (PostgreSQL Database), and **JWT Authentication**.

## 🚀 Features

### Frontend (Next.js)
- ✅ Modern responsive design with Tailwind CSS
- ✅ Product listing with advanced filters & search
- ✅ Product detail pages with variants
- ✅ Shopping cart (guest & authenticated)
- ✅ Wishlist functionality
- ✅ Checkout with address management
- ✅ Order tracking & history
- ✅ User profile management
- ✅ Authentication (Login/Register)
- ✅ State management with Zustand

### Backend (FastAPI)
- ✅ RESTful API architecture
- ✅ JWT Authentication (Access + Refresh tokens)
- ✅ Product management with categories
- ✅ Cart & Order management
- ✅ Address book
- ✅ Wishlist
- ✅ Search functionality
- ✅ Inventory tracking
- ✅ Review system
- ✅ Coupon system support

### Database (NeonDB/PostgreSQL)
- ✅ Users & Authentication
- ✅ Products with variants
- ✅ Categories (hierarchical)
- ✅ Carts & Cart Items
- ✅ Orders & Order Items
- ✅ Addresses
- ✅ Reviews
- ✅ Wishlist
- ✅ Coupons
- ✅ Inventory Logs

## 📁 Project Structure

```
ecomarce-qwen/
├── backend/
│   ├── app/
│   │   ├── api/           # API Routes
│   │   │   ├── auth.py
│   │   │   ├── products.py
│   │   │   ├── categories.py
│   │   │   ├── cart.py
│   │   │   ├── orders.py
│   │   │   ├── addresses.py
│   │   │   ├── wishlist.py
│   │   │   └── search.py
│   │   ├── core/          # Core utilities
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/        # SQLAlchemy Models
│   │   │   └── models.py
│   │   ├── schemas/       # Pydantic Schemas
│   │   │   └── schemas.py
│   │   └── main.py        # FastAPI App
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── app/           # Next.js App Router
    │   │   ├── (pages)/
    │   │   ├── products/
    │   │   ├── cart/
    │   │   ├── checkout/
    │   │   ├── orders/
    │   │   ├── profile/
    │   │   ├── wishlist/
    │   │   ├── login/
    │   │   └── register/
    │   ├── components/    # React Components
    │   ├── lib/           # Utilities & API
    │   └── store/         # Zustand Store
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL database (NeonDB recommended)

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# cp .env.example .env  # Linux/Mac

# Edit .env and add your NeonDB connection string
# DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require
# SECRET_KEY=your-secret-key-min-32-characters
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

### 3. Run the Application

**Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/api/docs

## 🔑 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/me` | Update current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (with filters) |
| GET | `/api/products/{id}` | Get product by ID |
| GET | `/api/products/slug/{slug}` | Get product by slug |
| GET | `/api/products/search` | Search products |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/{id}` | Update product (admin) |
| DELETE | `/api/products/{id}` | Delete product (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/{id}` | Update cart item |
| DELETE | `/api/cart/items/{id}` | Remove from cart |
| DELETE | `/api/cart` | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List user's orders |
| GET | `/api/orders/{id}` | Get order details |
| POST | `/api/orders` | Create new order |
| POST | `/api/orders/{id}/cancel` | Cancel order |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |

### Addresses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/addresses` | List user's addresses |
| POST | `/api/addresses` | Create address |
| PUT | `/api/addresses/{id}` | Update address |
| DELETE | `/api/addresses/{id}` | Delete address |

### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist` | Get user's wishlist |
| POST | `/api/wishlist/items/{productId}` | Add to wishlist |
| DELETE | `/api/wishlist/items/{id}` | Remove from wishlist |

## 🎨 Features Overview

### Product Features
- Product variants (size, color, etc.)
- Stock management
- Product images gallery
- Product reviews & ratings
- Related products
- Search with autocomplete
- Advanced filtering (price, category, rating, etc.)
- Sorting options

### Cart Features
- Guest cart support
- Cart persistence
- Quantity management
- Stock validation
- Automatic totals calculation
- Free shipping threshold

### Order Features
- Multiple payment methods (Stripe, COD)
- Order status tracking
- Order history
- Invoice generation
- Order cancellation

### User Features
- JWT authentication
- Profile management
- Address book
- Order history
- Wishlist

## 🔐 Security

- Password hashing with bcrypt
- JWT tokens with refresh rotation
- CORS protection
- SQL injection prevention (SQLAlchemy ORM)
- Input validation (Pydantic)

## 📦 Database Schema

The application includes the following tables:
- `users` - User accounts
- `categories` - Product categories (hierarchical)
- `products` - Product catalog
- `product_categories` - Product-Category relationship
- `carts` - Shopping carts
- `cart_items` - Cart items
- `orders` - Customer orders
- `order_items` - Order line items
- `addresses` - User addresses
- `reviews` - Product reviews
- `wishlists` - User wishlists
- `wishlist_items` - Wishlist items
- `coupons` - Discount coupons
- `inventory_logs` - Stock change history

## 🚀 Deployment

### Backend (Railway/Render/Heroku)
```bash
# Set environment variables
DATABASE_URL=your-neondb-url
SECRET_KEY=your-secret-key
CORS_ORIGINS=https://your-frontend-domain.com

# Deploy
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Frontend (Vercel)
```bash
# Set environment variable
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api

# Deploy to Vercel
vercel deploy
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-secret-key-min-32-chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI team for the excellent API framework
- Tailwind CSS for the utility-first CSS framework
- Zustand for simple state management

---

**Built with ❤️ using Next.js and FastAPI**
