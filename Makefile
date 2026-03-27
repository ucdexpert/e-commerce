.PHONY: dev prod build stop logs clean help test test-backend test-frontend test-coverage

# Development
dev:
	docker-compose up -d
	@echo "Development started! Frontend: http://localhost:3000 | Backend: http://localhost:8000"

dev-logs:
	docker-compose logs -f

dev-build:
	docker-compose up -d --build

stop:
	docker-compose down

# Production
prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

prod-build:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

prod-stop:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Services
logs:
	docker-compose logs -f $(service)

restart:
	docker-compose restart $(service)

shell-backend:
	docker-compose exec backend bash

shell-frontend:
	docker-compose exec frontend sh

shell-redis:
	docker-compose exec redis redis-cli

# Database
migrate:
	docker-compose exec backend alembic upgrade head

makemigration:
	docker-compose exec backend alembic revision --autogenerate -m "$(msg)"

rollback:
	docker-compose exec backend alembic downgrade -1

migration-history:
	docker-compose exec backend alembic history

local-migrate:
	cd backend && alembic upgrade head

local-makemigration:
	cd backend && alembic revision --autogenerate -m "$(msg)"

local-rollback:
	cd backend && alembic downgrade -1

local-history:
	cd backend && alembic history

# Testing
test:
	@echo "Running all tests..."
	python run_tests.py

test-backend:
	@echo "Running backend tests..."
	cd backend && pytest -v

test-frontend:
	@echo "Running frontend tests..."
	cd frontend && npm test

test-coverage:
	@echo "Running tests with coverage..."
	python run_tests.py --coverage

test-watch:
	@echo "Running frontend tests in watch mode..."
	cd frontend && npm run test:watch

# Cleanup
clean:
	docker-compose down -v
	docker system prune -f

# Help
help:
	@echo "Available commands:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-build    - Build and start development"
	@echo "  make dev-logs     - View all logs"
	@echo "  make stop         - Stop all services"
	@echo "  make prod         - Start production"
	@echo "  make prod-build   - Build and start production"
	@echo "  make logs service=backend  - View service logs"
	@echo "  make restart service=backend - Restart service"
	@echo "  make shell-backend - Enter backend container"
	@echo "  make migrate      - Run DB migrations"
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make test         - Run all tests"
	@echo "  make test-backend - Run backend tests only"
	@echo "  make test-frontend- Run frontend tests only"
	@echo "  make test-coverage- Run tests with coverage"
	@echo "  make test-watch   - Run frontend tests in watch mode"
