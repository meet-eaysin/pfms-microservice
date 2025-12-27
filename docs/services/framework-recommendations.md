# Framework & Library Recommendations for PFMS Microservices

## Overview

Based on analysis of all 14 service specifications, here are the recommended frameworks and libraries for the JavaScript/TypeScript ecosystem.

## Framework Decision Matrix

| Service | Framework | Rationale |
|---------|-----------|-----------|
| **auth-service** | **Express** | Already uses `better-auth` (framework-agnostic). Keep simple. |
| **user-service** | **Express** | Already implemented. Simple CRUD, no complex DI needed. |
| **expense-service** | **NestJS** | ✅ Already refactored. Complex business logic, multiple features. |
| **income-service** | **NestJS** | Similar to expense-service. Benefits from DI and modules. |
| **investment-service** | **NestJS** | Complex domain (portfolios, transactions, tax lots). Needs structure. |
| **ledger-service** | **NestJS** | Central aggregator. High complexity, event-driven. |
| **planning-service** | **NestJS** | Budget calculations, goal tracking. Complex business rules. |
| **tax-service** | **NestJS** | Tax calculations, compliance rules. Needs testable structure. |
| **lending-service** | **NestJS** | Loan amortization, payment schedules. Complex calculations. |
| **social-finance-service** | **NestJS** | Group management, splitting logic. Moderate complexity. |
| **intelligence-service** | **Express + BullMQ** | AI/ML workloads. Needs job queues, not DI overhead. |
| **market-data-service** | **Express + Socket.io** | WebSocket for real-time prices. Simple caching logic. |
| **notification-service** | **Express + BullMQ** | Message queue worker. Simple delivery logic. |
| **report-service** | **Express + BullMQ** | PDF generation jobs. Async processing, no complex DI. |

## Detailed Recommendations

### 1. NestJS Services (Complex Business Logic)

**Use For:**
- expense-service ✅
- income-service
- investment-service
- ledger-service
- planning-service
- tax-service
- lending-service
- social-finance-service

**Why NestJS:**
- Built-in DI container (Clean Architecture support)
- Modular structure (aligns with our refactored expense-service)
- Excellent TypeScript support
- Built-in validation (class-validator)
- Swagger/OpenAPI integration
- Testing utilities

**Stack:**
```typescript
- Framework: NestJS
- ORM: Prisma
- Validation: class-validator + class-transformer
- Testing: Jest
- API Docs: @nestjs/swagger
```

### 2. Express Services (Simple/Specialized)

**Use For:**
- auth-service ✅
- user-service ✅
- intelligence-service
- market-data-service
- notification-service
- report-service

**Why Express:**
- Lightweight, minimal overhead
- Framework-agnostic (works with better-auth, BullMQ, Socket.io)
- Simple routing for CRUD operations
- Easier to integrate specialized libraries

**Stack:**
```typescript
- Framework: Express
- ORM: Prisma
- Validation: Zod or Joi
- Testing: Jest + Supertest
- Job Queue: BullMQ (where needed)
```

## Specialized Library Recommendations

### AI/ML (intelligence-service)
```typescript
- LLM: OpenAI SDK / Google Generative AI
- Vector DB: @pinecone-database/pinecone or pgvector
- Chat History: MongoDB (mongoose)
- ML Models: TensorFlow.js (if local inference)
```

### Real-time (market-data-service)
```typescript
- WebSocket: Socket.io
- Caching: ioredis
- HTTP Client: axios (for external APIs)
- Rate Limiting: bottleneck
```

### Notifications (notification-service)
```typescript
- Queue: BullMQ
- Email: Nodemailer or @sendgrid/mail
- SMS: Twilio SDK
- Push: firebase-admin (FCM)
- Templates: Handlebars
```

### Reports (report-service)
```typescript
- Queue: BullMQ
- PDF: Puppeteer or PDFKit
- Excel: ExcelJS
- Storage: @aws-sdk/client-s3
- Charts: Chart.js (server-side rendering)
```

### Event-Driven (All Services)
```typescript
- Message Broker: amqplib (RabbitMQ)
- Event Bus: Custom wrapper (already exists in @pfms/event-bus)
```

## Shared Libraries (@pfms/*)

### Already Implemented
- `@pfms/date` - Date utilities ✅
- `@pfms/utils` - Common utilities ✅
- `@pfms/types` - Shared types ✅
- `@pfms/event-bus` - Event messaging ✅

### Recommended Additions
```typescript
@pfms/validation    // Shared validation schemas (Zod)
@pfms/errors        // Standard error types
@pfms/logger        // Winston/Pino wrapper
@pfms/metrics       // Prometheus client wrapper
@pfms/testing       // Test utilities
```

## Database Strategy

| Service | Primary DB | Cache | Rationale |
|---------|-----------|-------|-----------|
| auth-service | PostgreSQL | Redis | Better-auth requirement |
| user-service | PostgreSQL | Redis | Relational profiles |
| expense-service | PostgreSQL | Redis | Transactional data |
| income-service | PostgreSQL | Redis | Similar to expense |
| investment-service | PostgreSQL | Redis | Complex relations (tax lots) |
| ledger-service | PostgreSQL | Redis | Aggregated view |
| planning-service | PostgreSQL | Redis | Budget calculations |
| tax-service | PostgreSQL | Redis | Tax rules |
| lending-service | PostgreSQL | Redis | Loan schedules |
| social-finance-service | PostgreSQL | Redis | Group relations |
| intelligence-service | MongoDB + pgvector | Redis | Chat history + embeddings |
| market-data-service | PostgreSQL | Redis | Historical candles |
| notification-service | PostgreSQL | - | Notification log |
| report-service | PostgreSQL | - | Job tracking |

## Migration Strategy

### Phase 1: Keep Current (Done)
- ✅ auth-service (Express + better-auth)
- ✅ user-service (Express)
- ✅ expense-service (NestJS - just refactored)

### Phase 2: Implement Core Services (NestJS)
1. income-service
2. ledger-service
3. planning-service

### Phase 3: Implement Investment Domain (NestJS)
1. investment-service
2. market-data-service (Express + Socket.io)

### Phase 4: Implement Support Services
1. intelligence-service (Express + BullMQ)
2. notification-service (Express + BullMQ)
3. report-service (Express + BullMQ)

### Phase 5: Implement Remaining (NestJS)
1. tax-service
2. lending-service
3. social-finance-service

## Key Principles

1. **Use NestJS for complex business logic** (DI, modules, testability)
2. **Use Express for specialized workloads** (AI, WebSocket, job processing)
3. **Consistent Clean Architecture** across all services
4. **Shared libraries** for common functionality
5. **PostgreSQL + Redis** as default stack
6. **BullMQ** for async job processing
7. **Prisma** as ORM for all SQL databases

## Summary

- **8 NestJS services**: Complex business domains
- **6 Express services**: Simple CRUD or specialized workloads
- **All services**: Clean Architecture, Prisma, TypeScript, Jest
- **Specialized**: Socket.io, BullMQ, OpenAI SDK, Puppeteer as needed
