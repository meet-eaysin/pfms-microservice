# Ledger Service Documentation

## 1. Service Overview

**Service Name**: `ledger-service`
**Purpose**: The central source of truth for all financial movements. Implements a Double-Entry Bookkeeping system to ensure mathematical accuracy and auditability.
**Responsibility**:

- **Double-Entry Recording**: Every transaction has equal Debits and Credits.
- **Account Management**: Assets (Bank, Wallet), Liabilities (Credit Card), Equity, Revenue (Income), Expenses.
- **Balance Calculation**: Real-time balances for all accounts.
- **Reconciliation**: Ensuring external world (Bank API) matches internal records.
  **Business Value**: Guarantees integrity of financial data ("Where did my money go?") and serves as the backend for all Reporting.
  **Scope**:
- **In Scope**: Journal Entries, Chart of Accounts, Balance Sheets.
- **Out of Scope**: Categorization logic (Expense Service), Budgeting (Planning Service).

## 2. Functional Description

**Core Features**:

- **Chart of Accounts**: Tree structure of accounts.
- **Transaction Posting**: Atomic commit of Debit/Credit pairs.
- **Event Consumption**: Automatically creating entries from `expense`, `income`, `investment` events.
- **Multi-Currency Support**: Native support for transactions in different currencies.
  **Internal Responsibilities**:
- Locking accounts during updates to prevent race conditions.
  **Non-functional Expectations**:
- **Consistency**: ACID compliance is non-negotiable.
- **Auditability**: Immutable history of all changes.

## 3. Database Design

**Database Type**: PostgreSQL (Primary) + Redis (Balance Cache)

### Schema (Key Tables)

#### `accounts`

| Column       | Type    | Description                                             |
| :----------- | :------ | :------------------------------------------------------ |
| `id`         | UUID    | PK                                                      |
| `user_id`    | UUID    | FK                                                      |
| `name`       | VARCHAR | "Chase Checking", "Visa Card"                           |
| `type`       | ENUM    | ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE              |
| `subtype`    | VARCHAR | "CASH", "CREDIT_CARD", etc.                             |
| `currency`   | CHAR(3) |                                                         |
| `balance`    | DECIMAL | Denormalized current balance (Maintained via triggers)  |
| `is_mutable` | BOOLEAN | False for System Accounts (e.g. "Uncategorized Equity") |

#### `journal_entries`

| Column        | Type      | Description                         |
| :------------ | :-------- | :---------------------------------- |
| `id`          | UUID      | PK                                  |
| `user_id`     | UUID      | FK                                  |
| `date`        | TIMESTAMP |                                     |
| `description` | TEXT      |                                     |
| `reference`   | VARCHAR   | Link to external ID (e.g. ExpenseID) |
| `source`      | ENUM      | MANUAL, EXPENSE_SERVICE, etc.       |

#### `posting_lines`

| Column      | Type    | Description                |
| :---------- | :------ | :------------------------- |
| `id`        | UUID    | PK                         |
| `entry_id`  | UUID    | FK                         |
| `account_id`| UUID    | FK                         |
| `amount`    | DECIMAL | Positive debit, Negative credit, or separate columns |
| `direction` | ENUM    | DEBIT, CREDIT              |

**Data Lifecycle**: Permanent.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to manually adjust my bank balance."
- "As a user, I want to see my total Liquid Assets."
  **System-Driven**:
- "Expense Service created a $50 expense -> Credit 'Cash', Debit 'Expense Category'."
- "Income Service recorded $5000 salary -> Debit 'Bank', Credit 'Salary Income'."
  **Edge Cases**:
- Currency Exchange (Transfer from USD Account to EUR Account).
- Reverting a transaction (Must create a counter-entry, never delete).

## 5. API Design (Port 3014)

### Accounts

#### List Accounts

**Endpoint**: `GET /api/v1/ledger/accounts`

- **Query**: `type=ASSET`
- **Response**: `{ "accounts": [...] }`

#### Create Account

**Endpoint**: `POST /api/v1/ledger/accounts`

- **Body**: `{ "name": "Cash Wallet", "type": "ASSET", "currency": "USD" }`

### Transactions

#### Post Journal Entry

**Endpoint**: `POST /api/v1/ledger/entries`

- **Body**:
  ```json
  {
    "date": "2024-01-01",
    "description": "Found $20",
    "lines": [
      { "accountId": "cash_uuid", "amount": 20, "direction": "DEBIT" },
      { "accountId": "equity_uuid", "amount": 20, "direction": "CREDIT" }
    ]
  }
  ```
- **Validation**: Sum of Debits must equal Sum of Credits.

#### Get Balance Sheet

**Endpoint**: `GET /api/v1/ledger/reports/balance-sheet`

## 6. Inter-Service Communication

**Calls**:

- None (Passive service).
  **Called By**:
- **API Gateway**: Account management.
- `report-service`: Fetching financial statements.
  **Subscribed Events**:
- `expense.created`: Credit Payment Account / Debit Expense Account.
- `income.received`: Debit Deposit Account / Credit Income Account.
- `loan.created`: Debit Cash / Credit Loan Liability.
- `investment.transaction.created` (Buy): Credit Cash / Debit Investment Asset.
- `payment.made`: Credit Cash / Debit Liability.

## 7. Third-Party Dependencies

- None.

## 8. Security Considerations

- **Integrity**: Checksums for ledger chains (optional for high security).
- **Access**: Strict isolation.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `ledger_imbalanced_entries_total` (Should be 0).
  - `ledger_account_balance` (Gauge).

## 11. Error Handling & Edge Cases

- **Imbalance**: Reject transaction immediately. 400 Bad Request.

## 12. Assumptions & Open Questions

- **Assumption**: Events from other services contain enough info (e.g. `paymentAccountId`) to create the ledger entry.
