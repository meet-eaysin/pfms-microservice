# Income Service Documentation

## 1. Service Overview

**Service Name**: `income-service`
**Purpose**: Tracks all incoming funds to provide a complete picture of cashflow.
**Responsibility**:

- Income Recording (Salary, Freelance, Dividends)
- Income Source Management
- Cashflow Projection
  **Business Value**: Essential for "Net Worth" and "Savings Rate" calculations.
  **Scope**:
- **In Scope**: tracking inflows, projecting future repeatable inflows.
- **Out of Scope**: Banking integration (Bank Sync), Tax calculation (Tax Service).

## 2. Functional Description

**Core Features**:

- Manage Income Sources.
- Record Income Transactions.
- Forecast future income based on schedule.
  **Internal Responsibilities**:
- Aggregating total income for periods.
  **Non-functional Expectations**:
- **Reliability**: High confidence in numbers required for tax/planning.

## 3. Database Design

**Database Type**: PostgreSQL (Primary) + Redis (Cache)

### Schema (Key Tables)

#### `income_sources`

| Column         | Type    | Constraints                      | Description                              |
| :------------- | :------ | :------------------------------- | :--------------------------------------- |
| `id`           | UUID    | PK                               |                                          |
| `user_id`      | UUID    | FK                               |                                          |
| `name`         | VARCHAR |                                  | "Google Salary"                          |
| `type`         | ENUM    | SALARY, FREELANCE, PASSIVE, GIFT |                                          |
| `currency`     | CHAR(3) |                                  |                                          |
| `pay_schedule` | JSONB   |                                  | e.g. `{ frequency: "monthly", day: 25 }` |

#### `income_transactions`

| Column       | Type    | Description |
| :----------- | :------ | :---------- |
| `id`         | UUID    | PK          |
| `source_id`  | UUID    | FK          |
| `amount`     | DECIMAL |             |
| `date`       | DATE    |             |
| `is_taxable` | BOOLEAN |             |
| `notes`      | TEXT    |             |

**Data Lifecycle**: Indefinite retention.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to record my monthly paycheck."
- "As a user, I want to see how much I made this year."
  **System-Driven**:
- "Project cashflow for the next 3 months based on Salary schedule."
  **Edge Cases**:
- Irregular income (Bonuses).
- Late payments (date recorded vs date received).

## 5. API Design (Port 3004)

### Income Sources

#### List Sources

**Endpoint**: `GET /api/v1/income/sources`

- **Response**: `{ "sources": [...] }`

#### Create Source

**Endpoint**: `POST /api/v1/income/sources`

- **Body**: `{ "name": "Job", "type": "SALARY", "paySchedule": ... }`
- **Response**: `{ "source": { ... } }`

#### Update Source

**Endpoint**: `PUT /api/v1/income/sources/:id`

#### Delete Source

**Endpoint**: `DELETE /api/v1/income/sources/:id`

- **Constraint**: Cannot delete if transactions exist (Soft delete).

### Transactions

#### Record Income

**Endpoint**: `POST /api/v1/income/transactions`

- **Body**:
  ```json
  {
    "sourceId": "uuid",
    "amount": 5000.0,
    "date": "2024-01-25",
    "isTaxable": true
  }
  ```
- **Response**: `{ "transaction": ... }`
- **Events**: `income.received`

#### List Transactions

**Endpoint**: `GET /api/v1/income/transactions`

- **Query**: `startDate`, `endDate`, `sourceId`

### Analysis

#### Cashflow Projection

**Endpoint**: `GET /api/v1/income/cashflow/projection`

- **Query**: `months=3`
- **Response**:
  ```json
  {
    "projection": [
      { "month": "Feb", "estimated": 5000 },
      { "month": "Mar", "estimated": 5000 }
    ]
  }
  ```

## 6. Inter-Service Communication

**Calls**:

- None.
  **Called By**:
- **API Gateway**: UI access.
- `tax-service`: To get taxable income total.
- `planning-service`: To allocate savings from income.
  **Events Published**:
- `income.received`:
  - `tax-service`: Update liability estimate.
  - `planning-service`: Trigger "Pay Yourself First" rules.

## 7. Third-Party Dependencies

- None.

## 8. Security Considerations

- **Privacy**: Salary data is sensitive. Strictly scoped access.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `income_recorded_total`
- **Logs**: Standard access logs.

## 11. Error Handling & Edge Cases

- **Negative Amount**: Blocked (Use Expense for outflows, or specific refund txn logic if needed).

## 12. Assumptions & Open Questions

- **Assumption**: `income-service` is the source of truth for "Gross" income. Net income requires subtracting Tax (which `tax-service` handles).
