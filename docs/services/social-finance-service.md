# Social Finance Service Documentation

## 1. Service Overview
**Service Name**: `social-finance-service`
**Bounded Context**: Shared Finances & Settlements
**Responsibility**:
- Group Management (Trip, Houshold).
- Bill Splitting algorithms (Equal, Percentage, Exact Amount, Shares).
- Settlement Tracking (Who owes whom).
- Activity Feed for Groups.

**Non-Responsibilities**:
- The actual money movement (Ledger Service).
- User Profiles (Identity Service).

**Justification**:
Consolidates `Group Service`. The complexity of maintaining a directed graph of debts (Debts Graph) is mathematically distinct from a simple transactional ledger. Keeping it separate prevents the Ledger from being polluted with "Virtual Debts" that aren't legally binding financial records in the same way a Bank Transaction is.

## 2. Use Cases

### User
- **Create Group**: "Summer Trip 2025".
- **Add Expense**: "I paid $100 for Dinner, split with Bob and Charlie."
- **Settle Up**: "I paid Bob $33 via Cash."
- **View Balances**: "I owe Bob $33, Charlie owes me $10."
- **Simplify Debts**: Optimization algorithm to reduce number of transactions.

## 3. Database Design
**Database**: PostgreSQL
**Schema**: `social`

### Core Tables

#### `groups`
Context for sharing.
```sql
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    created_by UUID NOT NULL,
    type VARCHAR(20) DEFAULT 'trip', -- trip, home, couple, other
    currency VARCHAR(3) DEFAULT 'USD',
    simplify_debts BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `group_members`
Association table.
```sql
CREATE TABLE group_members (
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0, -- Cache of net balance in group
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(group_id, user_id)
);
```

#### `shared_expenses`
The definition of a split credential.
```sql
CREATE TABLE shared_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES groups(id),
    payer_id UUID NOT NULL,
    description VARCHAR(200),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Link to "Real" Ledger Transaction if it exists
    ledger_transaction_id UUID, 
    
    split_type VARCHAR(20) DEFAULT 'equal', -- equal, percentage, shares
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `expense_splits`
The granular breakdown.
```sql
CREATE TABLE expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shared_expense_id UUID REFERENCES shared_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- The borrower
    amount DECIMAL(15,2) NOT NULL, -- How much they owe
    is_settled BOOLEAN DEFAULT FALSE
);
```

## 4. API Design
**Protocol**: REST / JSON

### Endpoints
- `POST /groups` - Create new context.
- `POST /groups/:id/expenses` - Add a shared bill.
    - Payload: `{ payer: "Alice", amount: 100, splits: [{user: "Bob", amount: 50}, {user: "Alice", amount: 50}] }`
- `GET /groups/:id/balances` - Graph of debts.
- `POST /groups/:id/settle` - Record a settlement.

## 5. Business Logic & Workflows

### Adding a Group Expense
1. **Input**: Payer, Amount, Split Details.
2. **Validation**: Ensure all splitters are in the group. Sum(splits) == Amount (approx).
3. **Persist**: Create `shared_expenses` and `expense_splits`.
4. **Graph Update**: Recalculate net balances for all members in the group.
5. **Ledger Sync (Optional)**:
    - If the user wants this tracked in their personal finance:
    - Async call to **Ledger Service** to create an Expense Entry for the Payer (Amount = their share). The "lent" amount is technically not an expense, but a temporary asset.
    - *Decision*: By default, we only log the *Personal Share* as an Expense in Ledger Service.

### Debt Simplification
- Algorithm: Min-Cost Max-Flow or simple greedy approach to reduce edges in the debt graph.
- Runs on every expense addition/settlement if `simplify_debts` is enabled.

## 6. Inter-Service Communication

### Outbound
- **Notification Service**: "You owe Alice $50 for Dinner" (Push/Email).
- **Ledger Service**: `POST /transactions` (Optional "Settle Up" recording).

## 7. Authentication & Security
- **Access Control**: Only group members can view/add expenses to a group.

## 8. Scalability & Performance
- **Caching**: Group Balances are cached. expense history is paginated.
- **Graph Size**: Groups are usually small (<50 people). Algorithms run in-memory fast.

## 9. Observability
- **Metrics**: `expenses_created_total`.

## 10. Testing Strategy
- **Unit**: Split logic (rounding errors are tricky!).
- **Integration**: Scenario: Alice pays 100, Bob pays 50, Charlie pays 0. Settle Up flow.
