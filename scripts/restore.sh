#!/bin/bash
# ==============================================================================
# PFMS Database Restore Script
# Restores PostgreSQL databases and MongoDB from backup
# ==============================================================================

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Logging
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Usage
usage() {
    echo "Usage: $0 <backup_directory>"
    echo "Example: $0 ./backups/20241224_120000"
    exit 1
}

if [ $# -ne 1 ]; then
    usage
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
    log_error "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

# Confirmation
log_warn "⚠️  WARNING: This will overwrite existing databases!"
read -p "Are you sure you want to restore from $BACKUP_DIR? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    log_info "Restore cancelled"
    exit 0
fi

log_info "Starting restore process from $BACKUP_DIR..."

# ==============================================================================
# Restore PostgreSQL Databases
# ==============================================================================
POSTGRES_SERVICES=(
    "postgres-auth:auth_db"
    "postgres-expense:expense_db"
    "postgres-user:user_db"
    "postgres-income:income_db"
    "postgres-investment:investment_db"
    "postgres-loan:loan_db"
)

log_info "Restoring PostgreSQL databases..."

for service_db in "${POSTGRES_SERVICES[@]}"; do
    IFS=':' read -r service db <<< "$service_db"
    
    # Find backup file (compressed or uncompressed)
    backup_file=$(find "$BACKUP_DIR" -name "${db}_*.sql.gz" -o -name "${db}_*.sql" | head -1)
    
    if [ -z "$backup_file" ]; then
        log_warn "⚠ No backup found for $db, skipping"
        continue
    fi
    
    log_info "Restoring $db from $(basename "$backup_file")..."
    
    # Drop existing database and recreate
    docker-compose -f infra/docker-compose.base.yml exec -T "$service" \
        psql -U postgres -c "DROP DATABASE IF EXISTS $db;"
    
    docker-compose -f infra/docker-compose.base.yml exec -T "$service" \
        psql -U postgres -c "CREATE DATABASE $db;"
    
    # Restore based on file type
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | docker-compose -f infra/docker-compose.base.yml exec -T "$service" \
            psql -U postgres -d "$db"
    else
        cat "$backup_file" | docker-compose -f infra/docker-compose.base.yml exec -T "$service" \
            psql -U postgres -d "$db"
    fi
    
    if [ $? -eq 0 ]; then
        log_info "✓ $db restored successfully"
    else
        log_error "✗ Failed to restore $db"
        exit 1
    fi
done

# ==============================================================================
# Restore MongoDB
# ==============================================================================
mongodb_backup=$(find "$BACKUP_DIR" -name "mongodb_*.gz" | head -1)

if [ -n "$mongodb_backup" ]; then
    log_info "Restoring MongoDB from $(basename "$mongodb_backup")..."
    
    cat "$mongodb_backup" | docker-compose -f infra/docker-compose.base.yml exec -T mongodb \
        mongorestore --archive --gzip --drop
    
    if [ $? -eq 0 ]; then
        log_info "✓ MongoDB restored successfully"
    else
        log_error "✗ Failed to restore MongoDB"
        exit 1
    fi
else
    log_warn "⚠ No MongoDB backup found, skipping"
fi

log_info "✓ Restore completed successfully!"
log_info "Please verify data integrity and restart services if needed"

exit 0
