# ==============================================================================
# PFMS Makefile - Production-Ready Commands
# ==============================================================================

.PHONY: help install dev build lint test clean docker-up docker-down migrate seed

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

# Docker Compose files
DC_BASE := docker compose -f infra/docker-compose.base.yml
DC_DEV := $(DC_BASE) -f infra/docker-compose.dev.yml
DC_PROD := $(DC_BASE) -f infra/docker-compose.prod.yml
DC_FULL := $(DC_DEV) -f infra/docker-compose.services.yml

# ==============================================================================
# Help & Documentation
# ==============================================================================

help: ## Show this help message
	@echo "$(GREEN)╔═══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(GREEN)║           PFMS - Personal Financial Management System         ║$(NC)"
	@echo "$(GREEN)╚═══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(BLUE)Available Commands:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-25s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  make install          # Install dependencies"
	@echo "  make dev              # Start development environment"
	@echo "  make test-coverage    # Run tests with coverage report"
	@echo "  make docker-up        # Start all Docker services"
	@echo ""

# ==============================================================================
# Installation & Setup
# ==============================================================================

install: ## Install all dependencies
	@echo "$(YELLOW)📦 Installing dependencies...$(NC)"
	@yarn install --immutable
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

install-ci: ## Install dependencies for CI (frozen lockfile)
	@echo "$(YELLOW)📦 Installing CI dependencies...$(NC)"
	@yarn install --immutable --inline-builds
	@echo "$(GREEN)✓ CI dependencies installed$(NC)"

setup: ## Complete project setup (install + init DBs)
	@echo "$(YELLOW)🔧 Running full setup...$(NC)"
	@bash scripts/setup.sh
	@echo "$(GREEN)✓ Setup complete$(NC)"

# ==============================================================================
# Development
# ==============================================================================

dev: ## Start development environment (infra + watch mode)
	@echo "$(YELLOW)🚀 Starting development environment...$(NC)"
	@$(DC_DEV) up -d
	@sleep 3
	@yarn dev

dev-services: ## Start only infrastructure services
	@echo "$(YELLOW)🔧 Starting infrastructure services...$(NC)"
	@$(DC_DEV) up -d
	@echo "$(GREEN)✓ Infrastructure services started$(NC)"
	@echo "$(BLUE)Run 'make logs' to view logs$(NC)"

dev-stop: ## Stop development services
	@echo "$(YELLOW)🛑 Stopping development services...$(NC)"
	@$(DC_DEV) down
	@echo "$(GREEN)✓ Services stopped$(NC)"

# ==============================================================================
# Building
# ==============================================================================

build: ## Build all packages and services
	@echo "$(YELLOW)🔨 Building all packages and services...$(NC)"
	@yarn turbo run build --concurrency=4
	@echo "$(GREEN)✓ Build complete$(NC)"

build-packages: ## Build only shared packages
	@echo "$(YELLOW)🔨 Building packages...$(NC)"
	@yarn build:packages
	@echo "$(GREEN)✓ Packages built$(NC)"

build-services: ## Build only microservices
	@echo "$(YELLOW)🔨 Building services...$(NC)"
	@yarn build:services
	@echo "$(GREEN)✓ Services built$(NC)"

# ==============================================================================
# Code Quality
# ==============================================================================

lint: ## Run linter on all code
	@echo "$(YELLOW)🔍 Running linter...$(NC)"
	@yarn lint

lint-fix: ## Fix linting issues automatically
	@echo "$(YELLOW)🔧 Fixing linting issues...$(NC)"
	@yarn lint:fix
	@echo "$(GREEN)✓ Linting complete$(NC)"

format: ## Format code with Prettier
	@echo "$(YELLOW)✨ Formatting code...$(NC)"
	@yarn format
	@echo "$(GREEN)✓ Code formatted$(NC)"

format-check: ## Check code formatting
	@echo "$(YELLOW)🔍 Checking code formatting...$(NC)"
	@yarn format:check

check-types: ## Run TypeScript type checking
	@echo "$(YELLOW)🔍 Checking TypeScript types...$(NC)"
	@yarn check-types

# ==============================================================================
# Testing
# ==============================================================================

test: ## Run all tests
	@echo "$(YELLOW)🧪 Running tests...$(NC)"
	@yarn test

test-unit: ## Run unit tests only
	@echo "$(YELLOW)🧪 Running unit tests...$(NC)"
	@yarn test:unit

