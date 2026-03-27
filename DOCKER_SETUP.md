# 🐳 Docker Setup Guide - E-Commerce Project

Complete Docker setup for development and production deployment.

---

## 📋 What's Included

- ✅ **Backend** - FastAPI with auto-reload for development
- ✅ **Frontend** - Next.js 14 with hot reload
- ✅ **Redis** - Caching layer with persistence
- ✅ **Nginx** - Reverse proxy with rate limiting
- ✅ **Health Checks** - Automatic container monitoring
- ✅ **Volume Mounts** - Persistent data storage
- ✅ **Network Isolation** - Secure container communication

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed
- Docker Compose installed
- Git installed

### Development Setup (One Command!)

```bash
# Clone and start
git clone <your-repo>
cd ecomarce-qwen
make dev
```

That's it! Your entire stack is now running:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Nginx**: http://localhost:80

---

## 📁 File Structure

```
ecomarce-qwen/
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── Makefile                     # Quick commands
├── .env.docker                  # Environment template
├── backend/
│   ├── Dockerfile              # Production backend
│   ├── Dockerfile.dev          # Development backend
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Production frontend
│   ├── Dockerfile.dev          # Development frontend
│   └── .dockerignore
└── nginx/
    ├── nginx.dev.conf          # Development config
    └── nginx.prod.conf         # Production config
```

---

## 🔧 Common Commands

### Development

```bash
make dev              # Start all services
make dev-build        # Rebuild and start
make dev-logs         # View all logs
make stop             # Stop all services
```

### Production

```bash
make prod             # Start production stack
make prod-build       # Build and start production
make prod-stop        # Stop production stack
```

### Service Management

```bash
make logs service=backend    # View backend logs
make restart service=redis   # Restart Redis
make shell-backend           # SSH into backend
make shell-frontend          # SSH into frontend
make shell-redis             # Redis CLI
```

### Database

```bash
make migrate          # Run database migrations
make makemigration msg="add column"  # Create new migration
```

### Cleanup

```bash
make clean            # Remove all containers and volumes
```

---

## 🔐 Environment Variables

### Backend (.env)

```bash
# Copy template
cp .env.docker backend/.env

# Edit with your values:
# - DATABASE_URL
# - SECRET_KEY
# - REDIS_URL
# - CLOUDINARY credentials
# - STRIPE keys
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

---

## 🏗️ Architecture

```
┌─────────────┐
│   Nginx     │ :80 / :443
│  (Reverse   │
│   Proxy)    │
└──────┬──────┘
       │
   ┌───┴────┐
   │        │
┌──▼────┐  ┌▼────────┐
│Backend│  │Frontend │
│:8000  │  │:3000    │
└───┬───┘  └─────────┘
    │
┌───▼────┐
│ Redis  │
│:6379   │
└────────┘
```

---

## 🔒 Security Features

- ✅ Non-root user in containers
- ✅ Network isolation
- ✅ Rate limiting (10 req/s for API, 5/min for auth)
- ✅ Security headers via Nginx
- ✅ Health checks for all services
- ✅ Resource limits in production

---

## 📊 Resource Allocation

### Production Limits

| Service | CPU | Memory |
|---------|-----|--------|
| Backend | 0.5 | 512MB |
| Frontend | 0.5 | 512MB |
| Redis | - | 256MB |

---

## 🔍 Troubleshooting

### Container won't start

```bash
# Check logs
make logs service=backend

# Rebuild
make dev-build
```

### Database connection error

```bash
# Check DATABASE_URL in .env
# Ensure Redis is running
make logs service=redis
```

### Port already in use

```bash
# Stop conflicting services
docker stop $(docker ps -q)

# Or change ports in docker-compose.yml
```

### Permission issues

```bash
# Fix ownership
sudo chown -R $(whoami) backend frontend
```

---

## 🎯 Production Deployment

### 1. Prepare Server

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Deploy

```bash
# Clone repo
git clone <your-repo>
cd ecomarce-qwen

# Setup environment
cp .env.docker backend/.env.production
# Edit .env.production with production values

# Start production
make prod-build
```

### 3. SSL Certificate (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --webroot -w ./nginx/certbot_www -d yourdomain.com

# Restart Nginx
docker-compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
```

---

## 📈 Monitoring

### View Logs

```bash
# All services
make dev-logs

# Specific service
make logs service=backend
```

### Health Check

```bash
# Backend
curl http://localhost:8000/api/health

# Frontend
curl http://localhost:3000

# Redis
docker exec eshop_redis redis-cli ping
```

---

## 🚀 Scaling

### Horizontal Scaling

```bash
# Scale backend to 3 instances
docker-compose up -d --scale backend=3
```

### Resource Limits

Edit `docker-compose.prod.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1024M
```

---

## 💡 Tips

1. **Always use `make` commands** for consistency
2. **Check logs first** when debugging
3. **Use `.env.docker` as template** - never commit actual .env files
4. **Run `make clean`** before fresh deployment
5. **Test locally** with `make dev` before production deploy

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [Nginx Documentation](https://nginx.org/en/docs)

---

## 🆘 Support

For issues or questions:
1. Check logs: `make logs`
2. Review this guide
3. Check Docker documentation
4. Open GitHub issue

---

**Made with ❤️ for seamless deployments**
