# Investment Service Documentation

## 1. Service Overview

**Service Name**: `investment-service`
**Purpose**: Manages investment portfolios, tracks asset performance, and records buy/sell transactions.
**Responsibility**:

- Portfolio Creation & Management
- Transaction Recording (Buy, Sell, Dividend, Transfer)
- Performance Analytics (ROI, Realized/Unrealized Gains)
- Asset Attribution (Stocks, Crypto, ETFs, custom assets)
  **Business Value**: Allows users to track their Net Worth growth and investment strategy effectiveness.
  **Scope**:
- **In Scope**: Tracking quantity/cost basis, calculating returns.
- **Out of Scope**: Placing actual trade orders to brokers, Real-time Market Data fetching (Delegated to `market-data-service`).

## 2. Functional Description

**Core Features**:

- Multi-portfolio support (Retirement, Checking, Crypto Wallet).
- FIFO (First-In-First-Out) logic for capital gains calculation.
- Historical value tracking.
  **Internal Responsibilities**:
- Listening to market price updates to re-value portfolios.
  **Non-functional Expectations**:
- **Latency**: Portfolio summary calculations can be heavy; caching is critical.

## 3. Database Design

**Database Type**: PostgreSQL (Primary) + Redis (Cache)

### Schema (Key Tables)

#### `portfolios`

| Column        | Type    | Description |
| :------------ | :------ | :---------- |
| `id`          | UUID    | PK          |
| `user_id`     | UUID    | FK          |
| `name`        | VARCHAR | "Roth IRA"  |
| `description` | TEXT    |             |

#### `assets`

| Column          | Type    | Description      |
| :-------------- | :------ | :--------------- |
| `id`            | UUID    | PK               |
| `portfolio_id`  | UUID    | FK               |
| `symbol`        | VARCHAR | "AAPL", "BTC"    |
| `quantity`      | DECIMAL | Current Holdings |
| `avg_buy_price` | DECIMAL | Cost Basis       |

#### `investment_transactions`

| Column           | Type      | Description                |
| :--------------- | :-------- | :------------------------- |
| `id`             | UUID      | PK                         |
| `asset_id`       | UUID      | FK                         |
| `type`           | ENUM      | BUY, SELL, DIVIDEND, SPLIT |
| `quantity`       | DECIMAL   |                            |
| `price_per_unit` | DECIMAL   |                            |
| `fees`           | DECIMAL   |                            |
| `date`           | TIMESTAMP |                            |

**Data Lifecycle**: Indefinite retention.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to record that I bought 10 shares of Apple."
- "As a user, I want to see my portfolio's total value today."
- "As a user, I want to see how much dividend I earned this year."
  **System-Driven**:
- "Recalculate portfolio value when market closes."
- "Analyze portfolio sentiment using `intelligence-service` news feed."
  **Edge Cases**:
- Stock splits (Requires adjusting quantity/price history).
- Asset delisting.

## 5. API Design (Port 3005)

### Portfolios

#### List Portfolios

**Endpoint**: `GET /api/v1/portfolios`

- **Response**: `{ "portfolios": [...] }`

#### Create Portfolio

**Endpoint**: `POST /api/v1/portfolios`

- **Body**: `{ "name": "Crypto" }`

#### Portfolio Summary

**Endpoint**: `GET /api/v1/portfolios/:id/summary`

- **Response**:
  ```json
  {
    "totalInvested": 10000,
    "currentValue": 12000,
    "unrealizedGain": 2000,
    "returnPct": 20.0
  }
  ```

### Transactions

#### Record Transaction

**Endpoint**: `POST /api/v1/portfolios/:id/transactions`

- **Body**:
  ```json
  {
    "symbol": "AAPL",
    "type": "BUY",
    "quantity": 10,
    "price": 150.0,
    "date": "2024-01-01"
  }
  ```
- **Response**: `{ "transaction": ... }`
- **Events**: `investment.transaction.created`

#### Get History

**Endpoint**: `GET /api/v1/portfolios/:id/transactions`

### Analytics

#### Get Performance

**Endpoint**: `GET /api/v1/portfolios/:id/performance`

- **Query**: `period=1Y`
- **Response**: `{ "chart_data": [...] }`

## 6. Inter-Service Communication

**Calls**:

- `market-data-service`: To validate symbols and get current prices.
  **Called By**:
- **API Gateway**
- `tax-service`: To calculate Capital Gains.
- `report-service`: Investment summarization.
  **Events Published**:
- `investment.transaction.created`:
  - `tax-service`: Capital gains tracking.
  - `ledger-service`: Update Cashflow (if linked to cash account).
    **Subscribed Events**:
- `market.price_update`: Trigger re-valuation.

## 7. Third-Party Dependencies

- None (Relies on Market Data Service).

## 8. Security Considerations

- **Data Isolation**: Ensure user can only see their own portfolios.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `investment_transactions_total`
- **Logs**: Audit logs for manually entered trades.

## 11. Error Handling & Edge Cases

- **Selling more than owned**: Validation Error (400) - Short selling not supported in MVP.

## 12. Assumptions & Open Questions

- **Assumption**: User manually enters trades (Bank sync out of scope).
