# Kong API Gateway

Kong API Gateway configuration and management for the PFMS microservices platform.

## 📁 Directory Structure

```
apps/api-gateway/
├── configs/
│   ├── base/                    # Base configurations (shared across environments)
│   │   ├── services.yaml       # Service definitions
│   │   ├── routes.yaml         # Route definitions
│   │   ├── plugins.yaml        # Global plugins
│   │   ├── upstreams.yaml      # Health check configurations
│   │   └── consumers.yaml      # Test consumers and ACLs
│   ├── dev/                    # Development environment
│   │   ├── kong.yaml          # Complete dev configuration
│   │   ├── .env.example       # Environment variables template
│   │   └── overrides.yaml     # Dev-specific overrides
│   ├── staging/                # Staging environment
│   │   ├── kong.yaml          # Complete staging configuration
│   │   ├── .env.example       # Environment variables template
│   │   └── overrides.yaml     # Staging-specific overrides
│   ├── prod/                   # Production environment
│   │   ├── kong.yaml          # Complete prod configuration
│   │   ├── .env.example       # Environment variables template
│   │   └── overrides.yaml     # Production-specific overrides
│   └── backup/                 # Configuration backups
├── scripts/
│   ├── merge-config.js         # Merge base + overrides
│   ├── substitute-env.js       # Environment variable substitution
│   ├── validate.sh            # Validate configuration
│   ├── sync.sh                # Sync to Kong
│   └── diff.sh                # Show diff with Kong
├── templates/                  # Reusable configuration templates
│   ├── service.template.yaml
│   ├── route.template.yaml
│   └── plugin.template.yaml
├── .deck.yaml                  # Deck CLI configuration
└── package.json
```

## 🚀 Quick Start

### Prerequisites

