# **Personal Financial Management System (PFMS)**

## **Complete System Design Document**

---

## **1. SYSTEM ARCHITECTURE OVERVIEW**

### **1.1 Microservices Architecture**

text

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Kong)                       │
│           Port: 3000 | Auth, Routing, Rate Limiting         │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────────────────────────────────────┐
        ↓                                                     ↓
┌─────────────────────────────────────────────────────────────────┐
│                 RabbitMQ (Event Bus)                          │
│              Service-to-Service Communication                  │
└─────────────────────────────────────────────────────────────────┘
        ↓                                                     ↓
┌───────────────┐  ┌───────────────┐  ┌──────────────────┐  ┌───────────────┐
│  Auth Service () │  │ User Service  │  │ Expense Service  │  │ Income Service│
│   Port: 3001  │  │  Port: 3002   │  │   Port: 3003    │  │   Port: 3004  │
└───────────────┘  └───────────────┘  └──────────────────┘  └───────────────┘

┌───────────────┐  ┌───────────────┐  ┌──────────────────┐  ┌───────────────┐
│ Investment    │  │  Loan Service │  │  Group Service   │  │  Tax Service  │
│  Port: 3005   │  │  Port: 3006   │  │   Port: 3007    │  │   Port: 3008  │
└───────────────┘  └───────────────┘  └──────────────────┘  └───────────────┘

┌───────────────┐  ┌───────────────┐  ┌──────────────────┐  ┌───────────────┐
│ AI/Analytics  │  │ Notification  │  │  Automation      │  │  Report       │
│  Port: 3009   │  │  Port: 3010   │  │   Port: 3011    │  │   Port: 3012  │
└───────────────┘  └───────────────┘  └──────────────────┘  └───────────────┘

┌───────────────┐  ┌───────────────┐
│ Market Data   │  │ Savings/Goals │
│  Port: 3013   │  │  Port: 3014   │
└───────────────┘  └───────────────┘
```

### **1.2 Database Strategy**

| **Service**  | **Primary DB** | **Cache** | **Purpose**                  |
| ------------ | -------------- | --------- | ---------------------------- |
| Auth         | PostgreSQL     | Redis     | User auth, sessions, tokens  |
| User         | PostgreSQL     | Redis     | Profiles, preferences        |
| Expense      | PostgreSQL     | Redis     | Expenses, habits, categories |
| Income       | PostgreSQL     | Redis     | Income sources, cashflow     |
| Investment   | PostgreSQL     | Redis     | Portfolios, transactions     |
| Loan         | PostgreSQL     | Redis     | Loans, contacts, payments    |
| Group        | PostgreSQL     | Redis     | Groups, splits, settlements  |
| Tax          | PostgreSQL     | -         | Tax calculations, deductions |
| AI/Analytics | MongoDB        | Redis     | ML models, chat history      |
| Notification | PostgreSQL     | Redis     | Notifications, templates     |
| Automation   | PostgreSQL     | Redis     | Rules, schedules             |
| Report       | PostgreSQL     | S3/MinIO  | Reports, exports             |

### **1.3 Core Technology Stack**

```coffeescript
Turborepo:
  - package: utils, types, events (rabbitmq), eslint-config, typescript-config
  - infra:
  - apps: my services

Backend Framework:
  - NestJS: Auth, User, Loan, Tax, Notification, Automation
  - Express.js: Expense, Income, Investment, Group, AI, Report, Market

Databases:
  - PostgreSQL 16: Primary relational data
  - MongoDB 7: AI/Analytics unstructured data
  - Redis 7: Caching, sessions, real-time data

Message Queue:
  - RabbitMQ: Event-driven communication

API Gateway:
  - kong api gateway

Authentication:
  - better-auth

File Storage:
  - S3/MinIO: Reports, attachments

Monitoring:
  - Prometheus + Grafana
  - ELK Stack for logs

DevOps:
  - Docker & Docker Compose
  - GitHub Actions CI/CD
```

---

## **2. CORE MICROSERVICES DESIGN**

### **2.1 Auth Service (Port 3001)**

**Responsibilities**: Authentication, Authorization, Sessions, MFA with better-auth package

**Key Endpoints**:

**Core Database Tables**:

```sql

