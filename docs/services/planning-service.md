# Planning Service Documentation

## 1. Service Overview

**Service Name**: `planning-service`
**Purpose**: Helps users plan their financial future through Budgeting, Goals, and Automation.
**Responsibility**:

- Budget Management (Monthly limits)
- Savings Goals (Tracking progress)
- Automation Rules (Trigger-Action workflows)
- Scheduled Financial Tasks
  **Business Value**: Turns "Passive Tracking" into "Active Financial Management".
  **Scope**:
- **In Scope**: Rules logic, Goal math, Budget thresholds.
- **Out of Scope**: Storing transactions (Ledger does this).

## 2. Functional Description

**Core Features**:

- "If This Then That" engine for finance.
- Envelope budgeting logic (or simple category caps).
- Goal projection (Time to reach goal).
  **Internal Responsibilities**:
- Listening to `expense.created` and `income.received` events to execute rules/check budgets.
  **Non-functional Expectations**:
- **Reliability**: Automation must trigger exactly once (Idempotency key required).

## 3. Database Design

**Database Type**: PostgreSQL (Primary) + Redis (Jobs)

### Schema (Key Tables)

#### `budgets`

| Column         | Type    | Description     |
| :------------- | :------ | :-------------- |
| `id`           | UUID    | PK              |
| `user_id`      | UUID    | FK              |
| `category_id`  | UUID    | FK              |
| `amount_limit` | DECIMAL |                 |
| `period`       | ENUM    | MONTHLY, YEARLY |

#### `savings_goals`

| Column           | Type    | Description |
| :--------------- | :------ | :---------- |
| `id`             | UUID    | PK          |
| `user_id`        | UUID    | FK          |
| `name`           | VARCHAR | "New Car"   |
| `target_amount`  | DECIMAL |             |
| `current_amount` | DECIMAL |             |
| `deadline`       | DATE    |             |

#### `automation_rules`

| Column           | Type    | Description                |
| :--------------- | :------ | :------------------------- |
| `id`             | UUID    | PK                         |
| `user_id`        | UUID    | FK                         |
| `trigger_type`   | VARCHAR | "TRANSACTION_CREATED"      |
| `conditions`     | JSONB   | e.g. `{ amount: "> 500" }` |
| `action_type`    | VARCHAR | "SEND_NOTIFICATION"        |
| `action_payload` | JSONB   |                            |

**Data Lifecycle**: Indefinite.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to set a limit of $500 for Dining Out."
- "As a user, I want to save for a $20,000 car by next year."
- "As a user, I want to be notified if I spend more than $100 in one go."
  **System-Driven**:
- "Automatically move 10% of income to Savings Goal 'Retirement' when Salary hits."
  **Edge Cases**:
- Budget overhaul (User changes past limits?).
- Rule recursion (A triggers B triggers A - Loop detection needed).

## 5. API Design (Port 3011)

### Budgets

#### Set Budget

**Endpoint**: `POST /api/v1/planning/budgets`

- **Body**: `{ "categoryId": "uuid", "limit": 500 }`

#### Get Status

**Endpoint**: `GET /api/v1/planning/budgets/status`

- **Response**: `{ "category": "Food", "spent": 450, "limit": 500, "remaining": 50 }`

### Automation

#### Create Rule

**Endpoint**: `POST /api/v1/automation/rules`

- **Body**:
  ```json
  {
    "name": "Big Spend Alert",
    "trigger": { "type": "transaction", "amount_gt": 100 },
    "action": { "type": "notify", "message": "High spend detected!" }
  }
  ```

#### Toggle Rule

**Endpoint**: `PATCH /api/v1/automation/rules/:id/status`

### Goals

#### Create Goal

**Endpoint**: `POST /api/v1/planning/goals`

- **Body**: `{ "target": 10000, "date": "2025-01-01" }`

#### Contribute

**Endpoint**: `POST /api/v1/planning/goals/:id/contribute`

- **Body**: `{ "amount": 100 }`

## 6. Inter-Service Communication

**Calls**:

- `notification-service`: To send alerts.
- `ledger-service`: To check category spending totals.
  **Called By**:
- **API Gateway**
  **Events Published**:
- `automation.rule_triggered`:
  - `notification-service`: Deliver message.
- `budget.exceeded`:
  - `notification-service`: Alert user.

## 7. Third-Party Dependencies

- None.

## 8. Security Considerations

- **Isolation**: Users only see their rules.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `automation_rules_executed_total`
- **Logs**: Execution trace for every rule run.

## 11. Error Handling & Edge Cases

- **Action Failure**: Retry logic (Exponential backoff) for failed automation actions.

## 12. Assumptions & Open Questions

- **Assumption**: Rules are synchronous or near-real-time.
