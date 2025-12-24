# PFMS - Personal Financial Management System

Enterprise-grade microservices platform for personal financial management, built with Node.js, TypeScript, and Docker.

## 🚀 Status

**Active Development**

- **Core Services**: Auth, Expense, Web, API Gateway
- **Infrastructure**: Fully defined for 14 microservices (Docker Compose, Kong, RabbitMQ, PostgreSQL, Redis)
- **CI/CD**: GitHub Actions optimized workflow with Docker registries

## 🛠 Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/) + [Yarn Workspaces](https://yarnpkg.com/features/workspaces) (v4 via Corepack)
- **Runtime**: Node.js v20.9.0 (LTS)
- **Languages**: TypeScript
- **Frameworks**:
  - **Backend**: NestJS (Auth, User), Express.js (Expense, etc.)
  - **Frontend**: Next.js (Web)
- **Databases**:
  - **PostgreSQL 16**: Per-service isolated databases
  - **MongoDB**: AI/Analytics service
- **Caching**: Redis 7
- **Message Broker**: RabbitMQ (Event-driven architecture)
- **API Gateway**: Kong (v3.4, DB-less mode)
- **Authentication**: Better-Auth with JWT & JWKS
- **DevOps**: Docker, Docker Compose, GitHub Actions

## 🏗 Architecture

The system is composed of loose-coupled microservices communicating via an Event Bus (RabbitMQ) and exposed through a unified API Gateway (Kong).

### Services Overview

| Service          | Port (Internal) | Database          | Description                                |
| ---------------- | --------------- | ----------------- | ------------------------------------------ |
| **API Gateway**  | 8000 (Public)   | -                 | Kong Gateway. Entry point for ALL traffic. |
| **Auth**         | 3001            | `auth_db`         | Identity, JWT issuance, JWKS provider.     |
| **User**         | 3002            | `user_db`         | User profiles, preferences.                |
| **Expense**      | 3003            | `expense_db`      | Expense tracking, categorization.          |
| **Income**       | 3004            | `income_db`       | Income sources, paychecks.                 |
| **Investment**   | 3005            | `investment_db`   | Portfolio tracking.                        |
| **Loan**         | 3006            | `loan_db`         | Debt management.                           |
| **Group**        | 3007            | `group_db`        | Shared expenses (Splitwise-like).          |
| **Tax**          | 3008            | `tax_db`          | Tax estimation.                            |
| **AI**           | 3009            | MongoDB           | Insights, categorization models.           |
| **Notification** | 3010            | `notification_db` | Email, push, in-app alerts.                |
| **Automation**   | 3011            | `automation_db`   | Recurring rules.                           |
| **Report**       | 3012            | `report_db`       | PDF/CSV exports.                           |
| **Market**       | 3013            | `market_db`       | External financial data.                   |
| **Savings**      | 3014            | `savings_db`      | Goal tracking.                             |

> **Note**: Ports 3001-3014 are internal to the Docker network. Access services via `http://localhost:8000/api/v1/...`

### Project Structure

```bash
pfms-microservice/
├── apps/
│   ├── api-gateway/         # Kong configuration (declarative)
│   ├── auth-service/        # NestJS
│   ├── expense-service/     # Express.js
│   └── web/                 # Next.js Frontend
├── packages/
│   ├── api-client/          # Shared Axios client
│   ├── config/              # Centralized env validation
│   ├── event-bus/           # RabbitMQ wrappers
│   ├── types/               # Shared TypeScript interfaces (DTOs)
│   └── utils/               # Common helpers
├── infra/                   # Infrastructure as Code
│   ├── docker-compose.base.yml     # Databases, RabbitMQ, Redis
│   ├── docker-compose.services.yml # App services definition
│   └── docker-compose.dev.yml      # Dev configurations
└── .github/workflows/       # CI/CD Pipelines
```

## ⚡ Quick Start

### Prerequisites

- Node.js >= 20.9
- Docker & Docker Compose
- Yarn (managed via Corepack)

### 1. Setup Environment

```bash
# Enable Corepack (for Yarn 4)
corepack enable

# Install dependencies
yarn install

# Generate Prisma clients and shared packages
yarn build:packages
```

### 2. Start Infrastructure (Databases & Core)

```bash
# Starts Postgres, Redis, RabbitMQ, Kong, MailHog
docker-compose -f infra/docker-compose.base.yml -f infra/docker-compose.dev.yml up -d
```

### 3. Start Microservices

**Option A: Run locally (for development)**

```bash
# Run all services (defined in turbo.json)
yarn dev

# OR run specific service
yarn workspace @pfms/expense-service dev
```

**Option B: Run with Docker**

```bash
# Start everything using the consolidated infra definition
docker-compose -f infra/docker-compose.base.yml \
               -f infra/docker-compose.services.yml \
               -f infra/docker-compose.dev.yml up -d --build
```

### 4. Verify Access

- **Kong Gateway**: http://localhost:8000
- **Kong Admin**: http://localhost:8001
- **RabbitMQ Dashboard**: http://localhost:15672 (user: `guest`, pass: `guest`)
- **MailHog**: http://localhost:8025

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and delivery.

- **Workflow File**: `.github/workflows/ci-cd.yml`
- **Triggers**: Push to `main`/`develop`, Pull Requests.
- **Jobs**:
  - **Quality**: Linting, Type-checking.
  - **Test**: Unit tests (Sharded), Integration tests (with Docker containers).
  - **Security**: Trivy FS scan (SARIF upload).
  - **Docker**: Builds and pushes multi-stage images to GHCR (only on push).

## 🔐 Security & Auth

Authentication is centralized via **Auth Service** using [Better-Auth](https://better-auth.com).

- **Flow**: User logs in -> Auth Service -> Returns Session/JWT.
- **Gateway**: Kong verifies JWTs against Auth Service's JWKS endpoint.
- **Service-to-Service**: Internal requests usually bypass Auth (trusted network) or forward JWT headers.

## 📦 Database Management

We use **Prisma** for PostgreSQL services.

```bash
# Run migrations for a specific service
yarn workspace @pfms/auth-service prisma migrate dev

# accessible via
yarn db:studio
```

## 🤝 Contributing

1. **Clone & Install**: `yarn install`
2. **Branch**: `feature/my-feature`
3. **Commit**: Conventional Commits (e.g., `feat: add new expense type`)
4. **Push & PR**: CI will run automatically.

## 📄 License

MIT