-- Users table (basic auth info only)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OAuth providers
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- google, facebook, apple
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- MFA
CREATE TABLE mfa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- totp, sms
    secret VARCHAR(255),
    is_enabled BOOLEAN DEFAULT FALSE,
    backup_codes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
```

### **2.2 User Service (Port 3002)**

**Responsibilities**: User profiles, preferences, family management

**Key Endpoints**:

```coffeescript
GET    /api/v1/user/profile                # Get profile
PUT    /api/v1/user/profile                # Update profile
GET    /api/v1/user/preferences/financial  # Get financial prefs
PUT    /api/v1/user/preferences/financial  # Update financial prefs
GET    /api/v1/user/family                 # List family members
POST   /api/v1/user/family/invite          # Invite family member
```

**Core Database Tables**:

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL, -- References auth service
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Financial preferences
CREATE TABLE financial_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    daily_budget_limit DECIMAL(15,2),
    monthly_budget_limit DECIMAL(15,2),
    savings_target DECIMAL(15,2),
    investment_risk_level VARCHAR(20), -- low, medium, high
    salary_day INTEGER, -- 1-31
    earning_schedule VARCHAR(20), -- monthly, weekly, biweekly
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Privacy settings
CREATE TABLE privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    profile_visibility VARCHAR(20) DEFAULT 'private',
    show_net_worth BOOLEAN DEFAULT FALSE,
    allow_analytics BOOLEAN DEFAULT TRUE,
    data_sharing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL, -- push, email, sms
    category VARCHAR(50) NOT NULL, -- expense, investment, loan, etc.
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, channel, category)
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

```

### **2.3 Expense Service (Port 3003)**

**Responsibilities**: Expenses, habits, recurring costs, categories

**Key Endpoints**:

```coffeescript
POST   /api/v1/expenses                   # Create expense
GET    /api/v1/expenses                   # List expenses
POST   /api/v1/expenses/bulk-import       # Bulk import
POST   /api/v1/expenses/recurring         # Create recurring expense
POST   /api/v1/habits                     # Create habit
POST   /api/v1/habits/:id/log             # Log habit
```

**Core Database Tables**:

```sql
CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7),
    parent_category_id UUID REFERENCES expense_categories(id),
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Expenses
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    category_id UUID REFERENCES expense_categories(id),
    description TEXT,
    date DATE NOT NULL,
    time TIME,
    location JSONB, -- {lat, lng, address}
    payment_method VARCHAR(50),
    tags TEXT[],
    attachments TEXT[], -- URLs
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_id UUID, -- Links to recurring_expenses
    source VARCHAR(20) DEFAULT 'manual', -- manual, voice, import, auto
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Habit tracking
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50), -- cigarettes, coffee, etc.
    unit_cost DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    icon VARCHAR(50),
    target_reduction INTEGER, -- percentage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

CREATE TABLE habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    total_cost DECIMAL(10,2),
    date DATE NOT NULL,
    time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recurring expenses
CREATE TABLE recurring_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    category_id UUID REFERENCES expense_categories(id),
    frequency VARCHAR(20) NOT NULL, -- daily, weekly, monthly, yearly
    start_date DATE NOT NULL,
    end_date DATE,
    next_due_date DATE,
    last_paid_date DATE,
    auto_pay BOOLEAN DEFAULT FALSE,
    reminder_days INTEGER DEFAULT 3,
    inflation_rate DECIMAL(5,2) DEFAULT 0,
    metadata JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bulk import tracking
CREATE TABLE import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    filename VARCHAR(255),
    total_rows INTEGER,
    successful_rows INTEGER,
    failed_rows INTEGER,
    error_log JSONB,
    status VARCHAR(20), -- pending, processing, completed, failed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_recurring_expenses_next_due ON recurring_expenses(next_due_date);
CREATE INDEX idx_habit_logs_date ON habit_logs(user_id, date DESC);

```

### **2.4 Income Service (Port 3004)**

**Responsibilities**: Income tracking, cashflow projection

**Key Endpoints**:

```coffeescript
POST   /api/v1/income/sources            # Create income source
GET    /api/v1/income/transactions       # List income
GET    /api/v1/income/cashflow/projection # Cashflow projection
```

**Core Database Tables**:

