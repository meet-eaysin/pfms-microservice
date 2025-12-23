# Infrastructure Documentation

## Docker Compose File Structure

This directory uses **Docker Compose multi-file architecture** - a recommended best practice for managing complex microservices systems across multiple environments.

### 📁 File Organization

```
infra/
├── compose.yml                      # Symlink to docker-compose.base.yml (optional)
├── docker-compose.base.yml          # ✅ Shared infrastructure (DB, Cache, Queue)
├── docker-compose.dev.yml           # ✅ Development overrides & tools
├── docker-compose.prod.yml          # ✅ Production overrides & security
├── docker-compose.services.yml      # ✅ Microservices definitions
├── config/                          # Service configurations
│   ├── kong.yml                     # API Gateway routes
│   ├── prometheus.yml               # Metrics collection
│   ├── rabbitmq.conf               # Message queue config
│   └── mongodb-init.js             # Database initialization
├── rules/                           # Monitoring rules
│   └── alert_rules.yml             # Prometheus alerting
└── scripts/                         # Automation scripts
    ├── quick-start.sh
    ├── integration-test.sh
    └── rabbitmq-init.sh
```

---

## 🎯 Why Multiple Files? (Industry Best Practice)

### ✅ Advantages

1. **Separation of Concerns**
   - Infrastructure vs Services
   - Dev vs Prod configurations
   - Easier to maintain and understand

2. **Environment-Specific Overrides**
   - Development: Hot-reload, debug tools, exposed ports
   - Production: Security hardening, resource limits, logging

3. **Selective Deployment**
   - Start only infrastructure: `docker compose -f docker-compose.base.yml up`
   - Start with dev tools: `docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up`
   - Full system: All files combined

4. **Team Collaboration**
   - Clear boundaries between different system components
   - Reduces merge conflicts
   - Easier code reviews

5. **Compliance & Security**
   - Separate sensitive production configs
   - Clear audit trail
   - Environment-specific secrets management

---

## 📋 File Descriptions

### 1. `docker-compose.base.yml` (Foundation)

**Purpose:** Shared infrastructure services

**Contains:**

- Redis (cache)
- RabbitMQ (message queue)
- MongoDB (analytics data)
- PostgreSQL per-service databases
- MinIO (object storage)
- Prometheus & Grafana (monitoring)

**When to use:**

- Always included as base
- Required for all environments

**Security:** All ports are internal-only (no host exposure)

---

### 2. `docker-compose.dev.yml` (Development)

**Purpose:** Development-specific tools and overrides

**Contains:**

- Kong API Gateway
- Kong Admin UI (Konga)
- Portainer (container management)
- MailHog (email testing)
- Database debug logging
- Hot-reload configurations

**When to use:**

- Local development
- Integration testing
- Debugging

**Security:** Some admin tools exposed for convenience (⚠️ dev only)

---

### 3. `docker-compose.prod.yml` (Production)

**Purpose:** Production hardening and optimizations

**Contains:**

- Security configurations
- Resource limits
- Log rotation
- Backup services
- Health check tuning
- TLS/SSL settings

**When to use:**

- Staging environment
- Production deployment
- Load testing

**Security:** All services internal, logging enabled, secrets from env

---

### 4. `docker-compose.services.yml` (Microservices)

**Purpose:** Application microservices definitions

**Contains:**

- All 14 microservices (auth, expense, user, etc.)
- Service-specific environment variables
- Database connections
- Health checks

**When to use:**

- Running full application stack
- Testing service interactions

**Note:** Most services are placeholders until implemented

---

## 🚀 Usage Patterns

### Development Mode (Recommended)

```bash
# Start infrastructure + dev tools
docker compose -f docker-compose.base.yml \
               -f docker-compose.dev.yml up -d

# Check status
docker compose -f docker-compose.base.yml \
               -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.base.yml \
               -f docker-compose.dev.yml logs -f redis
```

### Full Stack (Infrastructure + Services)

