# PFMS - Personal Financial Management System

Enterprise microservices platform for personal financial management.

## Tech Stack

- **Monorepo**: Turborepo + Yarn Workspaces
- **Runtime**: Node.js >= 20.9.0
- **Language**: TypeScript
- **Frameworks**: Express.js, Next.js, NestJS
- **Databases**: PostgreSQL (per-service), MongoDB (analytics only)
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **API Gateway**: Kong
- **Monitoring**: Prometheus + Grafana
- **Container**: Docker & Docker Compose

## Quick Start

### Prerequisites

```bash
node >= 20.9.0
yarn >= 4.12.0
docker & docker-compose
```

### Installation & Development

```bash
# Install dependencies
yarn install

# Build all packages and services
yarn build

# Start all services (Docker required)
docker-compose -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml up

# Run services in dev mode (separate terminal)
yarn dev
```

## Architecture

### Microservices (Per-Service Database Isolation)

| Service      | Port | Database                     | Purpose                        |
| ------------ | ---- | ---------------------------- | ------------------------------ |
| Expense      | 3003 | PostgreSQL (expense_db)      | Expense tracking & habits      |
| Auth         | 3001 | PostgreSQL (auth_db)         | Authentication & authorization |
| User         | 3002 | PostgreSQL (user_db)         | User profiles & preferences    |
| Income       | 3004 | PostgreSQL (income_db)       | Income sources & cashflow      |
| Investment   | 3005 | PostgreSQL (investment_db)   | Portfolios & assets            |
| Loan         | 3006 | PostgreSQL (loan_db)         | Loans & payments               |
| Group        | 3007 | PostgreSQL (group_db)        | Group expenses & settlements   |
| Tax          | 3008 | PostgreSQL (tax_db)          | Tax calculations               |
| AI/Analytics | 3009 | MongoDB                      | ML models & insights           |
| Notification | 3010 | PostgreSQL (notification_db) | Notifications & templates      |
| Automation   | 3011 | PostgreSQL (automation_db)   | Rules & triggers               |
| Report       | 3012 | PostgreSQL (report_db)       | Reports & exports              |
| Market Data  | 3013 | PostgreSQL (market_db)       | Stock/crypto prices            |
| Savings      | 3014 | PostgreSQL (savings_db)      | Goals & tracking               |

### Shared Infrastructure

- **Redis** (6379): Caching, sessions
- **RabbitMQ** (5672): Event bus
- **Kong** (8000): API Gateway
- **Prometheus** (9090): Metrics
- **Grafana** (3001): Dashboards

## Project Structure

```
pfms/
├── apps/
│   ├── expense-service/        # Service with isolated config, events, modules
│   ├── auth-service/
│   ├── user-service/
│   └── web/                    # Next.js frontend
├── packages/
│   ├── types/                  # Shared DTOs & interfaces
│   ├── events/                 # Abstract event patterns
│   ├── config/                 # Env validation (no DB logic)
│   ├── utils/                  # Logger, errors, helpers
│   ├── eslint-config/
│   └── typescript-config/
├── infra/
│   ├── docker-compose.base.yml # Per-service databases
│   ├── docker-compose.dev.yml
│   └── config/
├── scripts/
│   ├── setup.sh
│   └── migrate.sh
└── turbo.json
```

## Key Principles

✅ **Microservice Isolation**: Each service owns its database
✅ **Event-Driven**: RabbitMQ for inter-service communication
✅ **Type Safety**: Shared types, no business logic coupling
✅ **Scalability**: Independent deployment & scaling
✅ **Monitoring**: Prometheus + Grafana for observability

## Commands

```bash
# Development
yarn dev                 # Run all services
yarn dev:services       # Run services only (skip web)

# Building
yarn build              # Build all
yarn build:services     # Build services only
yarn build:packages     # Build packages only

# Testing & Quality
yarn test               # Run all tests
yarn test:watch         # Watch mode
yarn test:coverage      # Coverage report
yarn lint               # Lint all
yarn lint:fix           # Fix linting issues
yarn check-types        # TypeScript check

# Database
yarn db:migrate         # Run migrations
yarn db:seed            # Seed data
yarn db:studio          # Prisma Studio

# Docker
docker-compose -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml up
```

## Documentation