```coffeescript
CREATE TABLE income_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL, -- salary, freelance, business, bonus, investment
    amount DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    frequency VARCHAR(20), -- one-time, monthly, weekly, yearly
    is_recurring BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Income transactions
CREATE TABLE income_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    income_source_id UUID REFERENCES income_sources(id),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    date DATE NOT NULL,
    description TEXT,
    category VARCHAR(50),
    payment_method VARCHAR(50),
    tax_deducted DECIMAL(15,2) DEFAULT 0,
    net_amount DECIMAL(15,2),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Future cashflow projections (cached)
CREATE TABLE cashflow_projections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    projection_date DATE NOT NULL,
    projected_balance DECIMAL(15,2),
    confidence_score DECIMAL(3,2), -- 0-1
    expected_income DECIMAL(15,2),
    expected_expenses DECIMAL(15,2),
    notes TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, projection_date)
);

CREATE INDEX idx_income_trans_user_date ON income_transactions(user_id, date DESC);
CREATE INDEX idx_cashflow_user_date ON cashflow_projections(user_id, projection_date);

```

### **2.5 Investment Service (Port 3005)**

**Responsibilities**: Portfolios, assets, transactions, analytics

**Key Endpoints**:

```coffeescript
POST   /api/v1/portfolios                # Create portfolio
POST   /api/v1/portfolios/:id/assets     # Add asset
POST   /api/v1/portfolios/:id/transactions # Add transaction
GET    /api/v1/portfolios/:id/analytics  # Portfolio analytics
```

**Core Database Tables**:

```sql
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    total_invested DECIMAL(15,2) DEFAULT 0,
    current_value DECIMAL(15,2) DEFAULT 0,
    total_return DECIMAL(15,2) DEFAULT 0,
    return_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Assets
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- stock, crypto, mutual_fund, etf, bond, custom
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(200),
    quantity DECIMAL(20,8) NOT NULL,
    average_buy_price DECIMAL(15,2),
    current_price DECIMAL(15,2),
    total_invested DECIMAL(15,2),
    current_value DECIMAL(15,2),
    unrealized_pl DECIMAL(15,2),
    unrealized_pl_percentage DECIMAL(5,2),
    sector VARCHAR(100),
    currency VARCHAR(3) DEFAULT 'USD',
    last_price_update TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE investment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- buy, sell, dividend
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    fees DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    date DATE NOT NULL,
    time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history cache
CREATE TABLE asset_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    timestamp TIMESTAMP NOT NULL,
    source VARCHAR(50),
    UNIQUE(symbol, asset_type, timestamp)
);

-- Portfolio snapshots (for historical tracking)
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_value DECIMAL(15,2),
    total_return DECIMAL(15,2),
    return_percentage DECIMAL(5,2),
    asset_allocation JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_id, snapshot_date)
);

CREATE INDEX idx_assets_user ON assets(user_id);
CREATE INDEX idx_inv_trans_user_date ON investment_transactions(user_id, date DESC);
CREATE INDEX idx_asset_prices_symbol ON asset_prices(symbol, timestamp DESC);

```

### **2.6 Loan Service (Port 3006)**

**Responsibilities**: Loans, contacts, EMI management, payments

**Key Endpoints**:

```coffeescript
POST   /api/v1/contacts                  # Create contact
POST   /api/v1/loans                     # Create loan
POST   /api/v1/loans/:id/payments        # Record payment
GET    /api/v1/loans/:id/schedule        # Get EMI schedule
```

**Core Database Tables**:

