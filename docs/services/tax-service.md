# Tax Service Documentation

## 1. Service Overview

**Service Name**: `tax-service`
**Purpose**: Estimates tax liabilities and tracks deductions to prevent end-of-year surprises.
**Responsibility**:

- Tax Profile Management (Filing status, Region)
- Tax Liability Estimation (Progressive brackets)
- Deduction Tracking (Receipts, Categories)
- Capital Gains Calculation (Short vs Long term)
  **Business Value**: Financial peace of mind and compliance.
  **Scope**:
- **In Scope**: Estimation, Tracking, organizing data for filing.
- **Out of Scope**: Actual filing (e-filing), Legal advice, Guaranteed accuracy (It is an _estimator_).

## 2. Functional Description

**Core Features**:

- Configurable Tax Brackets (Admin or Config file).
- Auto-calculation based on Income - Deductions.
- Deduction proof storage (links).
  **Internal Responsibilities**:
- Listening to `income.received` and `investment.transaction.created` to update estimates.
  **Non-functional Expectations**:
- **Accuracy**: Calculations must be mathematically precise based on the rules provided.

## 3. Database Design

**Database Type**: PostgreSQL

### Schema (Key Tables)

#### `tax_profiles`

| Column          | Type    | Description                 |
| :-------------- | :------ | :-------------------------- |
| `user_id`       | UUID    | PK, FK                      |
| `country`       | CHAR(2) | e.g., 'US', 'IN'            |
| `region`        | VARCHAR | State/Province              |
| `filing_status` | VARCHAR | SINGLE, MARRIED_JOINT, etc. |

#### `tax_brackets` (Lookup)

| Column       | Type    | Description |
| :----------- | :------ | :---------- |
| `country`    | CHAR(2) |             |
| `year`       | INT     |             |
| `min_income` | DECIMAL |             |
| `max_income` | DECIMAL |             |
| `rate`       | DECIMAL | %           |

#### `deductions`

| Column      | Type    | Description                         |
| :---------- | :------ | :---------------------------------- |
| `id`        | UUID    | PK                                  |
| `user_id`   | UUID    | FK                                  |
| `amount`    | DECIMAL |                                     |
| `category`  | VARCHAR | e.g. "Charity", "Mortgage Interest" |
| `proof_url` | VARCHAR |                                     |
| `tax_year`  | INT     |                                     |

**Data Lifecycle**: Tax records typically kept for 7+ years.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to know how much tax I owe so far this year."
- "As a user, I want to log a charitable donation deduction."
  **System-Driven**:
- "Recalculate tax liability when a large bonus is recorded."
  **Edge Cases**:
- Tax laws change mid-year (Versioning of brackets).
- Cross-border income (Not supported in MVP).

## 5. API Design (Port 3008)

### Profile

#### Get Tax Profile

**Endpoint**: `GET /api/v1/tax/profile`

- **Response**: `{ "country": "US", "filingStatus": "SINGLE" }`

#### Update Profile

**Endpoint**: `PUT /api/v1/tax/profile`

- **Body**: `{ "filingStatus": "MARRIED_JOINT" }`

### Deductions

#### List Deductions

**Endpoint**: `GET /api/v1/tax/deductions`

- **Query**: `year`
- **Response**: `{ "deductions": [...], "total": 1200 }`

#### Add Deduction

**Endpoint**: `POST /api/v1/tax/deductions`

- **Body**: `{ "amount": 500, "category": "Charity", "date": "..." }`
- **Response**: `{ "deduction": ... }`

#### Remove Deduction

**Endpoint**: `DELETE /api/v1/tax/deductions/:id`

### Estimation

#### Calculate Liability

**Endpoint**: `GET /api/v1/tax/calculate`

- **Query**: `year` (Defaults to current)
- **Response**:
  ```json
  {
    "totalIncome": 100000,
    "totalDeductions": 12000,
    "taxableIncome": 88000,
    "estimatedTax": 15000,
    "effectiveRate": 0.15,
    "breakdown": [{ "bracket": "0-10000", "rate": 0.1, "tax": 1000 }]
  }
  ```
- **Logic**: Fetches Income from `income-service` (via Sync call or internal cache if event-driven), subtracts local deductions, applies bracket logic.

#### Capital Gains Report

**Endpoint**: `GET /api/v1/tax/capital-gains`

- **Response**: `{ "shortTerm": ..., "longTerm": ..., "tax": ... }`

## 6. Inter-Service Communication

**Calls**:

- `income-service`: To get total taxable income for the year.
- `investment-service`: To get realized gains/losses.
  **Called By**:
- **API Gateway**
- `report-service`: To generate Tax Report PDF.
  **Events Published**:
- `tax.report_generated`: Notification trigger.
  **Subscribed Events**:
- `income.received`: Triggers background recalculation.

## 7. Third-Party Dependencies

- None for MVP. (Future: TaxJar or similar APIs).

## 8. Security Considerations

- **Sensitive Data**: Financial, Government IDs (if stored). High security needed.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `tax_calculation_requests_total`
- **Logs**: Error logs for calculation failures.

## 11. Error Handling & Edge Cases

- **Missing Brackets**: Return error 500 "Tax configuration missing for this region/year".

## 12. Assumptions & Open Questions

- **Assumption**: We implement a simple progressive tax engine locally.
- **Open**: Do we support State/City taxes? (Start with Federal only).
