# Auth Service

Authentication service for PFMS using Better-Auth with Clean Architecture (DDD).

## Architecture

This service follows Domain-Driven Design (DDD) principles with clean architecture:

```
src/
├── domain/                 # Business logic & rules (framework-independent)
│   ├── entities/          # Core business objects
│   ├── value-objects/     # Immutable value types with validation
│   └── interfaces/        # Repository & service contracts
├── application/           # Use cases & orchestration
│   ├── use-cases/        # Specific business operations
│   ├── dto/              # Data transfer objects
│   └── services/         # Application services
├── infrastructure/        # External concerns & implementations
│   ├── database/         # Prisma repository implementation
│   ├── messaging/        # RabbitMQ event publisher
│   └── auth/             # Better-Auth adapter
├── presentation/          # HTTP layer (NestJS)
│   ├── controllers/      # REST API endpoints
│   ├── guards/           # Authentication guards
│   ├── decorators/       # Custom decorators
│   └── filters/          # Exception filters
├── common/               # Shared utilities
│   ├── types/           # TypeScript type definitions
│   ├── constants/       # Application constants
│   └── enums/           # Enumerations
├── config/              # Configuration modules
└── modules/             # NestJS module definitions

test/
├── unit/                # Unit tests (mirroring src structure)
│   ├── application/
│   ├── domain/
│   ├── infrastructure/
│   └── presentation/
├── integration/         # Integration tests
└── e2e/                # End-to-end tests
```

## Layer Responsibilities

### Domain Layer

- **Entities**: Core business objects (User, Session, Account)
- **Value Objects**: Immutable types with validation (Email, Password, UserId)
- **Interfaces**: Contracts for repositories and services
- **Rules**: No dependencies on outer layers, frameworks, or databases

### Application Layer

- **Use Cases**: Single-purpose business operations (GetUserById, RevokeSession)
- **DTOs**: Request/response objects for API
- **Services**: Orchestrate use cases and coordinate between layers
- **Rules**: Can depend on domain layer only

### Infrastructure Layer

- **Database**: Prisma repository implementation
- **Messaging**: RabbitMQ event publishing
- **Auth**: Better-Auth adapter for authentication
- **Rules**: Implements domain interfaces, depends on domain layer

### Presentation Layer

- **Controllers**: HTTP endpoints and request handling
- **Guards**: Authentication/authorization
- **Decorators**: Custom parameter decorators
- **Filters**: Exception handling
- **Rules**: Depends on application layer, maps HTTP to use cases

## Key Features

### 1. Type Safety

- No `any` types - strict TypeScript throughout
- Proper typing for all Better-Auth interactions
- Type-safe Prisma queries with snake_case field mapping

### 2. Dependency Injection

- Constructor injection for all dependencies
- Interface-based abstractions
- Easy to test and mock

### 3. Separation of Concerns

- Each layer has clear responsibilities
- Business logic isolated in domain layer
- Infrastructure details hidden behind interfaces

### 4. Testability

- Unit tests for each layer
- Mocked dependencies
- Test structure mirrors source structure

## Configuration

Environment variables (see [.env.example](.env.example)):

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/pfms_auth

# Better-Auth
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
BETTER_AUTH_COOKIE_NAME=better-auth
BETTER_AUTH_COOKIE_SECURE=true
BETTER_AUTH_COOKIE_SAME_SITE=lax

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Server
SERVICE_PORT=3001
CORS_ORIGIN=http://localhost:3000
ENABLE_SWAGGER=true

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=guest
RABBITMQ_PASSWORD=guest
```

## Getting Started

### 1. Install Dependencies

```bash
yarn install
```

### 2. Setup Database

```bash
# Generate Prisma client
yarn prisma:generate

# Run migrations
yarn prisma:migrate

# (Optional) Open Prisma Studio
yarn prisma:studio
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Development Server

```bash
yarn dev
```

The service will be available at:

- API: http://localhost:3001
- Docs: http://localhost:3001/api/docs
- Health: http://localhost:3001/health

## API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Sign in
- `POST /auth/signout` - Sign out
- `GET /auth/session` - Get current session
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email
- `GET /auth/oauth/google` - Google OAuth
- `GET /auth/oauth/github` - GitHub OAuth