```sql
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Owner of this contact
    contact_type VARCHAR(20) NOT NULL, -- 'app_user', 'external'

    -- For app users
    linked_user_id UUID, -- References user from User Service

    -- For external contacts
    name VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,

    -- Common fields
    nickname VARCHAR(100), -- Custom name given by user
    relationship VARCHAR(50), -- friend, family, colleague, business
    notes TEXT,
    avatar_url TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,

    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_contact_type CHECK (
        (contact_type = 'app_user' AND linked_user_id IS NOT NULL) OR
        (contact_type = 'external' AND name IS NOT NULL)
    ),
    UNIQUE(user_id, linked_user_id),
    UNIQUE(user_id, phone)
);

-- Contact groups (optional)
CREATE TABLE contact_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

CREATE TABLE contact_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES contact_groups(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, contact_id)
);

-- ============================================
-- LOANS (Enhanced with contact reference)
-- ============================================

CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE RESTRICT,

    type VARCHAR(20) NOT NULL, -- 'borrowed', 'lent'

    -- Loan details
    principal_amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BDT',
    interest_rate DECIMAL(5,2) DEFAULT 0,
    interest_type VARCHAR(20) DEFAULT 'none', -- 'simple', 'compound', 'none'
    interest_calculation VARCHAR(20) DEFAULT 'annual',

    -- Dates
    start_date DATE NOT NULL,
    end_date DATE,
    actual_end_date DATE,

    -- EMI configuration
    emi_enabled BOOLEAN DEFAULT FALSE,
    emi_frequency VARCHAR(20),
    emi_amount DECIMAL(15,2),
    emi_day INTEGER,
    total_installments INTEGER,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paid', 'overdue', 'cancelled', 'defaulted'
    remaining_balance DECIMAL(15,2),
    total_paid DECIMAL(15,2) DEFAULT 0,
    total_interest_paid DECIMAL(15,2) DEFAULT 0,

    -- Additional info
    reason TEXT,
    category VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'medium',
    attachments JSONB,

    -- Agreement
    has_written_agreement BOOLEAN DEFAULT FALSE,
    agreement_url TEXT,
    witness_info JSONB,

    -- Reminders & penalties
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_days_before INTEGER DEFAULT 3,
    auto_deduct BOOLEAN DEFAULT FALSE,
    late_fee_enabled BOOLEAN DEFAULT FALSE,
    late_fee_amount DECIMAL(10,2),
    late_fee_type VARCHAR(20),
    grace_period_days INTEGER DEFAULT 0,

    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_loan_amounts CHECK (principal_amount > 0),
    CONSTRAINT check_interest_rate CHECK (interest_rate >= 0 AND interest_rate <= 100)
);

-- EMI schedule (Enhanced)
CREATE TABLE emi_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    due_date DATE NOT NULL,

    -- Amount breakdown
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) DEFAULT 0,
    late_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,

    -- Payment tracking
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'partial', 'overdue', 'skipped', 'waived'
    paid_date DATE,
    paid_amount DECIMAL(15,2) DEFAULT 0,
    outstanding_amount DECIMAL(15,2),
    partial_payments_count INTEGER DEFAULT 0,

    -- Overdue tracking
    days_overdue INTEGER DEFAULT 0,
    overdue_since DATE,

    -- Reminder tracking
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP,

    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(loan_id, installment_number)
);

-- Loan payments (Enhanced)
CREATE TABLE loan_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    emi_schedule_id UUID REFERENCES emi_schedules(id),
    user_id UUID NOT NULL,

    -- Payment details
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BDT',
    payment_date DATE NOT NULL,
    payment_time TIME DEFAULT CURRENT_TIME,

    -- Payment breakdown
    principal_paid DECIMAL(15,2) DEFAULT 0,
    interest_paid DECIMAL(15,2) DEFAULT 0,
    late_fee_paid DECIMAL(10,2) DEFAULT 0,

    -- Payment method
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    payment_type VARCHAR(20) DEFAULT 'regular',

    status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    receipt_url TEXT,

    -- Verification
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID,
    verified_at TIMESTAMP,

    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_payment_amount CHECK (amount > 0)
);

-- Payment reminders
CREATE TABLE payment_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    emi_schedule_id UUID REFERENCES emi_schedules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,

    reminder_type VARCHAR(20) NOT NULL,
    reminder_date DATE NOT NULL,
    due_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,

    notification_sent BOOLEAN DEFAULT FALSE,
    notification_sent_at TIMESTAMP,
    notification_channels VARCHAR(20)[],

    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP,
    is_snoozed BOOLEAN DEFAULT FALSE,
    snooze_until DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan activities log
CREATE TABLE loan_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT NOT NULL,

    payment_id UUID REFERENCES loan_payments(id) ON DELETE SET NULL,
    emi_schedule_id UUID REFERENCES emi_schedules(id) ON DELETE SET NULL,

    old_value JSONB,
    new_value JSONB,
    metadata JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Loan templates
CREATE TABLE loan_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    template_name VARCHAR(200) NOT NULL,
    description TEXT,

    type VARCHAR(20) NOT NULL,
    default_amount DECIMAL(15,2),
    interest_rate DECIMAL(5,2),
    interest_type VARCHAR(20),
    emi_frequency VARCHAR(20),
    category VARCHAR(50),

    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, template_name)
);

-- Loan disputes
CREATE TABLE loan_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID REFERENCES loans(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL,

    dispute_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    expected_resolution TEXT,

    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',

    resolution TEXT,
    resolved_by UUID,
    resolved_at TIMESTAMP,
    attachments JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES
-- ============================================

-- Contacts
CREATE INDEX idx_contacts_user ON contacts(user_id);
CREATE INDEX idx_contacts_linked_user ON contacts(linked_user_id) WHERE linked_user_id IS NOT NULL;
CREATE INDEX idx_contacts_phone ON contacts(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_contacts_type ON contacts(contact_type);

-- Loans
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_contact ON loans(contact_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_type ON loans(type);
CREATE INDEX idx_loans_overdue ON loans(status, end_date) WHERE status = 'active';

-- EMI
CREATE INDEX idx_emi_loan ON emi_schedules(loan_id);
CREATE INDEX idx_emi_due_date ON emi_schedules(due_date);
CREATE INDEX idx_emi_status ON emi_schedules(status);
CREATE INDEX idx_emi_overdue ON emi_schedules(status, due_date) WHERE status IN ('pending', 'partial', 'overdue');

-- Payments
CREATE INDEX idx_payments_loan ON loan_payments(loan_id);
CREATE INDEX idx_payments_emi ON loan_payments(emi_schedule_id) WHERE emi_schedule_id IS NOT NULL;
CREATE INDEX idx_payments_user_date ON loan_payments(user_id, payment_date DESC);

-- Reminders
CREATE INDEX idx_reminders_user ON payment_reminders(user_id);
CREATE INDEX idx_reminders_pending ON payment_reminders(notification_sent, reminder_date) WHERE notification_sent = FALSE;

-- Activities
CREATE INDEX idx_activities_loan ON loan_activities(loan_id, created_at DESC);

```

