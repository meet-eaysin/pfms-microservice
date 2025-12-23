#!/bin/bash

# PFMS Quick Start Script
# Orchestrates full system startup and initialization

set -e

COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_BLUE='\033[0;34m'
COLOR_YELLOW='\033[1;33m'
NC='\033[0m' # No Color

WORKSPACE_ROOT=$(cd "$(dirname "$0")/../../" && pwd)
INFRA_DIR="$WORKSPACE_ROOT/infra"
SCRIPT_DIR="$INFRA_DIR/scripts"

# ============================================
# UTILITY FUNCTIONS
# ============================================

log_info() {
  echo -e "${COLOR_BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${COLOR_GREEN}[✓]${NC} $1"
}

log_error() {
  echo -e "${COLOR_RED}[✗]${NC} $1"
}

log_section() {
  echo ""
  echo -e "${COLOR_BLUE}========================================${NC}"
  echo -e "${COLOR_BLUE}$1${NC}"
  echo -e "${COLOR_BLUE}========================================${NC}"
}

wait_for_service() {
  local service=$1
  local port=$2
  local max_attempts=30
  local attempt=0
  
  log_info "Waiting for $service on port $port..."
  
  while [[ $attempt -lt $max_attempts ]]; do
    if nc -z localhost "$port" 2>/dev/null; then
      log_success "$service is ready"
      return 0
    fi
    
    ((attempt++))
    echo -n "."
    sleep 1
  done
  
  log_error "$service did not start within 30 seconds"
  return 1
}

# ============================================
# SYSTEM CHECKS
# ============================================

log_section "PREFLIGHT CHECKS"

log_info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
  log_error "Docker is not installed"
  exit 1
fi
log_success "Docker found: $(docker --version)"

log_info "Checking Docker Compose..."
if ! docker compose version &> /dev/null; then
  log_error "Docker Compose is not installed"
  exit 1
fi
log_success "Docker Compose found: $(docker compose version | cut -d' ' -f4)"

log_info "Checking environment..."
cd "$WORKSPACE_ROOT"
if [ ! -f .env ]; then
  log_error ".env file not found"
  log_info "Creating .env from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    log_success ".env created (please review and update values)"
  else
    log_error ".env.example not found"
    exit 1
  fi
fi
log_success "Environment file ready"

# ============================================
# CLEANUP EXISTING CONTAINERS
# ============================================

log_section "CLEANUP"

log_info "Removing existing containers..."
docker compose -f "$INFRA_DIR/docker-compose.base.yml" -f "$INFRA_DIR/docker-compose.services.yml" down -v 2>/dev/null || true
log_success "Cleanup complete"

# ============================================
# START INFRASTRUCTURE SERVICES
# ============================================

log_section "STARTING INFRASTRUCTURE SERVICES"

log_info "Starting base infrastructure (PostgreSQL, Redis, RabbitMQ, MongoDB)..."
docker compose -f "$INFRA_DIR/docker-compose.base.yml" up -d

log_success "Infrastructure services started"

# Wait for critical services
wait_for_service "PostgreSQL" 5432
wait_for_service "Redis" 6379
wait_for_service "RabbitMQ" 5672
wait_for_service "MongoDB" 27017

# ============================================
# DATABASE INITIALIZATION
# ============================================

log_section "DATABASE INITIALIZATION"

log_info "Creating PostgreSQL databases..."
sleep 5
docker exec pfms-postgres bash -c "psql -U postgres < /scripts/create-databases.sql" 2>/dev/null || log_error "Database creation may have failed"
log_success "PostgreSQL databases initialized"

log_info "Initializing MongoDB..."
sleep 2
docker exec pfms-mongodb bash -c "mongosh /docker-entrypoint-initdb.d/mongo-init.js" 2>/dev/null || log_error "MongoDB initialization may have failed"
log_success "MongoDB initialized"

log_info "Initializing RabbitMQ..."
sleep 5
if docker exec pfms-rabbitmq bash -c "/scripts/rabbitmq-init.sh" 2>/dev/null; then
  log_success "RabbitMQ initialized"
else
  log_error "RabbitMQ initialization failed"
fi

# ============================================
# START MONITORING SERVICES
# ============================================

log_section "STARTING MONITORING SERVICES"

log_info "Waiting for Prometheus..."
wait_for_service "Prometheus" 9090

log_info "Waiting for Grafana..."
wait_for_service "Grafana" 3100

log_success "Monitoring services started"

# ============================================
# START MICROSERVICES
# ============================================

log_section "STARTING MICROSERVICES"

log_info "Starting all 14 microservices..."
docker compose -f "$INFRA_DIR/docker-compose.base.yml" -f "$INFRA_DIR/docker-compose.services.yml" up -d

log_success "Microservices started"

# Wait for API Gateway
wait_for_service "Kong Gateway" 3000

# ============================================
# HEALTH CHECK
# ============================================

log_section "SYSTEM HEALTH CHECK"

log_info "Running health checks..."
sleep 10

# Check infrastructure
checks_passed=0
checks_total=0

for port in 5432 6379 15672 27017 9090 3100 3000; do
  ((checks_total++))
  if nc -z localhost "$port" 2>/dev/null; then
    ((checks_passed++))
  else
    log_error "Port $port is not accessible"
  fi
done

# Check microservices
for port in {3001..3014}; do
  ((checks_total++))
  if curl -sf "http://localhost:$port/health" > /dev/null 2>&1; then
    ((checks_passed++))
  else
    log_error "Service on port $port is not healthy"
  fi
done

log_info "Health check: $checks_passed/$checks_total services healthy"

# ============================================
# SUMMARY
# ============================================

log_section "STARTUP COMPLETE"

echo ""
echo "========================================"
echo "PFMS System is running!"
echo "========================================"
echo ""
echo "Infrastructure Services:"
echo "  PostgreSQL:  localhost:5432"
echo "  Redis:       localhost:6379"
echo "  RabbitMQ:    localhost:5672"
echo "  MongoDB:     localhost:27017"
echo ""
echo "Monitoring & Administration:"
echo "  Prometheus:  http://localhost:9090"
echo "  Grafana:     http://localhost:3100"
echo "  RabbitMQ UI: http://localhost:15672"
echo "  Kong Admin:  http://localhost:8001"
echo ""
echo "API Gateway:"
echo "  Gateway:     http://localhost:3000"
echo ""
echo "Microservices (Direct Access):"
echo "  Auth (3001)         | User (3002)         | Expense (3003)"
echo "  Income (3004)       | Investment (3005)   | Loan (3006)"
echo "  Group (3007)        | Tax (3008)          | AI (3009)"
echo "  Notification (3010) | Automation (3011)   | Report (3012)"
echo "  Market (3013)       | Savings (3014)"
echo ""
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Review monitoring dashboards:"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3100 (admin/admin)"
echo ""
echo "2. Test the system:"
echo "   - Run integration tests: $SCRIPT_DIR/integration-test.sh"
echo ""
echo "3. View logs:"
echo "   - docker compose -f $INFRA_DIR/docker-compose.base.yml -f $INFRA_DIR/docker-compose.services.yml logs -f [service]"
echo ""
echo "4. Stop the system:"
echo "   - docker compose -f $INFRA_DIR/docker-compose.base.yml -f $INFRA_DIR/docker-compose.services.yml down"
echo ""
