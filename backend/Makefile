.PHONY: help install build test lint clean dev

help:
	@echo "Quick Notes Backend - Available targets:"
	@echo "  make install     - Install dependencies"
	@echo "  make build       - Build TypeScript"
	@echo "  make test        - Run tests"
	@echo "  make lint        - Run ESLint"
	@echo "  make clean       - Remove dist/"
	@echo "  make dev         - Watch mode (requires manual npm install)"

install:
	npm install

build: install
	npm run build

test: build
	npm test

lint: build
	npm run lint

clean:
	rm -rf dist node_modules

dev:
	npm run dev