- **Service README**: See `apps/<service>/README.md` for service-specific docs
- **Architecture**: See `turbo.json` for build pipeline configuration
- **Config**: See `.env.example` files in each service

## Contributing

1. Create feature branch
2. Make changes in service-specific folder structure
3. Run `yarn lint:fix && yarn test`
4. Submit PR

---

**Status**: Under Development 🚀

- PostgreSQL 16
- Redis 7
- RabbitMQ

### Installation

```bash
# Clone repository
git clone <repo-url>
cd pfms

# Install dependencies
yarn install

# Setup environment
cp .env.example .env.local

# Start development database & services
docker-compose -f infra/docker-compose.dev.yml up -d

# Run migrations
yarn db:migrate

# Start development servers
yarn dev
```

### Development Scripts

```bash
# Build all services and packages
yarn build

# Start development environment
yarn dev

# Run type checking
yarn check-types

# Run linting
yarn lint

# Fix linting issues
yarn lint:fix

# Format code
yarn format

# Run tests
yarn test

# Clean build artifacts
yarn clean

# Full database management
yarn db:migrate              # Run migrations
yarn db:seed                 # Seed database
yarn db:studio               # Open Prisma Studio
```

### Docker Commands

```bash
# Build Docker images
yarn docker:build

# Start services
yarn docker:up

# Stop services
yarn docker:down

# View logs
yarn docker:logs

# Clean everything
yarn docker:clean
```

## Configuration

All services use environment-based configuration. See `.env.example` for available options.

Key environment variables:

- `NODE_ENV`: development, staging, production
- `PORT`: Service port
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `RABBITMQ_URL`: RabbitMQ connection string
- `JWT_SECRET`: JWT signing secret
- `LOG_LEVEL`: Logging level (error, warn, info, debug)

## API Documentation

Detailed API documentation is available in the [API docs](docs/api.md).

All services follow RESTful conventions with JSON request/response format.

### API Gateway

The API Gateway (Kong) is available at `http://localhost:3000`.

### Service Endpoints

Each service follows the pattern: `http://localhost:PORT/api/v1/...`

## Event-Driven Architecture

Services communicate asynchronously via RabbitMQ events:

- `user.events`: User lifecycle events
- `financial.events`: Financial transactions
- `notification.events`: Notification events
- `analytics.events`: Analytics events

See [Event Schema](docs/events.md) for details.

## Database

### PostgreSQL

Primary relational database for all services except AI/Analytics.

```bash
# Run migrations
yarn db:migrate

# Reset database (development only)
yarn db:migrate reset

# Open Prisma Studio
yarn db:studio
```

### MongoDB

Used by AI/Analytics service for ML models and chat history.

## Security

- JWT-based authentication with `better-auth`
- AES-256 encryption for sensitive data
- Rate limiting (100 req/min per user)
- CORS configuration
- SQL injection prevention
- XSS protection
- GDPR compliance features

## Monitoring & Logging

- **Metrics**: Prometheus at `http://localhost:9090`
- **Visualization**: Grafana at `http://localhost:3001`
- **Logs**: JSON format in stdout, aggregated with ELK

## Testing

```bash
# Run all tests
yarn test

# Watch mode
yarn test:watch

# Coverage report
yarn test:coverage
```

## CI/CD

GitHub Actions workflow for:

- Code linting and formatting
- TypeScript type checking
- Unit and integration tests
- Docker image building
- Deployment to staging/production

See `.github/workflows` for details.

## Deployment

### Development

```bash
docker-compose -f infra/docker-compose.dev.yml up
```

### Production

```bash
# Build images
docker-compose -f infra/docker-compose.prod.yml build

# Deploy
docker-compose -f infra/docker-compose.prod.yml up -d
```

### Kubernetes

```bash
kubectl apply -f infra/kubernetes/
```

## Performance

- Horizontal scaling with load balancers
- Database read replicas for read-heavy services
- Redis caching layer
- Connection pooling
- Request pagination
- Asynchronous processing via message queue

## Troubleshooting

### Services won't start

1. Check environment variables
2. Verify database connectivity
3. Check port availability
4. Review service logs

### Database migration issues

```bash
yarn db:migrate reset
yarn db:migrate
yarn db:seed
```

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/feature-name`
4. Create Pull Request

## License

MIT

## Support

For issues and questions, please open a GitHub issue or contact the development team.

---

**Last Updated**: December 2024

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