```bash
# Start everything
docker compose -f docker-compose.base.yml \
               -f docker-compose.dev.yml \
               -f docker-compose.services.yml up -d
```

### Production Mode

```bash
# Production deployment
docker compose -f docker-compose.base.yml \
               -f docker-compose.prod.yml up -d

# With services
docker compose -f docker-compose.base.yml \
               -f docker-compose.prod.yml \
               -f docker-compose.services.yml up -d
```

### Infrastructure Only

```bash
# Just databases and cache
docker compose -f docker-compose.base.yml up -d redis rabbitmq postgres-expense
```

---

## 🔧 Simplified Commands (Optional)

You can create shell aliases or use `Makefile`:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias dc-dev='docker compose -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml'
alias dc-prod='docker compose -f infra/docker-compose.base.yml -f infra/docker-compose.prod.yml'
alias dc-full='docker compose -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml -f infra/docker-compose.services.yml'

# Usage
dc-dev up -d
dc-full ps
dc-prod logs -f
```

---

## 🔄 Alternative: Single File Approach (Not Recommended)

**Why we DON'T use a single `docker-compose.yml`:**

❌ **Disadvantages:**

- 1000+ lines in one file
- Cannot separate dev/prod configs
- Hard to manage environments
- Difficult to review changes
- Accidental production changes
- No selective deployment

**When single file is okay:**

- Very simple projects (<5 services)
- Single environment only
- Proof of concept
- Personal projects

---

## 📊 Comparison

| Aspect                     | Multi-File (Current) | Single File  |
| -------------------------- | -------------------- | ------------ |
| **Maintainability**        | ✅ Excellent         | ❌ Poor      |
| **Environment Separation** | ✅ Clear             | ❌ Mixed     |
| **Security**               | ✅ Isolated          | ⚠️ Shared    |
| **Selective Deploy**       | ✅ Easy              | ❌ Hard      |
| **Team Collaboration**     | ✅ Good              | ❌ Conflicts |
| **Production Ready**       | ✅ Yes               | ⚠️ Risky     |
| **Learning Curve**         | ⚠️ Moderate          | ✅ Simple    |

---

## 🏆 Industry Standards

This multi-file approach is used by:

- **Netflix** - Separate environments
- **Spotify** - Infrastructure isolation
- **Uber** - Service-specific configs
- **Google** - Environment-based composition

**References:**

- [Docker Compose Best Practices](https://docs.docker.com/compose/production/)
- [12-Factor App Methodology](https://12factor.net/)
- [Cloud Native Patterns](https://www.cncf.io/)

---

## 💡 Tips

### When to Create a New File

**Create new file when:**

- Adding new environment (staging, qa)
- Different deployment targets (cloud providers)
- Feature-specific overrides
- Testing scenarios

**Don't create new file for:**

- Single service config
- Temporary changes
- Personal preferences

### File Naming Convention

```
docker-compose.{purpose}.yml

Examples:
- docker-compose.base.yml      # Foundation
- docker-compose.dev.yml       # Development
- docker-compose.prod.yml      # Production
- docker-compose.test.yml      # Testing
- docker-compose.staging.yml   # Staging
- docker-compose.services.yml  # Services
```

---

## 🔒 Security Checklist

- [x] No secrets in compose files (use env vars)
- [x] Separate dev/prod configs
- [x] Internal-only ports for services
- [x] Production has TLS enabled
- [x] Resource limits defined
- [x] Logging configured
- [ ] Secrets management (vault/sops)
- [ ] Image scanning enabled
- [ ] Network policies applied

---

## 🎓 Learning Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Multi-File Composition](https://docs.docker.com/compose/extends/)
- [Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Production Deployment](https://docs.docker.com/compose/production/)

---

## ✅ Conclusion

**The current multi-file structure IS the best practice.**

It provides:

- ✅ Clear separation of concerns
- ✅ Environment-specific configurations
- ✅ Production-ready architecture
- ✅ Maintainable codebase
- ✅ Industry-standard approach

**Keep the current structure** - it will save you time and headaches as the project grows!
