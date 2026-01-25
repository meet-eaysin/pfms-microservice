# Docker Infrastructure for PFMS

This directory contains the Docker Compose setup for the Personal Finance Management System (PFMS).

## Quick Start

The setup is now **ultra-simplified**. Just run:

```bash
docker compose up -d
```

That's it! No profiles, no flags, no complexity.

---

## What Gets Started

When you run `docker compose up`, the following components start automatically:

### Core Infrastructure
- **Redis** - Cache & session store
- **RabbitMQ** - Message queue
- **MongoDB** - Analytics data
- **MinIO** - S3-compatible object storage

### Databases
- **PostgreSQL instances** for each microservice (auth, user, expense, income, ledger, planning)

### API Gateway
- **Kong** - API Gateway on port 8000
- **Konga** - Kong admin UI
- **Kong DB** - PostgreSQL for Kong

### Monitoring
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **Elasticsearch** - Log storage
- **Kibana** - Log visualization

### Developer Tools
- **Portainer** - Container management UI
- **Mailhog** - Email testing (port 8025)

### Microservices
- Auth Service
- User Service
- Expense Service
- Income Service
- Ledger Service
- Planning Service

---

## Common Commands

```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Clean up (including volumes)
docker compose down -v

# Rebuild and restart
docker compose up -d --build
```

---

## Architecture

The setup uses modular compose files in `compose/`:
- `infra.yml` - Core services (Redis, RabbitMQ, MongoDB, MinIO)
- `db.yml` - PostgreSQL databases
- `apps.yml` - Microservices
- `monitoring.yml` - Prometheus, Grafana, ELK
- `gateway.yml` - Kong API Gateway & Dev Tools

All modules are included by default in the main `docker-compose.yml`.

---

## Detailed Documentation

For a deep dive into how our Docker environment works, see:
👉 **[DOCKER.md](./DOCKER.md)**