### **2.7 Group Finance Service (Port 3007)**

**Responsibilities**: Group management, expense splitting, settlements

Tech: Express Js

**Key Endpoints**:

```coffeescript
POST   /api/v1/groups                    # Create group
POST   /api/v1/groups/:id/expenses       # Add group expense
POST   /api/v1/groups/:id/settle         # Create settlement
GET    /api/v1/groups/:id/balances       # Get balances
```

**Core Database Tables**:

```sql
CREATE TABLE finance_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    group_type VARCHAR(50), -- trip, party, office, event, general
    created_by UUID NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB, -- {chat_enabled, auto_settle, etc}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group members
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES finance_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) DEFAULT 'member', -- admin, member, viewer
    display_name VARCHAR(100),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(group_id, user_id)
);

-- Group expenses
CREATE TABLE group_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES finance_groups(id) ON DELETE CASCADE,
    paid_by UUID NOT NULL, -- user_id
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT NOT NULL,
    category VARCHAR(100),
    date DATE NOT NULL,
    split_type VARCHAR(20) NOT NULL, -- equal, unequal, percentage, weight, custom
    attachments TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expense splits
CREATE TABLE expense_splits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_expense_id UUID REFERENCES group_expenses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    share_amount DECIMAL(15,2) NOT NULL,
    share_percentage DECIMAL(5,2),
    weight DECIMAL(5,2),
    is_paid BOOLEAN DEFAULT FALSE,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settlements
CREATE TABLE settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES finance_groups(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled
    settlement_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group chat (optional)
CREATE TABLE group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID REFERENCES finance_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, expense
    content TEXT,
    attachments TEXT[],
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_group_expenses_group ON group_expenses(group_id, date DESC);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_settlements_group ON settlements(group_id);

```

### **2.8 Tax Service (Port 3008)**

**Responsibilities**: Tax calculation, deductions, tax reports

Tech: Express Js

**Key Endpoints**:

```coffeescript
GET    /api/v1/tax/calculate            # Calculate tax
POST   /api/v1/tax/deductions          # Add deduction
GET    /api/v1/tax/reports/generate-full # Generate tax report
```

**Core Database Tables**:

