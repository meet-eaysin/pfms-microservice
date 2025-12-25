# Monorepo & Deployment Architecture

## 1. Repository Structure
We use **Turborepo** to manage the lifecycle of 8 applications and shared packages.

```
.
├── apps/
│   ├── identity/           # NestJS (Auth + User)
│   ├── notification/       # NestJS (Infrastructure)
│   ├── ledger/             # NestJS (Expense + Income + Tax)
│   ├── planning/           # NestJS (Savings + Automation)
│   ├── social-finance/     # NestJS (Groups)
│   ├── investment/         # NestJS (Investments)
│   ├── lending/            # NestJS (Loans)
│   └── intelligence/       # NestJS (Python optional for ML parts)
│
├── packages/
│   ├── api-client/         # SDKs for inter-service communication
│   ├── common/             # Utils, DateTime, Strings
│   ├── events/             # RabbitMQ Payload Definitions
│   ├── logger/             # Standardized Pino Logger
│   └── types/              # TS Interfaces shared frontend/backend
│
├── infra/
│   ├── docker/             # Docker Compose files
│   └── k8s/                # Helm Charts / Manifests
│
└── docs/                   # Consolidated Documentation
```

## 2. Shared Libraries Strategy
To maintain modularity without code duplication:

- **`packages/database`**:
    - Contains the *Types/Interfaces* for DB connections.
    - **Crucial**: Each service has its own *Physical Database* (logical schema separation), but might share the same Prisma Client generator config for consistency.
- **`packages/events`**:
    - Defines the `Event Types` for RabbitMQ.
    - Strong typing ensures `identity-service` emits `UserCreatedEvent` that `planning-service` consumes safely.

## 3. Communication Patterns

### Synchronous (REST / gRPC)
- Used for **Queries** where data freshness is real-time critical.
- Example: Ledger reads User Profile from Identity.
- **Resilience**: All internal calls wrapped in Circuit Breakers (Opossum).

### Asynchronous (RabbitMQ)
- Used for **Commands** and **Side Effects**.
- Example: "Transaction Created" -> Update Budget / Send Notification.
- **Guarantees**: At-least-once delivery. Idempotency keys required on consumer side.

## 4. Deployment Strategy

### Docker Compose (Local & Dev)
Single command to spin up the world:
```bash
docker-compose up -d
```
Runs:
- Postgres (Shared instance, multiple DBs)
- Redis
- RabbitMQ
- Kong (API Gateway)
- All 8 Apps (Hot Reload)

### Kubernetes (Production)
- **Ingress**: Kong Ingress Controller.
- **Services**: ClusterIP.
- **Scaling**: HPA (Horizontal Pod Autoscaler) enabled on `ledger` and `identity` services based on CPU/Memory.

## 5. CI/CD Pipeline (GitHub Actions)

### Quality Gates
1. **Lint & Type Check**: Runs on all PRs.
2. **Unit Tests**: Runs `test:unit` on affected packages.
3. **Contract Tests**: Verifies API Consumer/Provider alignment.

### Delivery
1. **Build**: Docker Build & Push to ECR/DockerHub.
2. **Deploy**:
   - `dev`: Auto-deploy on merge to `main`.
   - `prod`: Manual approval tag.

## 6. API Gateway Configuration (Kong)
Kong sits at the edge (`api.pfms.com`) and routes traffic:

- `/auth/*` -> `identity-service`
- `/user/*` -> `identity-service`
- `/finance/transactions/*` -> `ledger-service`
- `/finance/budgets/*` -> `planning-service`
- `/social/groups/*` -> `social-finance-service`
- `/invest/*` -> `investment-service`
- `/loans/*` -> `lending-service`
- `/insights/*` -> `intelligence-service`