test-integration: ## Run integration tests
	@echo "$(YELLOW)🧪 Running integration tests...$(NC)"
	@yarn test:integration

test-e2e: ## Run end-to-end tests
	@echo "$(YELLOW)🧪 Running E2E tests...$(NC)"
	@yarn test:e2e

test-watch: ## Run tests in watch mode
	@echo "$(YELLOW)🧪 Running tests in watch mode...$(NC)"
	@yarn test:watch

test-coverage: ## Generate test coverage report
	@echo "$(YELLOW)📊 Generating test coverage...$(NC)"
	@yarn test:coverage
	@echo "$(GREEN)✓ Coverage report generated in coverage/$(NC)"

test-ci: ## Run tests for CI/CD
	@echo "$(YELLOW)🧪 Running CI tests...$(NC)"
	@yarn test:ci

# ==============================================================================
# Validation
# ==============================================================================

validate: ## Run all validation checks (lint + types + tests)
	@echo "$(YELLOW)🔍 Running full validation...$(NC)"
	@yarn validate
	@echo "$(GREEN)✓ All validations passed$(NC)"

validate-ci: ## Run validation for CI (strict mode)
	@echo "$(YELLOW)🔍 Running CI validation...$(NC)"
	@make lint
	@make check-types
	@make test-ci
	@echo "$(GREEN)✓ CI validation passed$(NC)"

# ==============================================================================
# Cleaning
# ==============================================================================

clean: ## Clean build artifacts and caches
	@echo "$(YELLOW)🧹 Cleaning build artifacts...$(NC)"
	@yarn turbo run clean
	@rm -rf .turbo
	@echo "$(GREEN)✓ Clean complete$(NC)"

clean-deep: ## Deep clean (including node_modules)
	@echo "$(RED)⚠️  Deep cleaning (this may take a while)...$(NC)"
	@yarn clean:deep
	@echo "$(GREEN)✓ Deep clean complete$(NC)"

clean-docker: ## Clean Docker environment
	@echo "$(YELLOW)🐳 Cleaning Docker environment...$(NC)"
	@bash scripts/docker-clean.sh
	@echo "$(GREEN)✓ Docker cleaned$(NC)"

# ==============================================================================
# Docker Operations
# ==============================================================================

docker-up: ## Start all Docker services
	@echo "$(YELLOW)🐳 Starting Docker services...$(NC)"
	@$(DC_DEV) up -d
	@echo "$(GREEN)✓ Docker services started$(NC)"
	@make ps

docker-down: ## Stop all Docker services
	@echo "$(YELLOW)🐳 Stopping Docker services...$(NC)"
	@$(DC_FULL) down
	@echo "$(GREEN)✓ Docker services stopped$(NC)"

docker-restart: ## Restart Docker services
	@make docker-down
	@make docker-up

docker-logs: ## View Docker service logs
	@$(DC_FULL) logs -f

docker-ps: ps ## Show running Docker containers

docker-build: ## Build Docker images for all services
	@echo "$(YELLOW)🐳 Building Docker images...$(NC)"
	@$(DC_FULL) build --parallel
	@echo "$(GREEN)✓ Docker images built$(NC)"

docker-pull: ## Pull latest Docker images
	@echo "$(YELLOW)🐳 Pulling latest images...$(NC)"
	@$(DC_FULL) pull
	@echo "$(GREEN)✓ Images pulled$(NC)"

# ==============================================================================
# Database Operations
# ==============================================================================

db-migrate: ## Run database migrations for all services
	@echo "$(YELLOW)📊 Running database migrations...$(NC)"
	@yarn db:migrate
	@echo "$(GREEN)✓ Migrations complete$(NC)"

db-seed: ## Seed database with sample data
	@echo "$(YELLOW)🌱 Seeding database...$(NC)"
	@yarn db:seed
	@echo "$(GREEN)✓ Database seeded$(NC)"

db-reset: ## Reset database (development only!)
	@echo "$(RED)⚠️  Resetting database (ALL DATA WILL BE LOST)...$(NC)"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		yarn db:reset; \
		echo "$(GREEN)✓ Database reset$(NC)"; \
	else \
		echo "$(YELLOW)Database reset cancelled$(NC)"; \
	fi

db-studio: ## Open Prisma Studio
	@echo "$(YELLOW)🎨 Opening Prisma Studio...$(NC)"
	@yarn db:studio

