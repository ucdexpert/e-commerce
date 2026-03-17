---
title: EShop API
emoji: 🛒
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
app_port: 7860
---

# E-Commerce API Backend

Complete E-Commerce API built with FastAPI, featuring:

- 🔐 User authentication with JWT
- 🛍️ Product management with categories
- 🛒 Shopping cart functionality
- 📦 Order processing
- ❤️ Wishlist support
- 🔍 Search capabilities
- 📧 Contact form
- 📊 Admin dashboard
- 🖼️ Image upload
- 📄 PDF invoice generation

## API Documentation

Once deployed, access the interactive API documentation at:
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/health` | Health check |
| `/api/auth/*` | Authentication endpoints |
| `/api/products/*` | Product management |
| `/api/categories/*` | Category management |
| `/api/cart/*` | Shopping cart |
| `/api/orders/*` | Order processing |
| `/api/wishlist/*` | Wishlist |
| `/api/search` | Search products |
| `/api/admin/*` | Admin operations |
| `/api/upload` | File upload |
| `/api/contact` | Contact form |

## Deployment

This API is deployed on Hugging Face Spaces using Docker.
