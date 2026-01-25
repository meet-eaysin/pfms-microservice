# PFMS Docker Architecture & Guide

This document provides a detailed explanation of the Docker infrastructure used in PFMS.

## 🏗️ Structure

We use a modern, modular Docker Compose setup utilizing the `include` directive (Docker Compose V2.20+).

```text
infra/
├── docker-compose.yml      # Main entry point
├── compose/                # Modular configurations
│   ├── apps.yml            # 14 Microservices
│   ├── db.yml              # Dedicated DBs for each service
│   ├── infra.yml           # Message brokers, Cache, S3
│   ├── monitoring.yml      # Prometheus, Grafana, ELK
│   └── gateway.yml         # Kong API Gateway, Portainer
├── config/                 # Service-specific configurations
└── scripts/                # Initialization scripts
```

## 🎭 Profiles

Profiles allow you to start only what you need, saving system resources.

| Profile | Description |
| :--- | :--- |
| `infra` | Core shared services: Redis, RabbitMQ, MongoDB, MinIO |
| `db` | All 14 PostgreSQL instances for microservice isolation |
| `apps` | All 14 microservice APIs |
| `monitoring`| Observability stack (Prometheus, Grafana, ELK) |
| `gateway` | API Gateway (Kong) |
| `developer` | Extra dev tools (Portainer, Mailhog, Konga) |
| `full` | **Everything** above |

### Examples

**Start only Databases & Infrastructure:**
```bash
docker compose --profile db --profile infra up -d
```

**Start for Local Development (Gateway + Tools + Core):**
```bash
docker compose --profile infra --profile db --profile gateway --profile developer up -d
```

## 🛠️ Key Features

### 1. Per-Service Database Isolation
Each microservice has its own dedicated PostgreSQL instance. This enforces data isolation and prevents "God Databases".
All DBs follow the naming convention `pfms_postgres_<service_name>`.

### 2. YAML Anchors (Deduplication)
The `compose/apps.yml` and `compose/db.yml` use YAML anchors to eliminate repetitive configurations for:
- Restart policies
- Network attachments
- Common environment variables
- Health checks

### 3. Unified Networking
All containers reside on the `pfms_network` (bridge).
- Services connect to DBs via internal hostnames (e.g., `postgres-auth:5432`).
- External access is routed primarily through the **Kong Gateway** on port `8000`.

### 4. Health Check Synchronization
Microservices use `depends_on` with `condition: service_healthy`. This ensures an API doesn't try to connect to its database before the database is actually ready to accept connections.

## 💾 Volumes & Persistence

All data is persisted in named volumes prefixed with `pfms_`.
To completely reset your data:
```bash
docker compose --profile full down -v
```

## 🐳 Useful Commands

**Check merged configuration:**
```bash
docker compose --profile full config
```

**View logs for a specific group (e.g., all apps):**
```bash
docker compose --profile apps logs -f
```

**Check service health:**
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```
