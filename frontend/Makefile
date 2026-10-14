.PHONY: help install build test lint clean dev

help:
	@echo "Quick Notes Frontend - Available targets:"
	@echo "  make install     - Install dependencies"
	@echo "  make build       - Build for production"
	@echo "  make test        - Run tests"
	@echo "  make lint        - Run ESLint"
	@echo "  make clean       - Remove dist/ and node_modules"
	@echo "  make dev         - Start dev server"

install:
	npm install

build: install
	npm run build

test: install
	npm test

lint: install
	npm run lint

clean:
	rm -rf dist node_modules

dev:
	npm run dev
