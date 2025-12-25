# Personal Financial Management System (PFMS) Architecture

## 1. System Overview

The PFMS is a microservices-based application designed to help users manage their personal finances, including expenses, income, investments, loans, and tax planning. The system allows for granular tracking, detailed analytics, and automated financial management.

## 2. Microservices Architecture

The system is built using a microservices architecture, with a central API Gateway routing traffic to various domain-specific services. Inter-service communication is handled via synchronous HTTP calls (for read operations) and asynchronous events via RabbitMQ (for write operations/side effects).

### 2.1 Service Breakdown

```mermaid
graph TD
    Client[Client App] --> Gateway[API Gateway (Kong)]
    Gateway --> Auth[Auth Service]
    Gateway --> User[User Service]
    Gateway --> Expense[Expense Service]
    Gateway --> Income[Income Service]
    Gateway --> Invest[Investment Service]
    Gateway --> Loan[Loan Service]
    Gateway --> Group[Group Service]
    Gateway --> Tax[Tax Service]
    Gateway --> AI[AI/Analytics Service]
    Gateway --> Notif[Notification Service]
    Gateway --> Auto[Automation Service]
    Gateway --> Report[Report Service]

    Auth --> EventBus[RabbitMQ Event Bus]
    User --> EventBus
    Expense --> EventBus
    Income --> EventBus
    Invest --> EventBus
    Loan --> EventBus

    EventBus --> Notif
    EventBus --> Auto
    EventBus --> AI
```

### 2.2 Core Technology Stack

- **Monorepo Tooling**: Turborepo
- **Backend Frameworks**:
  - **NestJS**: For complex, enterprise-grade services (Auth, User, Loan, Tax, Notification, Automation).
  - **Express.js**: For lightweight, high-performance services (Expense, Income, Investment, Group, AI, Report).
- **Databases**:
  - **PostgreSQL**: Primary relational database for all transactional data.
  - **MongoDB**: For unstructured AI logs and chat history.
  - **Redis**: For caching, session management, and rate limiting.
- **Message Broker**: RabbitMQ
- **API Gateway**: Kong
- **Authentication**: better-auth (with JWT & OAuth)
- **Infrastructure**: Docker, Kubernetes (optional), GitHub Actions CI/CD.

## 3. Database Strategy

| Service          | Primary DB | Cache    | Purpose                                       |
| :--------------- | :--------- | :------- | :-------------------------------------------- |
| **Auth**         | PostgreSQL | Redis    | User auth, sessions, tokens                   |
| **User**         | PostgreSQL | Redis    | Profiles, preferences, settings               |
| **Expense**      | PostgreSQL | Redis    | Expenses, habits, categories                  |
| **Income**       | PostgreSQL | Redis    | Income sources, cashflow projections          |
| **Investment**   | PostgreSQL | Redis    | Portfolios, assets, transactions, market data |
| **Loan**         | PostgreSQL | Redis    | Loans, contacts, EMI schedules                |
| **Group**        | PostgreSQL | Redis    | Groups, expenses, settlements                 |
| **Tax**          | PostgreSQL | -        | Tax calculations, brackets, deductions        |
| **AI/Analytics** | MongoDB    | Redis    | ML models, chat sessions, logs                |
| **Notification** | PostgreSQL | Redis    | Templates, history, preferences               |
| **Automation**   | PostgreSQL | Redis    | Rules, triggers, job schedules                |
| **Report**       | PostgreSQL | S3/MinIO | Report metadata, file storage                 |

## 4. Service Registry

| Service Name             | Port | Description                       | Documentation                                                  |
| :----------------------- | :--- | :-------------------------------- | :------------------------------------------------------------- |
| `auth-service`           | 3001 | Authentication, MFA, Sessions     | [Auth Service](./services/auth-service.md)                     |
| `user-service`           | 3002 | User Profiles, Settings, Family   | [User Service](./services/user-service.md)                     |
| `expense-service`        | 3003 | Expenses, Habits, Categories      | [Expense Service](./services/expense-service.md)               |
| `income-service`         | 3004 | Income tracking, Salary, Cashflow | [Income Service](./services/income-service.md)                 |
| `investment-service`     | 3005 | Portfolio management, Assets      | [Investment Service](./services/investment-service.md)         |
| `lending-service`        | 3006 | Loans, Debts, Contacts            | [Lending Service](./services/lending-service.md)               |
| `social-finance-service` | 3007 | Group finances, Bill splitting    | [Social Finance Service](./services/social-finance-service.md) |
| `tax-service`            | 3008 | Tax estimation, Deductions        | [Tax Service](./services/tax-service.md)                       |
| `intelligence-service`   | 3009 | AI Chat, Insights, Categorization | [Intelligence Service](./services/intelligence-service.md)     |
| `notification-service`   | 3010 | Push, Email, SMS delivery         | [Notification Service](./services/notification-service.md)     |
| `planning-service`       | 3011 | Automation Rules, Savings Goals   | [Planning Service](./services/planning-service.md)             |
| `report-service`         | 3012 | PDF/Excel Export generation       | [Report Service](./services/report-service.md)                 |
| `market-data-service`    | 3013 | External market data fetching     | [Market Data Service](./services/market-data-service.md)       |
