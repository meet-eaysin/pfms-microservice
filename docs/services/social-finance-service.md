# Social Finance Service Documentation

## 1. Service Overview

**Service Name**: `social-finance-service`
**Purpose**: Manages shared expenses, bill splitting, and group financial activities.
**Responsibility**:

- Group Creation (Events, Trips, Households)
- Bill Splitting Algorithms (Equal, Percentage, Exact)
- Debt Simplification
- Activity Feed
  **Business Value**: Solves the "Who owes whom" problem for couples, roommates, and friends.
  **Scope**:
- **In Scope**: Groups, Members, Expenses, Settlements.
- **Out of Scope**: Real money transfer (Integrations like Venmo not in MVP).

## 2. Functional Description

**Core Features**:

- "Splitwise-style" expense splitting.
- Graph simplification to minimize number of transfers.
- Multi-currency groups.
  **Internal Responsibilities**:
- Maintaining the "Debts Graph".
  **Non-functional Expectations**:
- **Consistency**: Strong. Total Owed must equal Total Owed.

## 3. Database Design

**Database Type**: PostgreSQL

### Schema (Key Tables)

#### `groups`

| Column     | Type    | Description     |
| :--------- | :------ | :-------------- |
| `id`       | UUID    | PK              |
| `name`     | VARCHAR | "Trip to Paris" |
| `currency` | CHAR(3) |                 |

#### `group_members`

| Column     | Type | Description |
| :--------- | :--- | :---------- |
| `group_id` | UUID | PK, FK      |
| `user_id`  | UUID | PK, FK      |

#### `expenses` (Shared)

| Column        | Type    | Description |
| :------------ | :------ | :---------- |
| `id`          | UUID    | PK          |
| `group_id`    | UUID    | FK          |
| `paid_by`     | UUID    | FK          |
| `amount`      | DECIMAL | Total       |
| `description` | TEXT    |             |

#### `expense_splits`

| Column       | Type    | Description |
| :----------- | :------ | :---------- |
| `expense_id` | UUID    | FK          |
| `user_id`    | UUID    | FK          |
| `owed_share` | DECIMAL |             |

**Data Lifecycle**: Indefinite.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I paid $100 for dinner for the group."
- "As a user, I want to settle up with Alice."
  **System-Driven**:
- "Simplify debts: A owes B $10, B owes C $10 -> A owes C $10."
  **Edge Cases**:
- Member leaves group with outstanding debt.
- Split decimals (`$10 / 3` people).

## 5. API Design (Port 3007)

### Groups

#### Create Group

**Endpoint**: `POST /api/v1/groups`

- **Body**: `{ "name": "Roommates", "currency": "USD" }`
- **Response**: `{ "group": ... }`

#### Get Group

**Endpoint**: `GET /api/v1/groups/:id`

- **Response**: `{ "group": ..., "members": [...], "balances": [...] }`

#### Add Member

**Endpoint**: `POST /api/v1/groups/:id/members`

- **Body**: `{ "email": "..." }`

### Expenses

#### Add Expense

**Endpoint**: `POST /api/v1/groups/:id/expenses`

- **Body**:
  ```json
  {
    "amount": 60.0,
    "description": "Pizza",
    "paidBy": "user_id_A",
    "splitType": "EQUAL",
    "involvedUsers": ["user_id_A", "user_id_B", "user_id_C"]
  }
  ```
- **Response**: `{ "expense": ... }`
- **Events**: `group.expense.created`

#### Settle Up (Record Payment)

**Endpoint**: `POST /api/v1/groups/:id/settle`

- **Body**:
  ```json
  {
    "payerId": "user_id_B",
    "payeeId": "user_id_A",
    "amount": 20.0
  }
  ```

### Balances

#### Get Simplified Balances

**Endpoint**: `GET /api/v1/groups/:id/balances`

- **Response**:
  ```json
  {
    "debts": [{ "from": "user_id_B", "to": "user_id_A", "amount": 20.0 }]
  }
  ```

## 6. Inter-Service Communication

**Calls**:

- `user-service`: To fetch names/avatars of group members.
- `notification-service`: To create email invites.
  **Called By**:
- **API Gateway**
  **Events Published**:
- `group.expense.created`:
  - `notification-service`: Push notification "You were added to an expense".
  - `expense-service`: Create personal expense record for each member's share (Net Cost).
- `group.settlement.created`:
  - `ledger-service`: Debit Payer (Cash) / Credit Payee (Cash) - *If Integrated*.
  - `lending-service`: Close any open P2P loans if they match.

## 7. Third-Party Dependencies

- None.

## 8. Security Considerations

- **Access Control**: Only members can see group data.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `group_expenses_total`
- **Logs**: Activity logs.

## 11. Error Handling & Edge Cases

- **Rounding**: Handle penny rounding errors by assigning remainder to payer or random member.

## 12. Assumptions & Open Questions

- **Assumption**: Users in a group must have a Registered account (or we use "Shadow users" until they sign up).
