# Planning Service Documentation

## 1. Service Overview
**Service Name**: `planning-service`
**Bounded Context**: Financial Strategy & Automation
**Responsibility**:
- Budget Creation & Tracking (Planned vs Actual).
- Savings Goals Management (Virtual Buckets).
- Recurring Transaction Scheduling (Subscriptions, Salary).
- Automated Rule Execution (If This Then That for money).

**Non-Responsibilities**:
- Storing Historical Transactions (Ledger Service).
- Managing Notification delivery (Notification Service).

**Justification**:
Consolidates `Savings/Goals` and `Automation` services. Planning is distinct from Recording. While Ledger connects to the past, Planning connects to the future. Grouping "Goals" (Static target) with "Automation" (Dynamic execution) allows for powerful "Auto-Save" workflows.

## 2. Use Cases

### User
- **Budgeting**: "Warn me if I spend >$500 on Dining."
- **Goals**: "Save $10,000 for a car by Dec 2026."
- **Automation**: "Automatically move $50 to 'Car Goal' every Monday."
- **Subscription Management**: Track Netflix/Spotify billing cycles.

### System
- **Budget Monitor**: Listens to new Ledger transactions to update Budget status.
- **Scheduler**: Cron jobs that trigger recurring entries in the Ledger.

## 3. Database Design
**Database**: PostgreSQL
**Schema**: `planning`

### Core Tables

#### `budgets`
Time-bound spending limits.
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    category_id UUID, -- NULL for Global Budget
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    period VARCHAR(20) DEFAULT 'monthly', -- weekly, monthly, yearly
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_strict BOOLEAN DEFAULT FALSE, -- If true, blocks transaction? (Advanced)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `goals`
Virtual savings buckets.
```sql
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    deadline DATE,
    icon VARCHAR(50),
    status VARCHAR(20) DEFAULT 'in_progress', -- achieved, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `recurring_rules`
Templates for future transactions.
```sql
CREATE TABLE recurring_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100), -- "Netflix", "Rent"
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3),
    category_id UUID,
    
    cron_expression VARCHAR(50) NOT NULL, -- e.g., "0 0 1 * *" (Monthly 1st)
    next_run_at TIMESTAMP NOT NULL,
    
    type VARCHAR(20) DEFAULT 'expense', -- income, expense, transfer (to goal)
    destination_goal_id UUID, -- If type is transfer
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Design
**Protocol**: REST / JSON

### Endpoints
- `GET /budgets` - Status of all active budgets (Computed with data from Ledger).
- `POST /budgets` - Create limit.
- `GET /goals` - List goals.
- `POST /goals/:id/deposit` - Manual transfer to goal (Updates Ledger).
- `GET /subscriptions` - List active recurring rules.

## 5. Business Logic & Workflows

### Budget Monitoring (Event Driven)
1. **Trigger**: Consume `ledger.transaction.created` event.
2. **Process**: 
   - Find active budgets for `user_id` matching `category_id`.
   - Call Ledger API (or use local cache) to get Sum(transactions) for period.
   - Calculate `% Utilized`.
3. **Action**: If > 80%, emit `planning.budget.warning`. If > 100%, emit `planning.budget.exceeded`.

### Recurring Execution (Scheduled)
1. **Trigger**: System Clock (Cron).
2. **Process**: Select `recurring_rules` where `next_run_at` <= Now are active.
3. **Action**:
   - Call **Ledger Service** `POST /transactions` to log the record.
   - Update `next_run_at`.
   - If failed (API Error), retry later.

## 6. Inter-Service Communication

### Inbound (Events)
RabbitMQ Exchange: `ledger.events`
- `transaction.created`: Triggers Budget update.

### Outbound
- **Ledger Service**: REST call to create transactions.
- **Notification Service**: Via Events (`budget.exceeded`) to warn user.

## 7. Authentication & Security
- **Ownership**: Users can only manage their own plans.

## 8. Scalability & Performance
- **Aggregations**: "Budget Status" requires summing Ledger rows.
    - *Optimization*: Planning Service maintains a localized "Spend Counter" in Redis, incremented by events, synced nightly. Avoids heavy SQL on Ledger for every view.

## 9. Observability
- **Metrics**: `recurring_job_lag` (Delay between scheduled time and execution).

## 10. Testing Strategy
- **Unit**: Cron expression parsing.
- **Integration**: "Simulate Time" tests to verify recurring rules trigger correct calls to Ledger mock.
