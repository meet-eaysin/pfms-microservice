# Expense Service Documentation

## 1. Service Overview

**Service Name**: `expense-service`
**Purpose**: Manages the recording, categorization, and tracking of money flowing out.
**Responsibility**:

- Expense Tracking (One-time and Recurring)
- Habit Tracking (Cost of habits)
- Expense Categorization (Hierarchical)
- Bulk Import/Export capabilities
  **Business Value**: Core function of a PFMS. Allows users to understand where their money goes.
  **Scope**:
- **In Scope**: Transaction records, receipts, categories, recurrence logic.
- **Out of Scope**: Payment processing (actual bank transfers), Income, Budgeting (Planning Service).

## 2. Functional Description

**Core Features**:

- Create/Read/Update/Delete expenses.
- Handling of "Habits" as a special type of expense aggregation.
- Support for split transactions and tags.
- Recurrence engine for subscriptions/bills.
  **Internal Responsibilities**:
- Validating category existence.
- Calculating recurrence next due dates.
  **Non-functional Expectations**:
- **Throughput**: High write volume supported (e.g. bulk imports).
- **Latency**: Fast read for lists/summaries.

## 3. Database Design

**Database Type**: PostgreSQL (Primary) + Redis (Cache)

### Schema (Key Tables)

#### `expenses`

| Column          | Type          | Constraints   | Description      |
| :-------------- | :------------ | :------------ | :--------------- |
| `id`            | UUID          | PK            |                  |
| `user_id`       | UUID          | FK            |                  |
| `amount`        | DECIMAL(12,2) | NOT NULL      |                  |
| `currency`      | CHAR(3)       | DEFAULT 'USD' |                  |
| `category_id`   | UUID          | FK            |                  |
| `date`          | TIMESTAMP     | NOT NULL      | Transaction date |
| `description`   | TEXT          |               |                  |
| `is_recurring`  | BOOLEAN       | DEFAULT FALSE |                  |
| `recurrence_id` | UUID          | FK            | Nullable         |

#### `categories`

| Column      | Type    | Description   |
| :---------- | :------ | :------------ |
| `id`        | UUID    | PK            |
| `name`      | VARCHAR |               |
| `parent_id` | UUID    | For hierarchy |
| `icon`      | VARCHAR | UI Icon name  |

#### `recurring_expenses`

| Column          | Type | Description                    |
| :-------------- | :--- | :----------------------------- |
| `id`            | UUID | PK                             |
| `frequency`     | ENUM | DAILY, WEEKLY, MONTHLY, YEARLY |
| `interval`      | INT  | e.g., every 2 weeks            |
| `next_due_date` | DATE |                                |

#### `habits`

| Column      | Type    | Description             |
| :---------- | :------ | :---------------------- |
| `id`        | UUID    | PK                      |
| `name`      | VARCHAR | "Smoking", "Coffee"     |
| `unit_cost` | DECIMAL | estimated cost per unit |

#### `habit_logs`

| Column     | Type | Description |
| :--------- | :--- | :---------- |
| `habit_id` | UUID | FK          |
| `quantity` | INT  |             |
| `date`     | DATE |             |

**Data Lifecycle**: Indefinite retention for financial history.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to add a $5 coffee expense."
- "As a user, I want to see my spending for last month."
- "As a user, I want to set up my Rent as a recurring expense."
  **System-Driven**:
- "Automatically create an expense entry when a Recurring Expense becomes due."
  **Edge Cases**:
- Changing the category of a past expense (Should update analytics).
- User changes currency (Old expenses remain in original currency or converted? - Store original, convert on read).

## 5. API Design (Port 3003)

### Expense Management

#### Create Expense

**Endpoint**: `POST /api/v1/expenses`

- **Auth**: Bearer Token
- **Body**:
  ```json
  {
    "amount": 15.5,
    "categoryId": "uuid",
    "date": "2024-01-01T12:00:00Z",
    "description": "Lunch"
  }
  ```
- **Response**: `{ "expense": { ... } }`
- **Validation**: Amount > 0, Category must exist.

#### Get Expenses

**Endpoint**: `GET /api/v1/expenses`

- **Query**:
  - `startDate`: ISO Date
  - `endDate`: ISO Date
  - `categoryId`: UUID (Optional)
  - `page`: Int
  - `limit`: Int
- **Response**:
  ```json
  {
    "data": [...],
    "pagination": { "total": 100, "page": 1 }
  }
  ```

#### Get Expense Details

**Endpoint**: `GET /api/v1/expenses/:id`

- **Response**: `{ "id": "...", ... }`

#### Update Expense

**Endpoint**: `PUT /api/v1/expenses/:id`

- **Body**: Partial expense object.

#### Delete Expense

**Endpoint**: `DELETE /api/v1/expenses/:id`

### Recurring Expenses

#### Create Recurring Rule

**Endpoint**: `POST /api/v1/expenses/recurring`

- **Body**:
  ```json
  {
    "amount": 1200,
    "description": "Rent",
    "frequency": "MONTHLY",
    "startDate": "2024-01-01"
  }
  ```

#### List Recurring

**Endpoint**: `GET /api/v1/expenses/recurring`

### Categories

#### List Categories

**Endpoint**: `GET /api/v1/categories`

- **Response**: `{ "categories": [ { "id": "...", "children": [...] } ] }`

#### Create Category

**Endpoint**: `POST /api/v1/categories`

- **Body**: `{ "name": "Food", "parentId": null }`

### Habits

#### Create Habit

**Endpoint**: `POST /api/v1/habits`

- **Body**: `{ "name": "Smoking", "unitCost": 12.00 }`

#### Log Habit

**Endpoint**: `POST /api/v1/habits/:id/log`

- **Body**: `{ "quantity": 1, "date": "..." }`

## 6. Inter-Service Communication

**Calls**:

- None directly for core flow.
  **Called By**:
- **API Gateway**: Access.
- `report-service`: Fetch data for PDFs.
  **Events Published**:
- `expense.created`:
  - `planning-service`: Check budget limits.
  - `intelligence-service`: Improve categorization model.
- `expense.updated`:
  - `planning-service`: Re-check budget.
- `expense.deleted`:
  - `planning-service`: Adjust budget usage.

## 7. Third-Party Dependencies

- None. pure internal logic.

## 8. Security Considerations

- **Data Isolation**: Strict `where: { userId: ... }` on all queries.
- **Input**: Sanitize descriptions.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `REDIS_URL`: Caching lists.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `expense_creation_total`
  - `expense_value_sum` (Business metric)
- **Logs**: Structured logging for all mutations.

## 11. Error Handling & Edge Cases

- **Invalid Category**: 400 Bad Request.
- **Future Date**: Allow (Users can log future expenses, though it might affect "Current" status).

## 12. Assumptions & Open Questions

- **Assumption**: Currency conversion happens on the client side or via a dedicated helper library/service if storing non-base currency.
- **Open**: Do we support multi-currency expenses? (Yes, Schema supports `currency` column).
