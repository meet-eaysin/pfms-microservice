# DDD Folder Structure Guide for PFMS Microservices

## Overview

All PFMS microservices follow a consistent Domain-Driven Design (DDD) architecture with clean separation of concerns. This guide standardizes the folder structure across all services.

## Standard Folder Structure

```
service-name/
├── src/
│   ├── domain/                    # Business Logic Layer
│   │   ├── entities/             # Core business objects
│   │   ├── value-objects/        # Immutable value types
│   │   └── interfaces/           # Repository & service contracts
│   │
│   ├── application/              # Application Layer
│   │   ├── use-cases/           # Specific business operations
│   │   ├── dto/                 # Data transfer objects
│   │   │   ├── request/         # Request DTOs
│   │   │   └── response/        # Response DTOs
│   │   └── services/            # Application services
│   │
│   ├── infrastructure/          # Infrastructure Layer
│   │   ├── database/           # Repository implementations
│   │   ├── messaging/          # Event publishers/subscribers
│   │   ├── cache/              # Redis/cache implementations
│   │   ├── external/           # External API clients
│   │   └── [service-specific]/ # Service-specific infrastructure
│   │
│   ├── presentation/           # Presentation Layer
│   │   ├── controllers/       # HTTP controllers
│   │   ├── guards/            # Authentication/authorization
│   │   ├── decorators/        # Custom decorators
│   │   ├── filters/           # Exception filters
│   │   ├── interceptors/      # Request/response interceptors
│   │   └── middleware/        # Custom middleware
│   │
│   ├── common/                # Shared Code
│   │   ├── types/            # TypeScript type definitions
│   │   ├── constants/        # Application constants
│   │   ├── enums/            # Enumerations
│   │   └── utils/            # Utility functions
│   │
│   ├── config/               # Configuration
│   │   ├── [feature].config.ts
│   │   └── index.ts
│   │
│   ├── modules/              # Module Definitions
│   │   ├── [feature].module.ts
│   │   └── app.module.ts
│   │
│   ├── app.module.ts         # Root module
│   └── main.ts               # Bootstrap file
│
├── test/                     # Tests
│   ├── unit/                # Unit tests (mirrors src/)
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── integration/         # Integration tests
│   └── e2e/                # End-to-end tests
│
├── prisma/                  # Database
│   └── schema.prisma
│
├── .env.example            # Environment template
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Layer Responsibilities

### 1. Domain Layer (`src/domain/`)
**Purpose**: Contains pure business logic, independent of frameworks and infrastructure.

#### Entities (`entities/`)
- Core business objects with identity
- Contain business logic and invariants
- Examples: `User`, `Transaction`, `Account`

```typescript
// user.entity.ts
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Value Objects (`value-objects/`)
- Immutable objects defined by their attributes
- Contain validation logic
- Examples: `Email`, `Money`, `UserId`

```typescript
// email.value-object.ts
export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!this.isValid(email)) {
      throw new Error('Invalid email format');
    }
    return new Email(email.toLowerCase());
  }

  static isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
```

#### Interfaces (`interfaces/`)
- Contracts for repositories and services
- Define operations without implementation
- Examples: `IUserRepository`, `IAuthService`

```typescript
// user.repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

**Rules**:
- No dependencies on outer layers
- No framework-specific code
- No database or HTTP knowledge
- Pure TypeScript/JavaScript

### 2. Application Layer (`src/application/`)
**Purpose**: Orchestrates domain logic and implements use cases.

#### Use Cases (`use-cases/`)
- Single-purpose business operations
- Coordinate domain entities and services
- Examples: `CreateUserUseCase`, `AuthenticateUserUseCase`

```typescript
// create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const email = Email.create(dto.email);
    const user = await this.userRepository.save({
      email: email.getValue(),
      name: dto.name,
      // ... other fields
    });
    return user;
  }
}
```

#### DTOs (`dto/`)
- Request and response data structures
- Input validation using class-validator
- Swagger/OpenAPI decorators

```typescript
// request/create-user.dto.ts
export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  name!: string;
}

// response/user-response.dto.ts
export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  name!: string | null;
}
```

#### Services (`services/`)
- Application-level services
- Orchestrate multiple use cases
- Handle transactions and cross-cutting concerns

```typescript
// user.application.service.ts
@Injectable()
export class UserApplicationService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async registerUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    await this.eventPublisher.publishUserCreated(user);
    return user;
  }
}
```

**Rules**:
- Can depend on domain layer
- No dependencies on infrastructure or presentation
- No framework-specific code (except DI decorators)
- Coordinates domain logic

### 3. Infrastructure Layer (`src/infrastructure/`)
**Purpose**: Implements technical capabilities and external integrations.

#### Database (`database/`)
- Repository implementations
- Database access logic
- ORM/Query builders

```typescript
// prisma.repository.ts
@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user ? this.toDomain(user) : null;
  }

  private toDomain(user: PrismaUser): User {
    return {
      id: user.id,
      email: user.email,
      // ... map fields
    };
  }
}
```

#### Messaging (`messaging/`)
- Event publishers and subscribers
- Message queue integration
- Event handlers

```typescript
// event.publisher.ts
@Injectable()
export class EventPublisher {
  constructor(private readonly eventBus: RabbitMQEventBus) {}

