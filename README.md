# 🛒 E-Shop — Full-Stack E-Commerce Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-Next.js%2015-black)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791)

A complete, production-ready e-commerce platform built with modern technologies.

## 🌐 Live Demo

- **Frontend**: https://e-commerce-mu-wheat-87.vercel.app
- **Backend API**: https://uzair001-e-shop.hf.space
- **API Docs**: https://uzair001-e-shop.hf.space/api/docs

## ✨ Features

### Customer Features

- 🔐 JWT Auth + Google OAuth + 2FA
- 🛍️ Product browsing with filters and search
- 🛒 Shopping cart with guest support
- 💳 Multiple payment methods (Stripe, JazzCash, EasyPaisa, COD)
- 📦 Order tracking with real-time updates
- ❤️ Wishlist management
- ⭐ Product reviews and ratings
- 🔄 Product comparison
- 👥 Referral program
- 📧 Email notifications
- 💬 Live chat support

### Admin Features

- 📊 Analytics dashboard with charts
- 📦 Product and inventory management
- 🏷️ Category management
- 👥 User management with RBAC
- 🎟️ Coupon management
- 📋 Order management
- 📮 Return management
- 🚚 Shipping configuration
- 📰 Newsletter management
- 🔍 SEO settings

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Zustand |
| Backend | FastAPI, Python 3.11, SQLAlchemy 2.0 |
| Database | PostgreSQL (NeonDB) |
| Cache | Redis (Upstash) |
| Auth | JWT + Google OAuth (NextAuth) |
| Payments | Stripe, JazzCash, EasyPaisa |
| Images | Cloudinary |
| Email | SendGrid |
| SMS | Twilio |
| Monitoring | Sentry, Prometheus |
| Deployment | Vercel + Hugging Face Spaces |
| CI/CD | GitHub Actions |
| Container | Docker + Docker Compose |

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose (optional)
- PostgreSQL (or NeonDB account)

### Option 1: Docker (Recommended)

```bash
# Clone repo
git clone https://github.com/yourusername/eshop.git
cd eshop

# Copy environment files
cp .env.docker backend/.env
cp .env.docker frontend/.env.local
# Edit .env files with your values

# Start everything
make dev

# Or without Make:
docker-compose up -d

# View logs
docker-compose logs -f

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/api/docs
# Nginx: http://localhost:80
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your values

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)

See `backend/.env.example` for all required variables.

Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret (min 32 chars)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `SENDGRID_API_KEY` - SendGrid API key
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name

### Frontend (.env.local)

See `frontend/.env.example` for all required variables.

Key variables:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key

## 📦 Deployment

### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set root directory to `frontend/`
3. Add environment variables
4. Deploy

### Backend → Hugging Face Spaces

1. Create new Space (Docker SDK)
2. Push backend code
3. Add environment variables in Space Settings
4. App deploys automatically

### CI/CD (GitHub Actions)

Automatic on push to `main`:

- Tests run on every push
- Frontend deploys to Vercel
- Backend deploys to Hugging Face
- Docker images pushed to GitHub Container Registry

## 🐳 Docker Commands

```bash
# Development
docker-compose up -d              # Start all services
docker-compose logs -f            # View logs
docker-compose down               # Stop all
docker-compose down -v            # Stop and remove volumes

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Useful shortcuts with Make
make dev                          # Start development
make stop                         # Stop all
make shell-backend                # Enter backend container
make migrate                      # Run DB migrations
make logs service=backend         # View service logs
```

## 🗄️ Database Migrations

```bash
# Apply migrations
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "description"

# Rollback
alembic downgrade -1
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm test

# With coverage
npm run test:coverage
```

## 📊 API Documentation

Full API docs available at:

- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 📧 Contact

For support or queries, please contact the development team.
