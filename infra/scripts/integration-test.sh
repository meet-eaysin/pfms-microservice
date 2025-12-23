#!/bin/bash

# PFMS Integration Test Script
# Tests all services and verifies system integrity

set -e

COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
NC='\033[0m' # No Color

GATEWAY_URL="http://localhost:3000"
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# ============================================
# UTILITY FUNCTIONS
# ============================================

log_info() {
  echo -e "${COLOR_BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${COLOR_GREEN}[✓]${NC} $1"
  ((PASSED_TESTS++))
}

log_error() {
  echo -e "${COLOR_RED}[✗]${NC} $1"
  ((FAILED_TESTS++))
}

log_section() {
  echo ""
  echo -e "${COLOR_BLUE}========================================${NC}"
  echo -e "${COLOR_BLUE}$1${NC}"
  echo -e "${COLOR_BLUE}========================================${NC}"
}

test_service() {
  local service_name=$1
  local port=$2
  local endpoint=${3:-"/health"}
  
  ((TOTAL_TESTS++))
  
  if curl -sf "http://localhost:$port$endpoint" > /dev/null 2>&1; then
    log_success "$service_name is healthy"
  else
    log_error "$service_name is NOT responding"
  fi
}

test_gateway_route() {
  local route=$1
  local method=${2:-"GET"}
  local expected_code=$3
  
  ((TOTAL_TESTS++))
  
  local response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$GATEWAY_URL$route")
  
  if [[ "$response" == "$expected_code" ]]; then
    log_success "Route $route returned $response"
  else
    log_error "Route $route returned $response (expected $expected_code)"
  fi
}

# ============================================
# PRE-FLIGHT CHECKS
# ============================================

log_section "PREFLIGHT CHECKS"

# Check if Docker containers are running
log_info "Checking Docker containers..."

for service in postgres redis rabbitmq mongodb prometheus grafana; do
  if docker ps | grep -q "pfms_$service"; then
    log_success "$service container is running"
  else
    log_error "$service container is NOT running"
  fi
done

# Check if ports are accessible
log_info "Checking port accessibility..."

for port in 5432 6379 15672 27017 9090 3000; do
  ((TOTAL_TESTS++))
  if nc -z localhost "$port" 2>/dev/null; then
    log_success "Port $port is accessible"
  else
    log_error "Port $port is NOT accessible"
  fi
done

# ============================================
# INFRASTRUCTURE TESTS
# ============================================

log_section "INFRASTRUCTURE SERVICES TESTS"

# PostgreSQL
log_info "Testing PostgreSQL..."
if docker exec pfms_postgres psql -U postgres -c "SELECT 1" > /dev/null 2>&1; then
  log_success "PostgreSQL connection successful"
  
  # Check databases
  db_count=$(docker exec pfms_postgres psql -U postgres -c "SELECT count(*) FROM pg_database WHERE datname LIKE '%_db';" -t 2>/dev/null)
  if [[ $db_count -ge 12 ]]; then
    log_success "All 12 microservice databases exist"
  else
    log_error "Only $db_count databases found (expected 12)"
  fi
else
  log_error "PostgreSQL connection FAILED"
fi