1. **Install deck CLI** (Kong's declarative configuration tool):

   ```bash
   npm install -g deck
   ```

2. **Set up environment variables**:
   ```bash
   cd apps/api-gateway/configs/dev
   cp .env.example .env
   # Edit .env with your Kong Admin API URL and credentials
   ```

### Common Commands

```bash
# Validate configuration (from project root)
yarn gateway:validate:dev
yarn gateway:validate:staging
yarn gateway:validate:prod

# Show diff between local config and Kong
yarn gateway:diff:dev

# Sync configuration to Kong
yarn gateway:sync:dev

# Create backup of current Kong configuration
cd apps/api-gateway
npm run dump
```

## 🔐 Better-Auth Integration

### Overview

This API Gateway is configured to work with [Better-Auth](https://better-auth.com), a framework-agnostic authentication library. Better-Auth handles user authentication and issues JWT tokens that Kong validates using a JWKS (JSON Web Key Set) endpoint.

### Authentication Flow

1. **User Authentication**: Users authenticate via the `auth-service` using Better-Auth
2. **Token Issuance**: Better-Auth issues JWT tokens (via the JWT plugin)
3. **Token Validation**: Kong validates JWT signatures using Better-Auth's JWKS endpoint
4. **Request Forwarding**: Valid requests are forwarded to backend services

### Better-Auth JWT Plugin Setup

Your `auth-service` must have the Better-Auth JWT plugin enabled:

```typescript
// auth-service configuration
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins"

export const auth = betterAuth({
  database: /* your database config */,
  plugins: [
    jwt({
      jwks: {
        // Optional: customize JWKS path
        jwksPath: "/api/auth/jwks",  // default
      },
    }),
  ],
})
```

### JWKS Endpoint

Better-Auth exposes a JWKS endpoint at:

- **Development**: `http://auth-service:3001/api/auth/jwks`
- **Production**: `https://auth.yourdomain.com/api/auth/jwks`

Kong fetches public keys from this endpoint to verify JWT signatures.

### Client Integration

Clients can obtain JWT tokens in two ways:

**Option 1: Using Better-Auth Client Plugin (Recommended)**

```typescript
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';

const authClient = createAuthClient({
  plugins: [jwtClient()],
});

// Get JWT token
const { data } = await authClient.token();
const jwtToken = data.token;

// Use token in API requests
fetch('http://localhost:8000/api/v1/expenses', {
  headers: {
    Authorization: `Bearer ${jwtToken}`,
  },
});
```

**Option 2: Cookie-Based Sessions**

Better-Auth also supports cookie-based sessions. Kong can validate the `better_auth.session_token` cookie automatically.

### Environment Configuration

Update your environment-specific `.env` files:

**Development (`configs/dev/.env`)**:

```bash
BETTER_AUTH_JWKS_URI=http://auth-service:3001/api/auth/jwks
```

**Production (`configs/prod/.env`)**:

```bash
BETTER_AUTH_JWKS_URI=https://auth.yourdomain.com/api/auth/jwks
```

### Testing Authentication

1. **Get a JWT token** from your auth-service:

   ```bash
   curl -X POST http://localhost:3001/api/auth/token \
     -H "Authorization: Bearer YOUR_SESSION_TOKEN"
   ```

2. **Test protected route** through Kong:

   ```bash
   curl http://localhost:8000/api/v1/expenses \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

3. **Test without token** (should return 401):
   ```bash
   curl http://localhost:8000/api/v1/expenses
   ```

## 📝 Configuration Management

### Environment-Specific Configurations

Each environment (dev, staging, prod) has its own configuration that combines:

1. **Base configurations** from `configs/base/` (shared across all environments)
2. **Environment-specific overrides** from `configs/{env}/overrides.yaml`

### Adding a New Service

1. **Add service definition** to `configs/base/services.yaml`:

   ```yaml
   - name: my-new-service
     url: http://my-new-service:3015
     protocol: http
     host: my-new-service
     port: 3015
     retries: 3
     connect_timeout: 60000
     write_timeout: 30000
     read_timeout: 30000
     tags:
       - category
       - subcategory
   ```

2. **Add routes** to `configs/base/routes.yaml`:

   ```yaml
   - name: my-new-service-routes
     service: my-new-service
     paths:
       - /api/v1/my-service
     methods:
       - GET
       - POST
       - PUT
       - DELETE
     protocols:
       - http
       - https
     plugins:
       - name: cors
       - name: rate-limiting
         config:
           minute: 100
           hour: 1000
   ```

3. **Validate and sync**:
   ```bash
   yarn gateway:validate:dev
   yarn gateway:sync:dev
   ```

### Modifying Rate Limits

Rate limits can be configured at three levels:

1. **Global** (in `configs/base/plugins.yaml`):

   ```yaml
   plugins:
     - name: rate-limiting
       config:
         minute: 500
         hour: 5000
   ```

2. **Per-route** (in `configs/base/routes.yaml`):

   ```yaml
   routes:
     - name: my-route
       plugins:
         - name: rate-limiting
           config:
             minute: 100
             hour: 1000
   ```

3. **Environment-specific** (in `configs/{env}/overrides.yaml`):
   ```yaml
   plugins:
     - name: rate-limiting
       config:
         minute: 200 # Stricter in production
         hour: 2000
   ```

### Environment Variables

Use environment variables for secrets and environment-specific values:

1. **In configuration files**, use `${VAR_NAME}` syntax:

   ```yaml
   plugins:
     - name: rate-limiting
       config:
         redis_host: ${REDIS_HOST}
         redis_password: ${REDIS_PASSWORD}
   ```

2. **In `.env` file**:

   ```bash
   REDIS_HOST=redis.example.com
   REDIS_PASSWORD=your-secret-password
   ```

3. **Run substitution**:
   ```bash
   node scripts/substitute-env.js dev
   ```

## 🔧 Deck CLI Operations

### Validate Configuration

Validates the Kong configuration without applying it:

```bash
# Using npm scripts (recommended)
npm run validate:dev
npm run validate:staging
npm run validate:prod

# Using deck directly
deck validate --config configs/dev/kong.yaml
```

### Sync Configuration

Applies the configuration to Kong (destructive operation):

```bash
# Using npm scripts (with confirmation prompt)
npm run sync:dev
npm run sync:staging
npm run sync:prod

# Using deck directly
deck sync --config configs/dev/kong.yaml
```

### Show Diff

Shows differences between local configuration and Kong:

```bash
# Using npm scripts
npm run diff:dev
npm run diff:staging
npm run diff:prod

# Using deck directly
deck diff --config configs/dev/kong.yaml
```

### Dump Current Configuration

Creates a backup of the current Kong configuration:

```bash
npm run dump
# Saves to: configs/backup/kong-YYYYMMDD-HHMMSS.yaml
```

## 🌍 Environment Differences

### Development

- **CORS**: Permissive (`*` origin allowed)
- **Rate Limits**: Very generous (1000/min, 10000/hr global)
- **Authentication**: JWT validation optional (can be disabled for testing)
- **Logging**: Verbose (debug level) to `/tmp/kong-dev-access.log`
- **Rate Limiting Backend**: Local (no Redis required)

### Staging

- **CORS**: Specific staging domains + localhost for testing
- **Rate Limits**: Moderate (300/min, 3000/hr global)
- **Authentication**: JWT via Better-Auth JWKS (production-like)
- **Logging**: Info level
- **Rate Limiting Backend**: Redis (distributed)

### Production

- **CORS**: Strict (production domains only)
- **Rate Limits**: Strict (200/min, 2000/hr global)
- **Rate Limiting Backend**: Redis (distributed with timeout)
- **Authentication**: JWT with strict validation (exp, iss claims)
- **Logging**: Warn level only
- **Security Headers**: Full suite (HSTS, CSP, X-Frame-Options, etc.)
- **IP Restrictions**: Enabled for admin routes (optional, configure in overrides)

## 🔐 Security Best Practices

1. **Never commit secrets**: Use `.env` files (gitignored) for sensitive data
2. **Use environment variables**: For all secrets and environment-specific values
3. **Better-Auth JWT Authentication**:
   - Ensure Better-Auth JWT plugin is enabled in auth-service
   - Configure JWKS URI correctly for each environment
   - Use short token expiration times (15-60 minutes)
4. **Use Redis for rate limiting**: In staging/production for distributed rate limiting
5. **Restrict CORS origins**: Use specific domains in staging/production
6. **Enable IP restrictions**: For admin routes (monitoring, etc.)
7. **Health Check Routes**: All services have dedicated health check endpoints that bypass authentication
8. **Security Headers**: Enabled globally with HSTS, X-Frame-Options, CSP in production

## 📊 Service Categories & Rate Limits

| Category        | Services                                          | Rate Limit (min/hr) |
| --------------- | ------------------------------------------------- | ------------------- |
| **Core**        | auth, user, notification, automation              | 100/1000            |
| **Financial**   | expense, income, investment, loan, group, savings | 100/1000            |
| **AI**          | ai-service                                        | 30/300              |
| **Tax**         | tax-service                                       | 50/500              |
| **Reports**     | report-service                                    | 20/100              |
| **Market Data** | market-service                                    | 100/2000            |
| **Monitoring**  | grafana, prometheus                               | 200/2000            |

## 🔄 Workflow

### Making Configuration Changes

1. **Edit base configurations** in `configs/base/`
2. **Add environment-specific overrides** in `configs/{env}/overrides.yaml` if needed
3. **Validate** the configuration:
   ```bash
   yarn gateway:validate:dev
   ```
4. **Check diff** against running Kong:
   ```bash
   yarn gateway:diff:dev
   ```
5. **Sync** to Kong:
   ```bash
   yarn gateway:sync:dev
   ```
6. **Test** your changes
7. **Commit** to version control

### Promoting Changes Across Environments

1. Changes in `configs/base/` automatically apply to all environments
2. Environment-specific differences go in `configs/{env}/overrides.yaml`
3. Validate each environment before syncing:
   ```bash
   yarn gateway:validate:dev
   yarn gateway:validate:staging
   yarn gateway:validate:prod
   ```

## 🐛 Troubleshooting

### "deck: command not found"

Install deck CLI globally:

```bash
npm install -g deck
```

### "Connection refused" when syncing

1. Ensure Kong is running
2. Check `KONG_ADMIN_URL` in your `.env` file
3. Verify Kong Admin API is accessible

### Configuration validation fails

1. Check YAML syntax
2. Ensure all referenced services exist
3. Verify plugin configurations are valid

### Rate limiting not working

1. Ensure the plugin is enabled
2. Check plugin configuration
3. For production, verify Redis connection

## 📚 Additional Resources

- [Kong Documentation](https://docs.konghq.com/)
- [Deck CLI Reference](https://docs.konghq.com/deck/latest/)
- [Kong Plugins Hub](https://docs.konghq.com/hub/)
- [Declarative Configuration](https://docs.konghq.com/gateway/latest/production/deployment-topologies/db-less-and-declarative-config/)

## 🤝 Contributing

When adding new services or routes:

1. Use the templates in `templates/` directory
2. Follow existing naming conventions
3. Add appropriate tags for categorization
4. Set reasonable rate limits based on service type
5. Update this README if adding new categories or patterns