```sql
CREATE TABLE tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    country_code VARCHAR(3) NOT NULL,
    region VARCHAR(100),
    tax_year INTEGER NOT NULL,
    filing_status VARCHAR(50),
    dependents INTEGER DEFAULT 0,
    custom_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax brackets (configurable per country)
CREATE TABLE tax_brackets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(3) NOT NULL,
    tax_year INTEGER NOT NULL,
    min_income DECIMAL(15,2) NOT NULL,
    max_income DECIMAL(15,2),
    tax_rate DECIMAL(5,2) NOT NULL,
    bracket_type VARCHAR(50) DEFAULT 'income', -- income, capital_gains
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(country_code, tax_year, min_income, bracket_type)
);

-- Deductions
CREATE TABLE tax_deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tax_year INTEGER NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    date DATE,
    document_url TEXT,
    status VARCHAR(20) DEFAULT 'claimed', -- claimed, approved, rejected
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tax calculations (cached)
CREATE TABLE tax_calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    tax_year INTEGER NOT NULL,
    total_income DECIMAL(15,2),
    taxable_income DECIMAL(15,2),
    total_deductions DECIMAL(15,2),
    tax_owed DECIMAL(15,2),
    capital_gains_tax DECIMAL(15,2),
    calculation_details JSONB,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tax_year)
);

CREATE INDEX idx_tax_deductions_user ON tax_deductions(user_id, tax_year);

```

### **2.9 AI/Analytics Service (Port 3009)**

**Responsibilities**: Auto-categorization, insights, predictions, AI chat

**Key Endpoints**:

```
POST   /api/v1/ai/chat                  # AI chat
POST   /api/v1/ai/categorize            # Auto-categorize expense
GET    /api/v1/ai/insights              # Get insights
POST   /api/v1/ai/predict/cashflow      # Cashflow prediction
```

```coffeescript
// MongoDB Collections

// ml_models
{
  _id: ObjectId,
  userId: String,
  modelType: String, // categorization, prediction, anomaly
  version: String,
  accuracy: Number,
  trainedAt: Date,
  features: Object,
  weights: Object
}

// expense_insights
{
  _id: ObjectId,
  userId: String,
  insightType: String, // spending_pattern, savings_opportunity, risk_alert
  title: String,
  description: String,
  severity: String, // low, medium, high
  category: String,
  amount: Number,
  date: Date,
  metadata: Object,
  isRead: Boolean,
  createdAt: Date
}

// ai_chat_history
{
  _id: ObjectId,
  userId: String,
  sessionId: String,
  role: String, // user, assistant
  message: String,
  intent: String,
  entities: Object,
  response: Object,
  timestamp: Date
}

// analytics_cache
{
  _id: ObjectId,
  userId: String,
  cacheKey: String,
  data: Object,
  expiresAt: Date,
  createdAt: Date
}

// Redis Keys
// user:{userId}:spending:monthly:{YYYY-MM}
// user:{userId}:category:top
// user:{userId}:insights:latest
// user:{userId}:predictions:cashflow
```

### **2.10 Notification Service (Port 3010)**

**Responsibilities**: Push, email, SMS notifications

Tech: Express Js

**Key Endpoints**:

```coffeescript
GET    /api/v1/notifications            # List notifications
POST   /api/v1/notifications/send       # Send notification (internal)
```

**Core Database Tables**:

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL, -- expense, investment, loan, etc.
    category VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
    channels VARCHAR(20)[] DEFAULT ARRAY['push'], -- push, email, sms
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notification templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    template_key VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    body_template TEXT NOT NULL,
    variables JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(category, channel, template_key)
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_status ON notifications(status, created_at);

```

### **2.11 Automation Service (Port 3011)**

**Responsibilities**: Rule engine, scheduled tasks, triggers

Tech: Nest Js

**Key Endpoints**:

```coffeescript
POST   /api/v1/automation/rules         # Create rule
GET    /api/v1/automation/rules         # List rules
POST   /api/v1/automation/trigger       # Trigger event (internal)
```

```sql
CREATE TABLE automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL, -- time, expense, income, investment, group
    trigger_config JSONB NOT NULL,
    action_type VARCHAR(50) NOT NULL, -- notify, save, log, categorize
    action_config JSONB NOT NULL,
    conditions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rule execution logs