# Redis
log_info "Testing Redis..."
if redis-cli -h localhost ping > /dev/null 2>&1; then
  log_success "Redis connection successful"
  redis_memory=$(redis-cli -h localhost info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
  log_info "Redis memory usage: $redis_memory"
else
  log_error "Redis connection FAILED"
fi

# MongoDB
log_info "Testing MongoDB..."
if docker exec pfms_mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
  log_success "MongoDB connection successful"
else
  log_error "MongoDB connection FAILED"
fi

# RabbitMQ
log_info "Testing RabbitMQ..."
if rabbitmqctl -q status > /dev/null 2>&1; then
  log_success "RabbitMQ is running"
  
  # Check queues
  queue_count=$(rabbitmqctl list_queues -q | wc -l)
  log_info "RabbitMQ queues configured: $queue_count"
else
  log_error "RabbitMQ connection FAILED"
fi

# ============================================
# MICROSERVICES HEALTH TESTS
# ============================================

log_section "MICROSERVICES HEALTH CHECKS"

test_service "Auth Service" 3001 "/health"
test_service "User Service" 3002 "/health"
test_service "Expense Service" 3003 "/health"
test_service "Income Service" 3004 "/health"
test_service "Investment Service" 3005 "/health"
test_service "Loan Service" 3006 "/health"
test_service "Group Service" 3007 "/health"
test_service "Tax Service" 3008 "/health"
test_service "AI Service" 3009 "/health"
test_service "Notification Service" 3010 "/health"
test_service "Automation Service" 3011 "/health"
test_service "Report Service" 3012 "/health"
test_service "Market Service" 3013 "/health"
test_service "Savings Service" 3014 "/health"

# ============================================
# MONITORING SERVICES
# ============================================

log_section "MONITORING SERVICES"

# Prometheus
log_info "Testing Prometheus..."
if curl -sf "http://localhost:9090/-/healthy" > /dev/null 2>&1; then
  log_success "Prometheus is healthy"
  
  # Check scrape targets
  targets=$(curl -s http://localhost:9090/api/v1/targets | grep -o '"instance":"[^"]*"' | wc -l)
  log_info "Prometheus scrape targets configured: $targets"
else
  log_error "Prometheus is NOT responding"
fi

# Grafana
log_info "Testing Grafana..."
if curl -sf "http://localhost:3100/api/health" > /dev/null 2>&1; then
  log_success "Grafana is healthy"
else
  log_error "Grafana is NOT responding"
fi

# ============================================
# API GATEWAY TESTS
# ============================================

log_section "API GATEWAY (KONG) TESTS"

# Gateway health
log_info "Testing Kong Gateway..."
if curl -sf "http://localhost:8001/status" > /dev/null 2>&1; then
  log_success "Kong Admin API is responding"
else
  log_error "Kong Admin API is NOT responding"
fi

# Test routes through gateway
log_info "Testing Kong routes..."

test_gateway_route "/auth/health" "GET" "200"
test_gateway_route "/users/health" "GET" "200"
test_gateway_route "/expenses/health" "GET" "200"
test_gateway_route "/api/invalid-route" "GET" "404"

# ============================================
# EVENT BUS TESTS
# ============================================

log_section "EVENT BUS (RabbitMQ) TESTS"

log_info "Testing RabbitMQ exchanges..."

# Check exchanges
exchanges=$(rabbitmqadmin list exchanges 2>/dev/null | grep -c "exchange_type")
if [[ $exchanges -ge 5 ]]; then
  log_success "RabbitMQ exchanges configured: $exchanges"
else
  log_error "Only $exchanges exchanges found (expected at least 5)"
fi

# ============================================
# DATABASE CONNECTIVITY TESTS
# ============================================

log_section "DATABASE CONNECTIVITY TESTS"

log_info "Testing service database connectivity..."

for i in {1..5}; do
  if docker logs pfms-auth-service 2>&1 | grep -q "Connected to database"; then
    log_success "Service $i database connection verified in logs"
    break
  fi
done

# ============================================
# PERFORMANCE BASELINE
# ============================================

log_section "PERFORMANCE BASELINE"

log_info "Measuring API response times (5 requests)..."

total_time=0
for i in {1..5}; do
  response_time=$(curl -w "%{time_total}" -o /dev/null -s "http://localhost:3000/health")
  total_time=$(echo "$total_time + $response_time" | bc)
done

avg_time=$(echo "scale=3; $total_time / 5" | bc)
log_info "Average response time: ${avg_time}s"

if (( $(echo "$avg_time < 0.5" | bc -l) )); then
  log_success "Response time is excellent (< 500ms)"
elif (( $(echo "$avg_time < 1.0" | bc -l) )); then
  log_success "Response time is good (< 1s)"
else
  log_error "Response time is poor (> 1s)"
fi

# ============================================
# TEST SUMMARY
# ============================================

log_section "TEST SUMMARY"

echo -e "Total Tests:   $TOTAL_TESTS"
echo -e "Passed:        ${COLOR_GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:        ${COLOR_RED}$FAILED_TESTS${NC}"
echo ""

if [[ $FAILED_TESTS -eq 0 ]]; then
  echo -e "${COLOR_GREEN}✓ ALL TESTS PASSED!${NC}"
  echo ""
  echo "Service Status Dashboard:"
  echo "  Prometheus:  http://localhost:9090"
  echo "  Grafana:     http://localhost:3100"
  echo "  Kong Admin:  http://localhost:8001"
  echo "  RabbitMQ:    http://localhost:15672"
  echo ""
  echo "API Gateway: http://localhost:3000"
  exit 0
else
  echo -e "${COLOR_RED}✗ Some tests failed. Please check the errors above.${NC}"
  exit 1
fi
