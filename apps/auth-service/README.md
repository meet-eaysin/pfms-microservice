# Auth Service

The `auth-service` handles user authentication, session management, MFA, and password security for the PFMS microservices ecosystem. It follows a clean architecture with strict TypeScript typing and relies on `@pfms/config` for centralized configuration.

## Features

- **Authentication**: JWT-based access (15m) and refresh tokens (7d).
- **Session Management**: Redis-backed session tracking and revocation.
- **Security**: Argon2 password hashing, Helmet security headers.
- **MFA**: TOTP-based Multi-Factor Authentication (Google Authenticator, Authy).
- **Password Management**: Secure Forgot/Reset Password flows (token-based).

## Architecture

- **Domain Layer**: Core entities (`User`, `Session`) and ports (`Repositories`, `Services`).
- **Application Layer**: Use cases per feature (`RegisterUser`, `LoginUser`, `EnableMfa`, etc.).
- **Infrastructure Layer**: Adapters for Prisma (Postgres), Redis, JWT, and Event Bus.
- **Interface Layer**: NestJS Controllers exposing REST endpoints.

## Prerequisites

- Node.js v24+
- PostgreSQL
- Redis
- RabbitMQ (for event publishing, modeled with SimpleEventPublisher currently)

## Configuration

Configuration is managed via `@pfms/config`. Ensure the following environment variables are set (checked at startup):

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `RABBITMQ_URL`

## Running the Service

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run in development mode
npm run dev

# Run unit tests
npm run test:unit
```

## API Endpoints

| Method | Endpoint                | Description                       |
| :----- | :---------------------- | :-------------------------------- |
| POST   | `/auth/register`        | Register a new user               |
| POST   | `/auth/login`           | Login and receive tokens          |
| POST   | `/auth/logout`          | Revoke session                    |
| POST   | `/auth/refresh`         | Rotate tokens using refresh token |
| POST   | `/auth/mfa/enable`      | Generate MFA secret and QR code   |
| POST   | `/auth/mfa/verify`      | Verify OTP and enable MFA         |
| POST   | `/auth/forgot-password` | Request password reset link       |
| POST   | `/auth/reset-password`  | Reset password using token        |

## Testing

The service has comprehensive unit test coverage for all use cases.

```bash
npm run test:unit
```
