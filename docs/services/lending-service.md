# Lending Service Documentation

## 1. Service Overview

**Service Name**: `lending-service`
**Purpose**: Manages debts, loans, and informal lending between the user and their contacts.
**Responsibility**:

- Loan Lifecycle Tracking (Lent vs Borrowed)
- Repayment Scheduling (EMI)
- Contact Management (Counter-parties)
- Dispute Resolution
  **Business Value**: Tracks "Who owes me" and "Who I owe", which is critical for accurate Net Worth calculation.
  **Scope**:
- **In Scope**: Peer-to-Peer loans, Bank loans, Credit card debt tracking.
- **Out of Scope**: Payment processing (actual money movement).

## 2. Functional Description

**Core Features**:

- Create Loans (Lent/Borrowed).
- Calculate EMI schedules.
- Record Payments.
- Track Default/Settled status.
  **Internal Responsibilities**:
- Interest calculation (Simple/Compound).
- Alerting for due dates.
  **Non-functional Expectations**:
- **Consistency**: Balance calculations must be exact.

## 3. Database Design

**Database Type**: PostgreSQL

### Schema (Key Tables)

#### `contacts`

| Column    | Type    | Description |
| :-------- | :------ | :---------- |
| `id`      | UUID    | PK          |
| `user_id` | UUID    | FK          |
| `name`    | VARCHAR |             |
| `email`   | VARCHAR | Optional    |

#### `loans`

| Column          | Type    | Description             |
| :-------------- | :------ | :---------------------- |
| `id`            | UUID    | PK                      |
| `contact_id`    | UUID    | FK                      |
| `type`          | ENUM    | LENT, BORROWED          |
| `principal`     | DECIMAL |                         |
| `balance`       | DECIMAL |                         |
| `interest_rate` | DECIMAL | %                       |
| `start_date`    | DATE    |                         |
| `status`        | ENUM    | ACTIVE, PAID, DEFAULTED |

#### `repayment_schedule`

| Column       | Type    | Description   |
| :----------- | :------ | :------------ |
| `id`         | UUID    | PK            |
| `loan_id`    | UUID    | FK            |
| `due_date`   | DATE    |               |
| `amount_due` | DECIMAL |               |
| `status`     | ENUM    | PENDING, PAID |

#### `payments`

| Column    | Type    | Description |
| :-------- | :------ | :---------- |
| `id`      | UUID    | PK          |
| `loan_id` | UUID    | FK          |
| `amount`  | DECIMAL |             |
| `date`    | DATE    |             |

**Data Lifecycle**: Loans retained until settled + archive period.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I lent $500 to Bob."
- "As a user, Bob paid me back $100."
- "As a user, I want to see my upcoming EMI for my Car Loan."
  **System-Driven**:
- "Mark loan as SETTLED when balance hits 0."
- "Convert 'Social Finance' group debt (User A owes User B $500) into a formal 'Loan' with interest."
  **Edge Cases**:
- Early repayment (Recalculate interest?).
- Partial payments.

## 5. API Design (Port 3006)

### Contacts

#### List Contacts

**Endpoint**: `GET /api/v1/contacts`

- **Response**: `{ "contacts": [...] }`

#### Create Contact

**Endpoint**: `POST /api/v1/contacts`

- **Body**: `{ "name": "Bob", "relationship": "Friend" }`

### Loans

#### Create Loan

**Endpoint**: `POST /api/v1/loans`

- **Body**:
  ```json
  {
    "contactId": "uuid",
    "type": "LENT",
    "principal": 1000,
    "interestRate": 5.0,
    "startDate": "2024-01-01"
  }
  ```
- **Response**: `{ "loan": ... }`
- **Events**: `loan.created`

#### List Loans

**Endpoint**: `GET /api/v1/loans`

- **Query**: `status=ACTIVE`

#### Get Details

**Endpoint**: `GET /api/v1/loans/:id`

- **Response**: `{ "loan": ..., "payments": [...], "schedule": [...] }`

### Payments

#### Record Payment

**Endpoint**: `POST /api/v1/loans/:id/payments`

- **Body**: `{ "amount": 200, "date": "..." }`
- **Response**: `{ "payment": ..., "remainingBalance": 800 }`
- **Events**: `loan.payment.received`

## 6. Inter-Service Communication

**Calls**:

- None.
  **Called By**:
- **API Gateway**
  **Events Published**:
- `loan.created`:
  - `intelligence-service`: Analytics.
- `loan.payment.received`:
  - `ledger-service`: Update Cashflow (if configured).
  **Subscribed Events**:
- `group.settlement.created`:
  - Check if any active loan exists between these users. If "Settled" in group, mark as Paid.

## 7. Third-Party Dependencies

- None.

## 8. Security Considerations

- **Privacy**: Loan data is private.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `active_loans_total`
  - `total_debt_value`

## 11. Error Handling & Edge Cases

- **Payment > Balance**: Return warning or error (Allow for overpayment/tip?).

## 12. Assumptions & Open Questions

- **Assumption**: Simple interest calculation predominantly for MVP.