CREATE TABLE rule_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    trigger_data JSONB,
    action_result JSONB,
    status VARCHAR(20), -- success, failed
    error_message TEXT,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_automation_rules_user ON automation_rules(user_id);
CREATE INDEX idx_rule_exec_rule ON rule_executions(rule_id, executed_at DESC);

```

### **2.12 Report Service (Port 3012)**

**Responsibilities**: Report generation, data export

Tech: Express Js

**Key Endpoints**:

```coffeescript
POST   /api/v1/reports/generate         # Generate report
GET    /api/v1/reports/:reportId        # Get report
GET    /api/v1/reports/:reportId/download # Download report
```

```sql
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    report_type VARCHAR(50) NOT NULL, -- monthly, tax, portfolio, custom
    format VARCHAR(10) NOT NULL, -- pdf, xlsx, csv
    parameters JSONB,
    file_url TEXT,
    file_size INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    error_message TEXT,
    generated_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_user ON generated_reports(user_id, created_at DESC);
```

### **2.13 Market Data Service (Port 3013)**

**Responsibilities**: Stock/crypto prices, exchange rates

Tech: Express Js

**Key Endpoints**:

```coffeescript
GET    /api/v1/market/stocks/:symbol    # Get stock quote
GET    /api/v1/market/crypto/:symbol    # Get crypto quote
GET    /api/v1/market/forex/:pair       # Get exchange rate
```

### **2.14 Savings & Goals Service (Port 3014)**

**Responsibilities**: Savings goals, emergency funds, auto-save rules

**Key Endpoints**:

```coffeescript
POST   /api/v1/savings/goals            # Create savings goal
POST   /api/v1/savings/goals/:id/contribute # Contribute to goal
GET    /api/v1/savings/goals/:id/progress # Goal progress
```

---

## **3. EVENT-DRIVEN ARCHITECTURE**

### **3.1 RabbitMQ Configuration**

**Exchanges**:

- `user.events` (fanout) - User lifecycle events
- `financial.events` (topic) - Financial transactions
- `notification.events` (direct) - Notifications
- `analytics.events` (topic) - Analytics events

**Key Events**:

typescript

```
// User Events
user.created
user.updated
user.deleted

// Financial Events
expense.created
expense.updated
income.received
investment.transaction
loan.payment
group.expense.created

// Notification Events
notification.send
notification.read

// Automation Events
automation.trigger
rule.executed
```

### **3.2 Event Handlers Example**

typescript

```
// Expense created event
{
  event: 'expense.created',
  data: {
    userId: 'uuid',
    expenseId: 'uuid',
    amount: 500.00,
    category: 'Food',
    date: '2025-12-11'
  }
}

