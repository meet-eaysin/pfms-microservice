# Lending Service Documentation

## 1. Service Overview
**Service Name**: `lending-service`
**Bounded Context**: Liability & Debt Management
**Responsibility**:
- Loan Lifecycle (Origination, Active, Paid, Defaulted).
- Repayment Scheduling (EMI calculation).
- Contact Management (People I owe / people who owe me).
- Interest Calculation (Simple/Compound).

**Non-Responsibilities**:
- Moving Money (Ledger Service).
- Legal Arbitrations.

**Justification**:
Consolidates `Loan Service`. Loans are complex state machines. Unlike a simple "Expense", a Loan changes value over time (interest), has future obligations (schedule), and involves a counter-party (Contact). This distinct lifecycle warrants a dedicated service.

## 2. Use Cases

### User
- **Record Loan**: "I lent $5000 to John at 5% interest."
- **Generate Schedule**: "Calculate monthly payments for 1 year."
- **Record Repayment**: "John paid back $200 today."
- **Track Status**: "See how much is remaining on my Car Loan."

### System
- **EMI Reminder**: Check schedule and trigger Notification.
- **Interest Accrual**: Daily job to update "Current Balance" for compound interest loans.

## 3. Database Design
**Database**: PostgreSQL
**Schema**: `lending`

### Core Tables

#### `contacts`
External entities involved in loans.
```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    relation VARCHAR(50), -- Friend, Bank, Family
    trust_score INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `loans`
The contract.
```sql
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    name VARCHAR(200) NOT NULL, -- "Car Loan", "Lent to Bob"
    type VARCHAR(20) NOT NULL, -- LENT (Asset), BORROWED (Liability)
    
    principal_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    interest_rate DECIMAL(5,2) DEFAULT 0,
    interest_type VARCHAR(20) DEFAULT 'fixed', -- fixed, simple, compound
    
    start_date DATE NOT NULL,
    end_date DATE,
    
    status VARCHAR(20) DEFAULT 'active', -- active, paid, defaulted
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `repayment_schedules`
Expected future cashflows.
```sql
CREATE TABLE repayment_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount_due DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, partial
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Design
**Protocol**: REST / JSON

### Endpoints
- `POST /contacts` - Create counter-party.
- `POST /loans` - Create new loan.
    - Payload: `{ principal, rate, duration, type, contactId }`
- `GET /loans/:id/schedule` - View EMI table.
- `POST /loans/:id/payments` - Record a payment.
    - Side Effect: Updates `repayment_schedules` status and `loan` remaining balance.

## 5. Business Logic & Workflows

### Loan Origination
1. **Input**: Amount, Rate, Tenure.
2. **Calculation**: If EMI, use formula `P * r * (1+r)^n / ((1+r)^n - 1)`.
3. **Persist**: Save `loan` and generate N rows in `repayment_schedules`.
4. **Ledger Sync**:
    - If "BORROWED": Register INCOME in Ledger (Money received).
    - If "LENT": Register EXPENSE in Ledger (Money left).

### Repayment Recording
1. **Input**: Amount, Date.
2. **Logic**: Apply payment to the oldest "Pending" schedule item (Waterfall method).
3. **Update**: Mark schedule items as "Paid" or "Partial".
4. **Ledger Sync**:
    - If "BORROWED": Register EXPENSE in Ledger (Repayment).
    - If "LENT": Register INCOME in Ledger (Repayment received).

## 6. Inter-Service Communication

### Outbound
- **Ledger Service**: To record the actual cash movement.
- **Notification Service**: "Payment Due Tomorrow".

## 7. Scalability & Performance
- **Data Volume**: Low. Loans are infrequent compared to daily expenses.
- **Consistency**: High. Must not lose track of debt.

## 8. Testing Strategy
- **Unit**: Interest Math.
- **Integration**: Create Loan -> Generate Schedule -> Pay 1st Installment -> Verify Remaining Balance.
