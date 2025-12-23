#!/bin/bash

# PFMS Setup Script
# This script sets up the development environment

set -e

echo "======================================"
echo "PFMS Development Environment Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) is installed${NC}"

# Check Yarn
if ! command -v yarn &> /dev/null; then
    echo -e "${RED}Yarn is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Yarn $(yarn --version) is installed${NC}"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose $(docker-compose --version) is installed${NC}"

# Create .env.local if it doesn't exist
echo -e "\n${YELLOW}Setting up environment...${NC}"
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✓ Created .env.local from .env.example${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# Create .npmrc if it doesn't exist
if [ ! -f .npmrc ]; then
    cat > .npmrc <<EOF
@pfms:registry=http://localhost:4873/
legacy-peer-deps=true
EOF
    echo -e "${GREEN}✓ Created .npmrc${NC}"
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
yarn install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Start Docker services
echo -e "\n${YELLOW}Starting Docker services...${NC}"
docker-compose -f infra/docker-compose.dev.yml up -d
echo -e "${GREEN}✓ Docker services started${NC}"

# Wait for services to be ready
echo -e "\n${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Run database migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
docker-compose -f infra/docker-compose.dev.yml exec postgres psql -U postgres -d pfms_dev -c "\
CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";
CREATE EXTENSION IF NOT EXISTS \"pg_trgm\";
CREATE EXTENSION IF NOT EXISTS \"btree_gist\";
CREATE EXTENSION IF NOT EXISTS \"citext\";
"
echo -e "${GREEN}✓ Database extensions created${NC}"

# Build packages
echo -e "\n${YELLOW}Building packages...${NC}"
yarn build:packages
echo -e "${GREEN}✓ Packages built${NC}"

# Final instructions
echo -e "\n${GREEN}======================================"
echo "Setup completed successfully!"
echo "=====================================${NC}"
echo ""
echo "Next steps:"
echo "1. Start development servers:"
echo "   ${YELLOW}yarn dev${NC}"
echo ""
echo "2. Open your browser:"
echo "   - API: http://localhost:8000"
echo "   - Kong Admin: http://localhost:8001"
echo "   - Grafana: http://localhost:3001"
echo "   - RabbitMQ: http://localhost:15672"
echo "   - MinIO: http://localhost:9001"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo ""
echo "3. Check service status:"
echo "   ${YELLOW}docker-compose -f infra/docker-compose.dev.yml ps${NC}"
echo ""
echo "4. View logs:"
echo "   ${YELLOW}yarn docker:logs${NC}"
echo ""
