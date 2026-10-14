.PHONY: help install build test lint clean dev docker-up docker-down

help:
	@echo "Quick Notes - Project targets:"
	@echo "  make install     - Install dependencies (backend + frontend)"
	@echo "  make build       - Build both backend and frontend"
	@echo "  make test        - Run tests (backend + frontend)"
	@echo "  make lint        - Run linters (backend + frontend)"
	@echo "  make clean       - Clean all build artifacts"
	@echo "  make dev         - Start dev servers (backend + frontend)"
	@echo "  make docker-up   - Start LocalStack"
	@echo "  make docker-down - Stop LocalStack"
	@echo ""
	@echo "Working directories:"
	@echo "  Backend:  ./backend (Node.js + Express + DynamoDB)"
	@echo "  Frontend: ./frontend (React + TypeScript)"

install:
	@echo "Installing backend..."
	cd backend && npm install
	@echo "Installing frontend..."
	cd frontend && npm install

build: install
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build

test: build
	@echo "Testing backend..."
	cd backend && npm test
	@echo "Testing frontend..."
	cd frontend && npm test

lint: build
	@echo "Linting backend..."
	cd backend && npm run lint
	@echo "Linting frontend..."
	cd frontend && npm run lint

clean:
	@echo "Cleaning backend..."
	cd backend && make clean || true
	@echo "Cleaning frontend..."
	cd frontend && make clean || true
	@echo "Clean complete"

dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:3000"
	@echo "Frontend will run on http://localhost:5173"
	@echo ""
	cd backend && npm run dev &
	cd frontend && npm run dev

docker-up:
	docker-compose up -d
	@echo "LocalStack started. DynamoDB available at http://localhost:4566"

docker-down:
	docker-compose down

.DEFAULT_GOAL := help
