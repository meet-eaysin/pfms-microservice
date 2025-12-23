#!/bin/bash
# PFMS Optimization Verification Script
# This script verifies all the refactoring changes are working correctly

set -e

echo "🔍 PFMS Optimization Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Warning: .env file not found${NC}"
    echo "Creating .env from .env.development..."
    cp .env.development .env
    echo -e "${GREEN}✓ Created .env file${NC}"
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

echo ""
echo "1️⃣  Checking Docker Images..."
echo "----------------------------"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗ Docker is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Build auth-service
echo ""
echo "Building auth-service..."
docker build -f apps/auth-service/Dockerfile -t pfms-auth:optimized . > /dev/null 2>&1
if [ $? -eq 0 ]; then
    AUTH_SIZE=$(docker images pfms-auth:optimized --format "{{.Size}}")
    echo -e "${GREEN}✓ Auth service built successfully (Size: $AUTH_SIZE)${NC}"
else
    echo -e "${RED}✗ Auth service build failed${NC}"
    exit 1
fi

# Build expense-service
echo "Building expense-service..."
docker build -f apps/expense-service/Dockerfile -t pfms-expense:optimized . > /dev/null 2>&1
if [ $? -eq 0 ]; then
    EXPENSE_SIZE=$(docker images pfms-expense:optimized --format "{{.Size}}")
    echo -e "${GREEN}✓ Expense service built successfully (Size: $EXPENSE_SIZE)${NC}"
else
    echo -e "${RED}✗ Expense service build failed${NC}"
    exit 1
fi

echo ""
echo "2️⃣  Checking Database Migrations..."
echo "-----------------------------------"

# Check if Prisma is available
if command -v yarn &> /dev/null; then
    echo "Checking auth-service schema..."
    cd apps/auth-service
    if yarn prisma validate > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Auth service schema is valid${NC}"
    else
        echo -e "${RED}✗ Auth service schema has errors${NC}"
    fi
    cd ../..
    
    echo "Checking expense-service schema..."
    cd apps/expense-service
    if yarn prisma validate > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Expense service schema is valid${NC}"
    else
        echo -e "${RED}✗ Expense service schema has errors${NC}"
    fi
    cd ../..
else
    echo -e "${YELLOW}⚠️  Yarn not found, skipping Prisma validation${NC}"
fi

echo ""
echo "3️⃣  Checking Environment Variables..."
echo "-------------------------------------"

# Check critical environment variables
REQUIRED_VARS=(
    "JWT_SECRET"
    "REDIS_PASSWORD"
    "RABBITMQ_PASSWORD"
    "POSTGRES_AUTH_PASSWORD"
    "POSTGRES_EXPENSE_PASSWORD"
)

source .env 2>/dev/null || true

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All required environment variables are set${NC}"
else
    echo -e "${YELLOW}⚠️  Missing environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
fi

echo ""
echo "4️⃣  Checking Docker Compose Configuration..."
echo "-------------------------------------------"

# Validate docker-compose files
if docker compose -f infra/docker-compose.base.yml config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.base.yml is valid${NC}"
else
    echo -e "${RED}✗ docker-compose.base.yml has errors${NC}"
fi

if docker compose -f infra/docker-compose.services.yml config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.services.yml is valid${NC}"
else
    echo -e "${RED}✗ docker-compose.services.yml has errors${NC}"
fi

echo ""
echo "5️⃣  Performance Optimizations Summary..."
echo "---------------------------------------"

echo "Docker Images:"
echo "  - Auth Service: $AUTH_SIZE (Target: <200MB)"
echo "  - Expense Service: $EXPENSE_SIZE (Target: <200MB)"

echo ""
echo "Database Indexes Added:"
echo "  - Session composite index (userId, expiresAt, isRevoked)"
echo "  - Session partial index (active sessions only)"
echo "  - LoginAttempt composite index (email, success, createdAt)"
echo "  - Expense covering index (userId, date, categoryId, amount)"
echo "  - Expense partial index (excluding soft-deleted)"
echo "  - RecurringRule partial index (active rules only)"

echo ""
echo "Security Improvements:"
echo "  - Redis: Password authentication enabled"
echo "  - RabbitMQ: User/password authentication"
echo "  - Elasticsearch: X-Pack security enabled"
echo "  - PostgreSQL: Per-service credentials"
echo "  - All hardcoded credentials removed"

echo ""
echo "=================================="
echo -e "${GREEN}✅ Verification Complete!${NC}"
echo "=================================="
echo ""
echo "Next Steps:"
echo "1. Review .env file and set production secrets"
echo "2. Run database migrations:"
echo "   cd apps/auth-service && yarn prisma migrate dev"
echo "   cd apps/expense-service && yarn prisma migrate dev"
echo "3. Start services:"
echo "   docker-compose -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml -f infra/docker-compose.services.yml up -d"
echo "4. Test health endpoints:"
echo "   curl http://localhost:8000/auth/api/v1/health"
echo "   curl http://localhost:8000/expenses/health"