  async publishUserCreated(user: User): Promise<void> {
    await this.eventBus.publish('user.created', {
      eventId: crypto.randomUUID(),
      eventType: 'user.created',
      data: { userId: user.id, email: user.email },
    });
  }
}
```

#### Cache (`cache/`)
- Redis implementations
- Caching strategies

#### External (`external/`)
- Third-party API clients
- External service adapters

**Rules**:
- Implements domain interfaces
- Can depend on domain and application layers
- Contains all framework-specific code
- Handles technical concerns

### 4. Presentation Layer (`src/presentation/`)
**Purpose**: Handles HTTP requests and maps them to application layer.

#### Controllers (`controllers/`)
- HTTP endpoint definitions
- Request/response handling
- Swagger documentation

```typescript
// user.controller.ts
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private readonly userService: UserApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.registerUser(dto);
  }
}
```

#### Guards (`guards/`)
- Authentication guards
- Authorization guards
- Route protection

```typescript
// auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthApplicationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const session = await this.authService.getSession(request.headers);
    
    if (!session) {
      throw new UnauthorizedException();
    }

    request.user = session.user;
    return true;
  }
}
```

#### Decorators (`decorators/`)
- Custom parameter decorators
- Route metadata decorators

```typescript
// current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

#### Filters (`filters/`)
- Exception handling
- Error formatting

```typescript
// http-exception.filter.ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: exception instanceof Error ? exception.message : 'Internal server error',
    });
  }
}
```

**Rules**:
- Depends on application layer only
- Contains NestJS/Express-specific code
- Maps HTTP to use cases
- No business logic

### 5. Common Layer (`src/common/`)
**Purpose**: Shared utilities and constants.

#### Types (`types/`)
- Shared TypeScript types
- Utility types

```typescript
// pagination.types.ts
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

#### Constants (`constants/`)
- Application-wide constants
- Configuration values

```typescript
// auth.constants.ts
export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  SESSION_TIMEOUT_HOURS: 24,
  MAX_LOGIN_ATTEMPTS: 5,
} as const;
```

#### Enums (`enums/`)
- Shared enumerations

```typescript
// user-status.enum.ts
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}
```

**Rules**:
- No dependencies on any layer
- Pure utility code
- Reusable across layers

## Test Structure

Tests mirror the source structure:

```
test/
├── unit/
│   ├── application/
│   │   ├── use-cases/
│   │   └── services/
│   ├── domain/
│   │   ├── entities/
│   │   └── value-objects/
│   ├── infrastructure/
│   │   ├── database/
│   │   └── messaging/
│   └── presentation/
│       ├── controllers/
│       └── guards/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    └── scenarios/
```

## Naming Conventions

### Files
- **Entities**: `user.entity.ts`
- **Value Objects**: `email.value-object.ts`
- **Use Cases**: `create-user.use-case.ts`
- **DTOs**: `create-user.dto.ts`, `user-response.dto.ts`
- **Controllers**: `user.controller.ts`
- **Services**: `user.application.service.ts`, `user.domain.service.ts`
- **Guards**: `auth.guard.ts`
- **Filters**: `http-exception.filter.ts`

### Classes
- **Entities**: `User`, `Transaction`
- **Value Objects**: `Email`, `Money`
- **Use Cases**: `CreateUserUseCase`, `AuthenticateUserUseCase`
- **DTOs**: `CreateUserDto`, `UserResponseDto`
- **Services**: `UserApplicationService`
- **Interfaces**: `IUserRepository`, `IAuthService`

### Variables
- **camelCase**: `userId`, `emailAddress`
- **PascalCase**: Class names, interfaces, types
- **UPPER_SNAKE_CASE**: Constants

## Best Practices

### 1. Dependency Flow
```
Presentation → Application → Domain
     ↓              ↓
Infrastructure → Domain
```

- Outer layers depend on inner layers
- Inner layers never depend on outer layers
- Use dependency injection for all dependencies

### 2. Type Safety
- **NO `any` types** - Use proper TypeScript types
- Use strict TypeScript configuration
- Define interfaces for all contracts
- Use generics where appropriate

### 3. Separation of Concerns
- Each layer has specific responsibilities
- No mixing of concerns
- Business logic only in domain layer
- Technical details only in infrastructure

### 4. Testing
- Unit tests for each layer independently
- Mock dependencies using interfaces
- Integration tests for infrastructure
- E2E tests for critical flows

### 5. Error Handling
- Domain errors for business rule violations
- Application errors for use case failures
- Infrastructure errors for technical issues
- HTTP errors in presentation layer

## Migration Checklist

When migrating existing services to this structure:

- [ ] Create domain layer with entities and interfaces
- [ ] Extract business logic to value objects
- [ ] Create use cases for each operation
- [ ] Move DTOs to application/dto
- [ ] Implement repository pattern in infrastructure
- [ ] Move controllers to presentation layer
- [ ] Add guards and filters
- [ ] Reorganize tests to mirror structure
- [ ] Update imports throughout codebase
- [ ] Update module definitions
- [ ] Run tests to verify functionality
- [ ] Update documentation

## Resources

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

## Service-Specific Adaptations

While maintaining the core structure, services can add specific directories:

### Auth Service
```
infrastructure/
├── auth/          # Better-Auth adapter
```

### Expense Service
```
infrastructure/
├── ocr/           # Receipt OCR service
├── categorization/ # Auto-categorization
```

### Intelligence Service
```
infrastructure/
├── ml/            # Machine learning models
├── analytics/     # Analytics engines
```

Always maintain the core DDD structure while adding service-specific needs.
