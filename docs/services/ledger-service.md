# Ledger Service Documentation

## 1. Service Overview
**Service Name**: `ledger-service`
**Bounded Context**: Financial Records & Accounting
**Responsibility**:
- Recording of all Financial Transactions (Income, Expenses, Transfers).
- Category Management.
- Multi-currency normalization.
- Tax Estimation & Tagging.
- Net Worth & Cashflow Calculation (Historical).

**Non-Responsibilities**:
- Budgeting (Planning Service).
- Recurring Payment Scheduling (Planning Service).
- Bill Splitting logic (Social Finance).

**Justification**:
Consolidates `Expense`, `Income`, and `Tax` services. "Money In" and "Money Out" are two sides of the same coin. Grouping them allows for instant, ACID-compliant calculation of balances and simplifies the domain model to a unified "Transaction" concept.

## 2. Use Cases

### User
- **Log Transaction**: Record a coffee purchase or salary deposit.
- **View History**: Search/Filter transactions by date, category, tags.
- **Tax Report**: View estimated tax liabilities based on income/expense categories.
- **Manage Categories**: Create custom categories (hierarchy).

### System
- **Sync**: Provide data to Intelligence Service for analytics.

## 3. Database Design
**Database**: PostgreSQL
**Schema**: `ledger`

### Core Tables

#### `accounts` (Optional, simplified for this scope as "Wallets")
Represents sources of funds (Bank, Cash, Mobile Money).
```sql
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- cash, bank, mobile_wallet
    currency VARCHAR(3) DEFAULT 'USD',
    balance DECIMAL(15,2) DEFAULT 0, -- Cached current balance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `categories`
Unified hierarchy for both income and expense.
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Global System categories have user_id = NULL
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- income, expense
    parent_id UUID REFERENCES categories(id),
    tax_deductible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `transactions`
The immutable heart of the system.
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    account_id UUID REFERENCES accounts(id),
    category_id UUID REFERENCES categories(id),
    
    amount DECIMAL(19,4) NOT NULL, -- Positive for Income, Negative for Expense
    currency VARCHAR(3) DEFAULT 'USD',
    original_amount DECIMAL(19,4), -- For multi-currency
    original_currency VARCHAR(3),
    exchange_rate DECIMAL(19,6) DEFAULT 1,
    
    date TIMESTAMP NOT NULL,
    description TEXT,
    
    -- Metadata
    merchant_name VARCHAR(100),
    location_lat DECIMAL(9,6),
    location_lng DECIMAL(9,6),
    attachments TEXT[], -- S3 URLs
    tags TEXT[],
    
    is_tax_related BOOLEAN DEFAULT FALSE,
    tax_amount DECIMAL(19,4) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Design
**Protocol**: REST / JSON

### Endpoints

#### Transactions
- `POST /transactions` - Create new record.
- `GET /transactions` - List with huge filter capability (Date range, Category, Account).
- `GET /transactions/:id` - Details.
- `PUT /transactions/:id` - Correction (Double-entry usually prefers Reversal, but CRUD allowed here).
- `DELETE /transactions/:id` - Soft delete.

#### Categories
- `GET /categories` - Tree structure.
- `POST /categories` - Create custom.

#### Summary
- `GET /balances` - Current Net Worth breakdown.
- `GET /tax/estimation` - Year-to-date tax summary.

## 5. Business Logic & Workflows

### Transaction Creation
1. **Validation**: Check if `account_id` belongs to user. Check currency.
2. **Tax Engine**: 
    - If `category` is "Salary", auto-calculate estimated tax (based on simple brackets) and populate `tax_amount`.
    - If `category` is "Business Expense", flag `deductible`.
3. **Persistence**: Save to DB.
4. **Update Balance**: Trigger atomic update of `accounts.balance`.
5. **Event**: Emit `ledger.transaction.created`.

## 6. Inter-Service Communication

### Outbound (Events)
RabbitMQ Exchange: `ledger.events`
- `transaction.created`: 
    - Consumed by **Planning**: To check if "Budget Exceeded".
    - Consumed by **Social**: If tagged as "Group Expense".
    - Consumed by **Intelligence**: For re-training categorization models.

### Inbound
- **Planning Service**: Calls `POST /transactions` when an Automated Recurring Rule executes.

## 7. Authentication & Security
- **Data Isolation**: Strict Row-Level Security (RLS) or application-level check `WHERE user_id = current_user`.
- **Audit**: Immutable logs for deleted transactions.

## 8. Scalability & Performance
- **Partitioning**: `transactions` table partitioned by `date` (Monthly) for fast historical queries.
- **Indexing**: Heavy indexing on types, tags, and date ranges.

## 9. Observability
- **Metrics**: `transaction_volume_per_min`, `tax_calculation_latency`.
- **Dashboards**: "Wealth Velocity" (Rate of money in vs out).

## 10. Testing Strategy
- **Unit**: Tax calculation math, decimal precision handling.
- **Integration**: Ledger balance consistency checks (Sum of transactions == Account Balance).
