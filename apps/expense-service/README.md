# Expense Service

Expense tracking and management microservice with recurring expense support, categorization, and spending insights.

## Architecture

This service follows microservice best practices:

- **Isolated Database**: PostgreSQL (expense_db) - owns all data
- **Event-Driven**: Publishes `expense.*` events to RabbitMQ
- **Configuration**: Service-specific Zod validation in `src/config/`
- **Modules**: Business logic organized by domain (expenses, categories)
- **Events**: Domain-specific publishers/consumers in `src/events/`

## Quick Start

### Development

```bash
# Install dependencies
yarn install

# Create .env file
cp .env.example .env

# Run in dev mode (with hot reload)
yarn dev

# Run in production mode
yarn build && yarn start
```

### Environment

See `.env.example` for all configuration options:

```bash
SERVICE_PORT=3003
DATABASE_HOST=localhost
DATABASE_NAME=expense_db
RABBITMQ_HOST=localhost
REDIS_HOST=localhost
```

## API Endpoints

| Method | Path            | Description               |
| ------ | --------------- | ------------------------- |
| GET    | `/health`       | Health check              |
| GET    | `/ready`        | Readiness check           |
| GET    | `/expenses`     | List expenses (paginated) |
| GET    | `/expenses/:id` | Get single expense        |
| POST   | `/expenses`     | Create expense            |
| PUT    | `/expenses/:id` | Update expense            |
| DELETE | `/expenses/:id` | Delete expense            |

## Events

### Published

- `expense.created`: New expense created
- `expense.updated`: Expense updated
- `expense.deleted`: Expense deleted

### Consumed

- `user.created`: User signup (initialize categories)

## Folder Structure

```
src/
├── config/
│   └── config.schema.ts         # Service configuration & validation
├── events/
│   ├── publishers/
│   │   └── expense-events.ts    # Expense events (created, updated, deleted)
│   └── consumers/
│       └── user-created.consumer.ts  # Listen to user events
├── modules/
│   ├── expenses/
│   │   ├── expense.controller.ts
│   │   ├── expense.service.ts
│   │   └── expense.repository.ts
│   └── categories/
│       ├── category.controller.ts
│       └── category.service.ts
└── index.ts                     # Entry point
```

## Development

```bash
# Lint
yarn lint
yarn lint:fix

# Test
yarn test
yarn test:watch

# Type check
yarn check-types
```

## TODO

- [ ] Implement Prisma schema & migrations
- [ ] Add category management endpoints
- [ ] Implement recurring expense logic
- [ ] Add expense categorization via AI service
- [ ] Implement spending analytics
- [ ] Add import/export functionality

---

For full system architecture, see [root README.md](../../README.md)
