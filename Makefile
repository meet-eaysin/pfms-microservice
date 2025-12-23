# PFMS Makefile

.PHONY: help install dev build lint test clean docker-up docker-down migrate seed

# Colors
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

# Docker Compose Commands (Simplified)
DC_BASE := docker compose -f infra/docker-compose.base.yml
DC_DEV := $(DC_BASE) -f infra/docker-compose.dev.yml
DC_PROD := $(DC_BASE) -f infra/docker-compose.prod.yml
DC_FULL := $(DC_DEV) -f infra/docker-compose.services.yml

help: ## Show this help message
	@echo "$(GREEN)PFMS Make Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Install dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	yarn install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

dev: ## Start development environment
	@echo "$(YELLOW)Starting development environment...$(NC)"
	$(DC_DEV) up -d
	@echo "$(GREEN)✓ Services started$(NC)"
	@echo "Waiting for services to be ready..."
	@sleep 5
	@yarn dev

dev-services: ## Start only infrastructure services
	@echo "$(YELLOW)Starting infrastructure services...$(NC)"
	$(DC_DEV) up -d
	@echo "$(GREEN)✓ Services started$(NC)"

build: ## Build all packages and services
	@echo "$(YELLOW)Building packages...$(NC)"
	yarn build:packages
	@echo "$(GREEN)✓ Packages built$(NC)"
	@echo "$(YELLOW)Building services...$(NC)"
	yarn build:services
	@echo "$(GREEN)✓ Services built$(NC)"

build-packages: ## Build only packages
	@echo "$(YELLOW)Building packages...$(NC)"
	yarn build:packages
	@echo "$(GREEN)✓ Packages built$(NC)"

build-services: ## Build only services
	@echo "$(YELLOW)Building services...$(NC)"
	yarn build:services
	@echo "$(GREEN)✓ Services built$(NC)"

lint: ## Run linter
	@echo "$(YELLOW)Running ESLint...$(NC)"
	yarn lint

lint-fix: ## Fix linting issues
	@echo "$(YELLOW)Fixing linting issues...$(NC)"
	yarn lint:fix

format: ## Format code with Prettier
	@echo "$(YELLOW)Formatting code...$(NC)"
	yarn format
	@echo "$(GREEN)✓ Code formatted$(NC)"

format-check: ## Check code formatting
	@echo "$(YELLOW)Checking code formatting...$(NC)"
	yarn format:check

check-types: ## Run TypeScript type checking
	@echo "$(YELLOW)Checking types...$(NC)"
	yarn check-types

test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	yarn test

test-watch: ## Run tests in watch mode
	@echo "$(YELLOW)Running tests in watch mode...$(NC)"
	yarn test:watch

test-coverage: ## Generate test coverage report
	@echo "$(YELLOW)Generating test coverage...$(NC)"
	yarn test:coverage

validate: ## Run linter, type check, and tests
	@echo "$(YELLOW)Running validation...$(NC)"
	yarn validate
	@echo "$(GREEN)✓ All validations passed$(NC)"

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	yarn clean
	@echo "$(GREEN)✓ Cleaned$(NC)"

clean-deep: ## Deep clean including node_modules
	@echo "$(YELLOW)Deep cleaning...$(NC)"
	yarn clean:deep
	@echo "$(GREEN)✓ Deep cleaned$(NC)"

docker-up: ## Start Docker services
	@echo "$(YELLOW)Starting Docker services...$(NC)"
	$(DC_DEV) up -d
	@echo "$(GREEN)✓ Docker services started$(NC)"

docker-down: ## Stop Docker services
	@echo "$(YELLOW)Stopping Docker services...$(NC)"
	$(DC_FULL) down
	@echo "$(GREEN)✓ Docker services stopped$(NC)"

docker-logs: ## View Docker service logs
	$(DC_FULL) logs -f

docker-clean: ## Clean Docker environment
	@echo "$(YELLOW)Cleaning Docker environment...$(NC)"
	bash scripts/docker-clean.sh
	@echo "$(GREEN)✓ Docker cleaned$(NC)"

db-migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	yarn db:migrate

db-migrate-dev: ## Run migrations in development mode
	@echo "$(YELLOW)Running migrations in dev mode...$(NC)"
	cd packages/database && npx prisma migrate dev

db-reset: ## Reset database (development only)
	@echo "$(RED)Resetting database...$(NC)"
	cd packages/database && npx prisma migrate reset
	@echo "$(GREEN)✓ Database reset$(NC)"

db-seed: ## Seed database
	@echo "$(YELLOW)Seeding database...$(NC)"
	yarn db:seed

db-studio: ## Open Prisma Studio
	@echo "$(YELLOW)Opening Prisma Studio...$(NC)"
	yarn db:studio

ps: ## Show running containers
	@$(DC_FULL) ps

logs: ## Show service logs
	@$(DC_FULL) logs -f

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
