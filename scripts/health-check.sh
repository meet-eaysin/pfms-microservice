#!/bin/bash
# ==============================================================================
# PFMS Health Check Script
# Monitors all services and reports health status
# ==============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TIMEOUT=5
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -t|--timeout)
            TIMEOUT="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging
log_info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_checking() {
    echo -e "${BLUE}[→]${NC} $1"
}

# Health check function
check_http_health() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    log_checking "Checking $name..."
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout "$TIMEOUT" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        log_info "$name is healthy (HTTP $response)"
        return 0
    else
        log_error "$name is unhealthy (HTTP $response)"
        return 1
    fi
}

# Docker health check
check_docker_health() {
    local container=$1
    local name=$2
    
    log_checking "Checking $name..."
    
    if docker ps --filter "name=$container" --filter "health=healthy" | grep -q "$container"; then
        log_info "$name is healthy"
        return 0
    elif docker ps --filter "name=$container" | grep -q "$container"; then
        log_warn "$name is running but not healthy"
        return 1
    else
        log_error "$name is not running"
        return 1
    fi
}

echo "=========================================="
echo "PFMS Health Check"
echo "=========================================="
echo ""

TOTAL=0
HEALTHY=0

# ==============================================================================
# Infrastructure Services
# ==============================================================================
echo "Infrastructure Services:"
echo "----------------------------------------"

SERVICES=(
    "pfms_redis:Redis"
    "pfms_rabbitmq:RabbitMQ"
    "pfms_mongodb:MongoDB"
    "pfms_postgres_auth:PostgreSQL (Auth)"
    "pfms_postgres_expense:PostgreSQL (Expense)"
    "pfms_prometheus:Prometheus"
    "pfms_grafana:Grafana"
)

for service in "${SERVICES[@]}"; do
    IFS=':' read -r container name <<< "$service"
    ((TOTAL++))
    if check_docker_health "$container" "$name"; then
        ((HEALTHY++))
    fi
done

echo ""

# ==============================================================================
# Microservices
# ==============================================================================
echo "Microservices:"
echo "----------------------------------------"

MICROSERVICES=(
    "http://localhost:3001/api/v1/health:Auth Service"
    "http://localhost:3003/health:Expense Service"
)

for service in "${MICROSERVICES[@]}"; do
    IFS=':' read -r url name <<< "$service"
    ((TOTAL++))
    if check_http_health "$name" "$url"; then
        ((HEALTHY++))
    fi
done

echo ""

# ==============================================================================
# API Gateway
# ==============================================================================
echo "API Gateway:"
echo "----------------------------------------"

((TOTAL++))
if check_http_health "Kong Gateway" "http://localhost:8000" "404"; then
    ((HEALTHY++))
fi

echo ""

# ==============================================================================
# Summary
# ==============================================================================
echo "=========================================="
echo "Summary: $HEALTHY/$TOTAL services healthy"
echo "=========================================="

if [ "$HEALTHY" -eq "$TOTAL" ]; then
    echo -e "${GREEN}✓ All services are healthy!${NC}"
    exit 0
elif [ "$HEALTHY" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Some services are unhealthy${NC}"
    exit 1
else
    echo -e "${RED}✗ All services are down!${NC}"
    exit 2
fi
