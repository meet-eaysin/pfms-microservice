# User Service

User profile and preferences management service for PFMS.

## Features

- User profile management (CRUD)
- Financial preferences (currency, risk tolerance, fiscal year)
- Notification settings
- Family/household management
- Avatar upload with S3 storage
- Event-driven integration

## Tech Stack

- Express.js
- PostgreSQL + Prisma
- Redis (caching)
- S3/MinIO (file storage)
- RabbitMQ (events)

## API Endpoints

- `GET/PUT /api/v1/user/profile` - Profile management
- `POST /api/v1/user/profile/avatar` - Avatar upload
- `GET/PUT /api/v1/user/preferences/financial` - Financial settings
- `GET/PUT /api/v1/user/preferences/notifications` - Notification settings
- `GET/POST/DELETE /api/v1/user/family` - Family management

## Development

```bash
# Install dependencies
yarn install

# Run migrations
yarn prisma:migrate

# Start development server
yarn dev

# Build
yarn build

# Run tests
yarn test
```

## Environment Variables

See `.env.example` for required configuration.