### Session Management

- `GET /auth/sessions` - List all sessions
- `DELETE /auth/sessions/:id` - Revoke specific session
- `DELETE /auth/sessions` - Revoke all sessions (except current)

### User

- `GET /auth/user/:id` - Get user by ID

### Health

- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe

## Testing

```bash
# Run all tests
yarn test

# Run unit tests
yarn test:unit

# Run with coverage
yarn test:cov

# Run in watch mode
yarn test:watch
```

Test structure:

```
test/unit/
├── application/        # Application service tests
├── domain/            # Value object & entity tests
├── infrastructure/    # Repository & adapter tests
└── presentation/      # Controller & guard tests
```

## Events Published

The service publishes these events to RabbitMQ:

### user.created

```typescript
{
  eventId: string;
  eventType: 'user.created';
  timestamp: string;
  version: '1.0';
  data: {
    userId: string;
    email: string;
    name: string | null;
    emailVerified: boolean;
    createdAt: Date;
  }
}
```

### session.created

```typescript
{
  eventId: string;
  eventType: 'session.created';
  timestamp: string;
  version: '1.0';
  data: {
    sessionId: string;
    userId: string;
    ipAddress: string | null;
    userAgent: string | null;
  }
}
```

### password.reset

```typescript
{
  eventId: string;
  eventType: 'password.reset';
  timestamp: string;
  version: '1.0';
  data: {
    userId: string;
    email: string;
  }
}
```

## Development Guidelines

### Adding New Features

1. **Start with Domain Layer**
   - Define entities or value objects
   - Create interfaces for repositories

2. **Create Use Case**
   - Add use case in `application/use-cases/`
   - Inject required dependencies

3. **Implement Infrastructure**
   - Implement repository methods
   - Add event publishers if needed

4. **Create Controller**
   - Add endpoint in presentation layer
   - Use DTOs for validation

5. **Write Tests**
   - Unit tests for each layer
   - Follow existing test patterns

### Code Style

- Use TypeScript strict mode
- No `any` types allowed
- Follow NestJS conventions
- Use dependency injection
- Prefer composition over inheritance
- Write self-documenting code

### Naming Conventions

- **Entities**: PascalCase (User, Session)
- **Value Objects**: PascalCase (Email, Password)
- **Use Cases**: PascalCase with suffix (GetUserByIdUseCase)
- **DTOs**: PascalCase with suffix (SignUpDto, UserResponseDto)
- **Interfaces**: PascalCase with I prefix (IAuthRepository)
- **Files**: kebab-case matching class name

## Folder Structure for All PFMS Services

This folder structure should be consistently used across all microservices:

```
service-name/
├── src/
│   ├── domain/              # Business logic
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── interfaces/
│   ├── application/         # Use cases
│   │   ├── use-cases/
│   │   ├── dto/
│   │   └── services/
│   ├── infrastructure/      # External implementations
│   │   ├── database/
│   │   ├── messaging/
│   │   └── [service-specific]/
│   ├── presentation/        # HTTP/API layer
│   │   ├── controllers/
│   │   ├── guards/
│   │   ├── decorators/
│   │   └── filters/
│   ├── common/             # Shared code
│   │   ├── types/
│   │   ├── constants/
│   │   └── enums/
│   ├── config/             # Configuration
│   └── modules/            # Module definitions
├── test/
│   ├── unit/               # Unit tests (mirror src/)
│   ├── integration/        # Integration tests
│   └── e2e/               # End-to-end tests
├── prisma/                # Database schema
└── [config files]
```

## Troubleshooting

### Database Connection Issues

```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
yarn prisma db pull
```

### Better-Auth Configuration

- Ensure BETTER_AUTH_SECRET is at least 32 characters
- Generate with: `openssl rand -hex 32`
- Check cookie settings match your environment

### RabbitMQ Connection

```bash
# Check RabbitMQ is running
docker ps | grep rabbitmq

# Test connection
yarn test:integration
```

## Resources

- [Better-Auth Documentation](https://better-auth.com)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)

## License

MIT
