#!/bin/bash
# ==============================================================================
# PFMS Database Backup Script
# Backs up all PostgreSQL databases and MongoDB
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS="${RETENTION_DAYS:-30}"
COMPRESS="${COMPRESS:-true}"

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

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_DATE"

log_info "Starting backup process..."

# ==============================================================================
# Backup PostgreSQL Databases
# ==============================================================================
POSTGRES_SERVICES=(
    "postgres-auth:auth_db"
    "postgres-expense:expense_db"
    "postgres-user:user_db"
    "postgres-income:income_db"
    "postgres-investment:investment_db"
    "postgres-loan:loan_db"
)

log_info "Backing up PostgreSQL databases..."

for service_db in "${POSTGRES_SERVICES[@]}"; do
    IFS=':' read -r service db <<< "$service_db"
    
    log_info "Backing up $db from $service..."
    
    backup_file="$BACKUP_DIR/$BACKUP_DATE/${db}_${BACKUP_DATE}.sql"
    
    if docker-compose -f infra/docker-compose.base.yml exec -T "$service" \
        pg_dump -U postgres -d "$db" > "$backup_file"; then
        
        if [ "$COMPRESS" = "true" ]; then
            gzip "$backup_file"
            log_info "✓ $db backed up and compressed successfully"
        else
            log_info "✓ $db backed up successfully"
        fi
    else
        log_error "✗ Failed to backup $db"
        exit 1
    fi
done

# ==============================================================================
# Backup MongoDB (Analytics)
# ==============================================================================
log_info "Backing up MongoDB..."

mongodb_backup="$BACKUP_DIR/$BACKUP_DATE/mongodb_${BACKUP_DATE}"

if docker-compose -f infra/docker-compose.base.yml exec -T mongodb \
    mongodump --archive --gzip --db=ai_analytics_db > "${mongodb_backup}.gz"; then
    log_info "✓ MongoDB backed up successfully"
else
    log_error "✗ Failed to backup MongoDB"
    exit 1
fi

# ==============================================================================
# Backup Redis (Optional)
# ==============================================================================
log_info "Backing up Redis..."

redis_backup="$BACKUP_DIR/$BACKUP_DATE/redis_${BACKUP_DATE}.rdb"

if docker-compose -f infra/docker-compose.base.yml exec -T redis \
    redis-cli --pass "${REDIS_PASSWORD:-redis_dev_password}" --rdb "$redis_backup" BGSAVE; then
    log_info "✓ Redis backup initiated"
else
    log_warn "⚠ Redis backup skipped or failed"
fi

# ==============================================================================
# Calculate Backup Size
# ==============================================================================
backup_size=$(du -sh "$BACKUP_DIR/$BACKUP_DATE" | cut -f1)
log_info "Backup size: $backup_size"

# ==============================================================================
# Clean Old Backups
# ==============================================================================
log_info "Cleaning backups older than $RETENTION_DAYS days..."

find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} \;

log_info "✓ Backup completed successfully!"
log_info "Backup location: $BACKUP_DIR/$BACKUP_DATE"

# ==============================================================================
# Optional: Upload to Cloud Storage
# ==============================================================================
if [ -n "${AWS_S3_BUCKET:-}" ]; then
    log_info "Uploading to S3..."
    if command -v aws &> /dev/null; then
        aws s3 sync "$BACKUP_DIR/$BACKUP_DATE" "s3://$AWS_S3_BUCKET/backups/$BACKUP_DATE/"
        log_info "✓ Uploaded to S3"
    else
        log_warn "⚠ AWS CLI not installed, skipping S3 upload"
    fi
fi

exit 0