// Handlers:
// 1. AI Service: Auto-categorization
// 2. Analytics Service: Update spending insights
// 3. Notification Service: Send budget alert
// 4. Automation Service: Check triggers
// 5. Tax Service: Update deductible expenses
```

---

## **5. SECURITY IMPLEMENTATION**

### **5.1 Authentication & Authorization With Better Auth**

### **5.2 Data Protection**

- Sensitive data: AES-256 encryption
- HTTPS/TLS enforced
- SQL injection prevention (parameterized queries)
- XSS protection (helmet.js)
- CORS configuration
- Rate limiting (100 req/min per user)

### **5.3 Privacy Compliance**

- GDPR compliance features
- Data export functionality
- Account deletion with data purge
- Audit logs for sensitive operations
- Data minimization principles

---

### **6.2 Production Considerations**

- Horizontal scaling with load balancers
- Database read replicas for heavy read services
- Redis cluster for caching
- CDN for static assets
- Health checks for all services
- Monitoring with Prometheus + Grafana
- Centralized logging with ELK Stack
- Automated backups

---

## **7. KEY ALGORITHMS & FEATURES**

### **7.1 Cashflow Projection Algorithm**

```tsx
1. Calculate average daily burn rate (last 30 days)
2. Add confirmed future expenses (recurring, loans)
3. Subtract expected income (salary, investments)
4. Project daily balance
5. Identify warning dates (balance < threshold)
6. Cache results (5 min TTL)
```

### **7.2 Group Settlement Algorithm**

```
1. Calculate net balance for each member
2. Identify creditors (positive) and debtors (negative)
3. Sort by absolute balance
4. Match largest debtor with largest creditor
5. Create settlement transaction
6. Repeat until all balances zero
7. Minimize number of transactions
```

### **7.3 Investment P&L Calculation**

```
// Real-time calculation
Current Value = Quantity × Current Price
Total Invested = Σ(Buy Amounts) - Σ(Sell Amounts)
Unrealized P&L = Current Value - Total Invested
Realized P&L = Σ(Sell Profit/Loss)
Total Return = Unrealized P&L + Realized P&L
Return % = (Total Return / Total Invested) × 100
```

### **7.4 Tax Calculation Engine**

```
1. Fetch all income for tax year
2. Apply income tax brackets (progressive)
3. Calculate capital gains (short/long term)
4. Apply deductions (standard/itemized)
5. Calculate tax owed
6. Apply credits
7. Generate tax liability
```

### **7.5 AI Auto-Categorization**

```
1. Extract features: description, amount, merchant, time
2. Apply ML model (trained on user's history)
3. Predict category with confidence score
4. Fallback to rule-based if low confidence
5. Learn from user corrections
```

---

## **8. MONITORING & OBSERVABILITY**

### **8.1 Metrics Collection**

```yaml
# Prometheus Metrics
- Service health checks
- Response times (p95, p99)
- Error rates (4xx, 5xx)
- Database query performance
- Redis cache hit/miss ratio
- RabbitMQ queue lengths
- Memory/CPU usage
```

### **8.2 Logging Strategy**

```yaml
# Structured Logging
- JSON format for all logs
- Correlation IDs for request tracing
- Log levels: error, warn, info, debug
- Centralized log aggregation (ELK)
- Retention: 30 days (hot), 1 year (cold)
```

### **8.3 Alerting Rules**

```yaml
# Critical Alerts
- Service down > 5 minutes
- Error rate > 5%
- Response time > 10s (p95)
- Database connection failures
- Redis memory > 80%
- Disk space < 20%
```

---

## **9. DEVELOPMENT WORKFLOW**

### **9.2 Git Strategy**

```
main        → Production
develop     → Staging
feature/*   → Feature branches
release/*   → Release branches
hotfix/*    → Hotfix branches
```

### **9.3 CI/CD Pipeline**

```
1. Code push → GitHub
2. Lint & Format check
3. Unit tests (Jest)
4. Integration tests
5. Build Docker images
6. Security scan
7. Deploy to staging
8. E2E tests
9. Deploy to production
```

---

## **10. SCALABILITY CONSIDERATIONS**

### **10.1 Horizontal Scaling**

- Stateless services for easy scaling
- Load balancers for traffic distribution
- Database connection pooling
- Redis cluster for shared cache
- Message queue for async processing

### **10.2 Performance Optimization**

- Database indexing strategy
- Query optimization
- Pagination for large datasets
- Lazy loading
- CDN for static assets
- Compression (gzip/brotli)

### **10.3 Database Scaling**

- Read replicas for heavy read services
- Database partitioning (by user_id)
- Connection pooling per service
- Query caching with Redis
- Database connection limits per service

---

## **11. DISASTER RECOVERY**

### **11.1 Backup Strategy**

```
# Database Backups
- Automated daily backups
- Incremental backups every 6 hours
- Retention: 30 days daily, 1 year weekly
- Off-site storage (S3/Glacier)

# Configuration Backups
- Infrastructure as Code (Terraform)
- Docker images in registry
- Environment variables in vault
```

### **11.2 Recovery Procedures**

```
# Service Recovery
1. Health check failures trigger auto-restart
2. Circuit breakers for dependent services
3. Fallback to cached data
4. Graceful degradation

# Database Recovery
1. Point-in-time recovery from backups
2. Read-only mode during recovery
3. Data consistency checks
4. Gradual traffic increase
```

---

## **12. COST OPTIMIZATION**

### **12.1 Resource Allocation**

```
# Service Tiers
- High: Auth, User, Expense (2-4 instances)
- Medium: Investment, Loan, Group (1-2 instances)
- Low: Tax, Report, Market (1 instance)

# Database Sizes
- Large: Expense, Investment (100GB+)
- Medium: User, Loan (50GB)
- Small: Auth, Notification (10GB)
```