db-backup: ## Backup all databases
	@echo "$(YELLOW)💾 Backing up databases...$(NC)"
	@bash scripts/backup.sh
	@echo "$(GREEN)✓ Backup complete$(NC)"

db-restore: ## Restore databases from backup
	@echo "$(YELLOW)📥 Restoring databases...$(NC)"
	@bash scripts/restore.sh
	@echo "$(GREEN)✓ Restore complete$(NC)"

# ==============================================================================
# Monitoring & Health
# ==============================================================================

health: ## Check health of all services
	@bash scripts/health-check.sh

logs: ## View logs from all services
	@$(DC_FULL) logs -f

ps: ## Show running containers
	@$(DC_FULL) ps

stats: ## Show container resource usage
	@docker stats --no-stream

# ==============================================================================
# Production
# ==============================================================================

prod-up: ## Start production environment
	@echo "$(YELLOW)🚀 Starting production environment...$(NC)"
	@$(DC_PROD) up -d
	@echo "$(GREEN)✓ Production services started$(NC)"

prod-down: ## Stop production environment
	@$(DC_PROD) down

prod-logs: ## View production logs
	@$(DC_PROD) logs -f

prod-deploy: ## Deploy to production (requires proper setup)
	@echo "$(YELLOW)🚀 Deploying to production...$(NC)"
	@echo "$(RED)⚠️  Not implemented. Set up deployment pipeline.$(NC)"

# ==============================================================================
# API Gateway
# ==============================================================================

gateway-validate: ## Validate Kong configuration
	@yarn gateway:validate

gateway-sync: ## Sync Kong configuration
	@yarn gateway:sync

gateway-diff: ## Show diff of Kong configuration
	@yarn gateway:diff

# ==============================================================================
# Utilities
# ==============================================================================

version: ## Show version information
	@echo "$(BLUE)PFMS Version:$(NC) 1.0.0"
	@echo "$(BLUE)Node:$(NC) $$(node --version)"
	@echo "$(BLUE)Yarn:$(NC) $$(yarn --version)"
	@echo "$(BLUE)Docker:$(NC) $$(docker --version)"

deps-update: ## Update dependencies (interactive)
	@echo "$(YELLOW)📦 Updating dependencies...$(NC)"
	@yarn upgrade-interactive

deps-outdated: ## Check for outdated dependencies
	@echo "$(YELLOW)📦 Checking outdated dependencies...$(NC)"
	@yarn outdated

security-check: ## Run security audit
	@echo "$(YELLOW)🔒 Running security audit...$(NC)"
	@yarn npm audit --all --recursive

quick-start: ## Quick start (install + docker + dev)
	@make install
	@make docker-up
	@sleep 5
	@make dev

.DEFAULT_GOAL := help

setup: ## Full setup (install, Docker, migrations)
	@bash scripts/setup.sh

# Production targets
prod-build: ## Build for production
	@echo "$(YELLOW)Building for production...$(NC)"
	NODE_ENV=production yarn build
	@echo "$(GREEN)✓ Production build complete$(NC)"

prod-docker-build: ## Build Docker images for production
	@echo "$(YELLOW)Building Docker images for production...$(NC)"
	$(DC_PROD) build
	@echo "$(GREEN)✓ Docker images built$(NC)"

prod-docker-up: ## Start production Docker environment
	@echo "$(YELLOW)Starting production environment...$(NC)"
	$(DC_PROD) up -d
	@echo "$(GREEN)✓ Production environment started$(NC)"

prod-docker-down: ## Stop production Docker environment
	@echo "$(YELLOW)Stopping production environment...$(NC)"
	$(DC_PROD) down
	@echo "$(GREEN)✓ Production environment stopped$(NC)"

# Development helpers
watch: ## Start services and watch for changes
	@make dev-services
	@yarn dev

logs-auth: ## View auth service logs
	@$(DC_FULL) logs -f auth-service

logs-expense: ## View expense service logs
	@$(DC_FULL) logs -f expense-service

logs-rabbitmq: ## View RabbitMQ logs
	@$(DC_DEV) logs -f rabbitmq

logs-postgres: ## View PostgreSQL logs
	@$(DC_BASE) logs -f postgres-expense

# Utilities
version: ## Show version info
	@echo "Node: $$(node --version)"
	@echo "Yarn: $$(yarn --version)"
	@echo "Docker: $$(docker --version)"
	@echo "Docker Compose: $$(docker compose version)"

init: install dev-services db-migrate db-seed ## Initialize everything

.DEFAULT_GOAL := help
