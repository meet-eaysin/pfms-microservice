# Personal Financial Management System (PFMS)

## Complete System & Database Design

---

## 1. MICROSERVICES ARCHITECTURE

### 1.1 Service Breakdown

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (NestJS)                    │
│          Rate Limiting, Auth, Routing, Load Balancing        │
└─────────────────────────────────────────────────────────────┘
                              ↓
        ┌─────────────────────┴─────────────────────┐
        ↓                     ↓                      ↓
┌───────────────┐    ┌───────────────┐    ┌──────────────────┐
│  Auth Service │    │ User Service  │    │ Expense Service  │
│   (NestJS)    │    │  (NestJS)     │    │   (Express.js)   │
└───────────────┘    └───────────────┘    └──────────────────┘
        ↓                     ↓                      ↓
┌───────────────┐    ┌───────────────┐    ┌──────────────────┐
│  PostgreSQL   │    │  PostgreSQL   │    │   PostgreSQL     │
└───────────────┘    └───────────────┘    └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Investment       │  │  Loan & Debt     │  │  Group Finance   │
│ Service          │  │  Service         │  │  Service         │
│ (Express.js)     │  │  (NestJS)        │  │  (Express.js)    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        ↓                     ↓                      ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PostgreSQL     │  │   PostgreSQL     │  │   PostgreSQL     │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ AI/Analytics     │  │  Tax Service     │  │  Notification    │
│ Service          │  │  (NestJS)        │  │  Service         │
│ (Express.js)     │  │                  │  │  (NestJS)        │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        ↓                     ↓                      ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   MongoDB +      │  │   PostgreSQL     │  │   Redis +        │
│   Redis          │  │                  │  │   PostgreSQL     │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Automation       │  │  Report/Export   │  │  Market Data     │
│ Service          │  │  Service         │  │  Service         │
│ (NestJS)         │  │  (Express.js)    │  │  (Express.js)    │
└──────────────────┘  └──────────────────┘  └──────────────────┘
        ↓                     ↓                      ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   PostgreSQL +   │  │   S3/MinIO +     │  │   Redis +        │
│   Redis          │  │   PostgreSQL     │  │   External APIs  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

```

### 1.2 Core Services

### **1. Auth Service (NestJS)** - Port 3001

- JWT token generation & validation
- OAuth integrations (Google, Apple, Facebook)
- MFA management
- Session management
- Device tracking
- Password reset flow

**Tech Stack**: NestJS, Passport.js, JWT, Redis (session store), PostgreSQL

### **2. User Service (NestJS)** - Port 3002

- User profile CRUD
- Preferences management
- Currency & timezone settings
- Privacy settings
- Family member management

**Tech Stack**: NestJS, TypeORM, PostgreSQL, Redis (cache)

### **3. Expense Service (Express.js)** - Port 3003

- Daily expense CRUD
- Habit tracking
- Recurring costs
- Bulk import (CSV/Excel)
- Voice input processing
- Category management

**Tech Stack**: Express.js, Prisma, PostgreSQL, Bull (job queue)

### **4. Income Service (Express.js)** - Port 3004

- Income tracking
- Salary management
- Cashflow projection
- Future balance prediction

**Tech Stack**: Express.js, Prisma, PostgreSQL

### **5. Investment Service (Express.js)** - Port 3005

- Portfolio management
- Transaction tracking (buy/sell)
- P&L calculation
- Asset diversification
- Risk analytics

**Tech Stack**: Express.js, Prisma, PostgreSQL, Redis (price cache)

### **6. Loan & Debt Service (NestJS)** - Port 3006

- Loan CRUD
- EMI calculation
- Interest computation
- Payment tracking
- Debt analytics

**Tech Stack**: NestJS, TypeORM, PostgreSQL

### **7. Group Finance Service (Express.js)** - Port 3007

- Group management
- Split calculations
- Settlement algorithms
- Group chat (optional)
- Member permissions

**Tech Stack**: Express.js, Prisma, PostgreSQL, [Socket.io](http://socket.io/)

### **8. Tax Service (NestJS)** - Port 3008

- Tax calculation
- Tax rule engine
- Capital gains computation
- Deduction tracking
- Tax report generation

**Tech Stack**: NestJS, TypeORM, PostgreSQL

### **9. AI/Analytics Service (Express.js)** - Port 3009

- Auto-categorization (ML)
- Spending insights
- Anomaly detection
- AI chat interface
- Predictive analytics

**Tech Stack**: Express.js, Python (FastAPI sidecar), TensorFlow/PyTorch, MongoDB (logs), Redis

### **10. Notification Service (NestJS)** - Port 3010

- Push notifications
- Email delivery
- SMS (Twilio)
- In-app notifications
- Notification preferences

**Tech Stack**: NestJS, Bull MQ, Redis, PostgreSQL, FCM, SendGrid

### **11. Automation Service (NestJS)** - Port 3011

- Rule engine
- Trigger management
- Scheduled tasks
- Event-driven automation

**Tech Stack**: NestJS, Bull, Node-cron, PostgreSQL, Redis

### **12. Report/Export Service (Express.js)** - Port 3012

- PDF generation
- Excel export
- CSV export
- Analytics dashboards
- Custom reports

**Tech Stack**: Express.js, Puppeteer, ExcelJS, PostgreSQL, S3/MinIO

### **13. Market Data Service (Express.js)** - Port 3013

- Real-time price updates
- Stock/crypto data fetching
- Exchange rate updates
- Market news aggregation

**Tech Stack**: Express.js, Redis, External APIs (Alpha Vantage, CoinGecko, etc.)

---

## 2. DATABASE DESIGN

### 2.1 Auth Service DB (PostgreSQL)

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

### 2.2 User Service DB (PostgreSQL)

```sql
-- User profiles
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

### 2.3 Expense Service DB (PostgreSQL)

```sql
-- Categories
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

### 2.4 Income Service DB (PostgreSQL)

```sql
-- Income sources
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

### 2.5 Investment Service DB (PostgreSQL)

```sql
-- Portfolios
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

### 2.6 Loan Service DB (PostgreSQL)

```sql
-- Contacts (Internal app users + External contacts)
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

### 2.7 Group Finance Service DB (PostgreSQL)

```sql
-- Groups
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

### 2.8 Tax Service DB (PostgreSQL)

```sql
-- Tax profiles
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

### 2.9 AI/Analytics Service DB (MongoDB + Redis)

```jsx
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

### 2.10 Notification Service DB (PostgreSQL + Redis)

```sql
-- Notifications
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

### 2.11 Automation Service DB (PostgreSQL + Redis)

```sql
-- Automation rules
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

### 2.12 Report/Export Service DB (PostgreSQL + S3)

```sql
-- Generated reports
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

---

## 3. INTER-SERVICE COMMUNICATION

### 3.1 Communication Patterns

```yaml
# Event-Driven (RabbitMQ/Kafka)
Events:
  - user.created
  - expense.added
  - investment.transaction
  - loan.payment
  - group.expense.split
  - notification.send
  - automation.trigger

# Synchronous (REST/gRPC)
API Calls:
  - Auth validation
  - User profile fetch
  - Tax calculation
  - Report generation

```

### 3.2 Message Queue Structure (RabbitMQ)

```
Exchanges:
├── user.events (fanout)
├── financial.events (topic)
├── notification.events (direct)
└── analytics.events (topic)

Queues:
├── expense.created → AI Service, Analytics
├── investment.update → Tax Service, Analytics
├── loan.payment → Notification Service
├── group.settlement → Notification Service
└── automation.trigger → Automation Service

```

---

## 4. API GATEWAY ROUTES

```tsx
// NestJS API Gateway Configuration

const routes = {
  // Auth routes
  'POST /api/v1/auth/register': 'auth-service',
  'POST /api/v1/auth/login': 'auth-service',
  'POST /api/v1/auth/refresh': 'auth-service',
  'POST /api/v1/auth/logout': 'auth-service',
  'POST /api/v1/auth/oauth/:provider': 'auth-service',

  // User routes
  'GET /api/v1/user/profile': 'user-service',
  'PUT /api/v1/user/profile': 'user-service',
  'GET /api/v1/user/preferences': 'user-service',
  'PUT /api/v1/user/preferences': 'user-service',

  // Expense routes
  'POST /api/v1/expenses': 'expense-service',
  'GET /api/v1/expenses': 'expense-service',
  'PUT /api/v1/expenses/:id': 'expense-service',
  'DELETE /api/v1/expenses/:id': 'expense-service',
  'POST /api/v1/expenses/bulk-import': 'expense-service',
  'GET /api/v1/expenses/categories': 'expense-service',
  'POST /api/v1/expenses/recurring': 'expense-service',

  // Habit routes
  'POST /api/v1/habits': 'expense-service',
  'GET /api/v1/habits': 'expense-service',
  'POST /api/v1/habits/:id/log': 'expense-service',
  'GET /api/v1/habits/:id/analytics': 'expense-service',

  // Income routes
  'POST /api/v1/income': 'income-service',
  'GET /api/v1/income': 'income-service',
  'GET /api/v1/income/projection': 'income-service',

  // Investment routes
  'POST /api/v1/portfolios': 'investment-service',
  'GET /api/v1/portfolios': 'investment-service',
  'POST /api/v1/portfolios/:id/assets': 'investment-service',
  'POST /api/v1/portfolios/:id/transactions': 'investment-service',
  'GET /api/v1/portfolios/:id/analytics': 'investment-service',

  // Loan routes
  'POST /api/v1/loans': 'loan-service',
  'GET /api/v1/loans': 'loan-service',
  'POST /api/v1/loans/:id/payments': 'loan-service',
  'GET /api/v1/loans/:id/schedule': 'loan-service',

  // Group routes
  'POST /api/v1/groups': 'group-service',
  'GET /api/v1/groups': 'group-service',
  'POST /api/v1/groups/:id/expenses': 'group-service',
  'POST /api/v1/groups/:id/settle': 'group-service',
  'GET /api/v1/groups/:id/balances': 'group-service',

  // Tax routes
  'GET /api/v1/tax/calculate': 'tax-service',
  'GET /api/v1/tax/deductions': 'tax-service',
  'POST /api/v1/tax/deductions': 'tax-service',
  'GET /api/v1/tax/report': 'tax-service',

  // AI routes
  'POST /api/v1/ai/chat': 'ai-service',
  'GET /api/v1/ai/insights': 'ai-service',
  'POST /api/v1/ai/categorize': 'ai-service',

  // Automation routes
  'POST /api/v1/automation/rules': 'automation-service',
  'GET /api/v1/automation/rules': 'automation-service',
  'PUT /api/v1/automation/rules/:id': 'automation-service',

  // Report routes
  'POST /api/v1/reports/generate': 'report-service',
  'GET /api/v1/reports/:id': 'report-service',
  'GET /api/v1/reports': 'report-service'
};

```

---

## 5. TECHNOLOGY STACK SUMMARY

### Core Technologies

```yaml
Backend:
  - NestJS: Auth, User, Loan, Tax, Notification, Automation services
  - Express.js: Expense, Income, Investment, Group, AI, Report, Market services
  - Node.js: v20.x LTS

Databases:
  - PostgreSQL 16: Primary relational data
  - MongoDB 7: AI/Analytics logs and unstructured data
  - Redis 7: Caching, sessions, real-time data, job queues

Message Queue:
  - RabbitMQ or Apache Kafka: Event-driven architecture

Job Processing:
  - Bull/BullMQ: Background jobs, scheduled tasks

API Gateway:
  - NestJS with rate limiting, authentication middleware

ORM/ODM:
  - TypeORM (NestJS services)
  - Prisma (Express.js services)
  - Mongoose (MongoDB)

Authentication:
  - Passport.js
  - JWT (access + refresh tokens)
  - OAuth 2.0

Real-time:
  - Socket.io: Group chat, live updates

AI/ML:
  - TensorFlow.js or Python microservice (FastAPI)
  - OpenAI API (for AI chat)

External APIs:
  - Alpha Vantage: Stock prices
  - CoinGecko: Crypto prices
  - SendGrid: Email
  - Twilio: SMS
  - FCM: Push notifications

DevOps:
  - Docker & Docker Compose
  - Kubernetes (optional for production)
  - GitHub Actions: CI/CD
  - Nginx: Reverse proxy

Monitoring:
  - Prometheus + Grafana
  - ELK Stack (Elasticsearch, Logstash, Kibana)
  - Sentry: Error tracking

Storage:
  - S3 or MinIO: File storage (reports, attachments)

```

---

## 6. SECURITY IMPLEMENTATION

```yaml
Authentication:
  - JWT with short-lived access tokens (15 min)
  - Long-lived refresh tokens (7 days)
  - Token rotation on refresh
  - Blacklist for revoked tokens (Redis)

Authorization:
  - RBAC (Role-Based Access Control)
  - Resource-level permissions
  - JWT claims validation

Data Protection:
  - Bcrypt for password hashing (rounds: 12)
  - AES-256 encryption for sensitive data
  - HTTPS/TLS for all communications
  - Database encryption at rest

API Security:
  - Rate limiting (100 req/min per user)
  - Request validation (class-validator)
  - SQL injection prevention (parameterized queries)
  - XSS protection (helmet.js)
  - CORS configuration

Privacy:
  - GDPR compliance features
  - Data export functionality
  - Account deletion with data purge
  - Audit logs for sensitive operations

```

---

## 7. DEPLOYMENT ARCHITECTURE

```
                    [Load Balancer]
                          |
                    [API Gateway]
                          |
        ┌─────────────────┴──────────────────┐
        |                                     |
   [Services]                         [Message Queue]
        |                                     |
   ┌────┴────┬────┬────┬────┐                |
   |         |    |    |    |                 |
[Auth]  [User] [Expense] ... [Others]        |
   |         |    |    |    |                 |
   └────┬────┴────┴────┴────┘                 |
        |                                     |
   [Databases]                          [Job Queues]
        |                                     |
   ┌────┴────┬──────┬──────┐                |
[PostgreSQL] [MongoDB] [Redis]         [Bull/MQ]

```

### Docker Compose Services

```yaml
services:
  - api-gateway
  - auth-service
  - user-service
  - expense-service
  - income-service
  - investment-service
  - loan-service
  - group-service
  - tax-service
  - ai-service
  - notification-service
  - automation-service
  - report-service
  - market-service
  - postgres (multiple instances)
  - mongodb
  - redis
  - rabbitmq
  - nginx

```

---

## 8. SCALABILITY CONSIDERATIONS

```yaml
Horizontal Scaling:
  - Stateless services
  - Load balancing across service instances
  - Database read replicas
  - Redis cluster for caching

Vertical Scaling:
  - Resource allocation per service
  - Connection pooling
  - Query optimization

Performance:
  - Database indexing strategy
  - Caching layers (Redis)
  - CDN for static assets
  - Lazy loading patterns
  - Pagination for large datasets

Monitoring:
  - Health checks for all services
  - Performance metrics
  - Error rate tracking
  - Resource utilization alerts

```

---

## 9. DEVELOPMENT WORKFLOW

```yaml
Project Structure:
  /pfms-system
    /gateway
    /services
      /auth-service
      /user-service
      /expense-service
      ...
    /shared
      /types
      /utils
      /constants
    /docker
    /k8s (optional)
    /docs

Git Strategy:
  - main branch (production)
  - develop branch (staging)
  - feature branches
  - Conventional commits

CI/CD Pipeline:
  1. Lint & Format check
  2. Unit tests
  3. Integration tests
  4. Build Docker images
  5. Push to registry
  6. Deploy to staging
  7. E2E tests
  8. Deploy to production

Testing Strategy:
  - Unit tests (Jest)
  - Integration tests (Supertest)
  - E2E tests (Playwright)
  - Load testing (Artillery/k6)

```

---

## 10. KEY FEATURES IMPLEMENTATION

### 10.1 AI Categorization Flow

```
Expense Added → Expense Service → Event Published →
AI Service Consumes → ML Model Prediction →
Category Assigned → Database Updated → User Notified

```

### 10.2 Cashflow Projection Algorithm

```
1. Fetch last 3 months expenses (average daily burn)
2. Fetch recurring expenses (confirmed future costs)
3. Fetch expected income (salary dates, freelance)
4. Calculate daily projection
5. Identify warning dates (balance < threshold)
6. Cache results in Redis (5-min TTL)

```

### 10.3 Group Settlement Algorithm (Simplified)

```python
# Debt Graph Reduction
1. Calculate net balance for each member
2. Separate creditors (positive) and debtors (negative)
3. Match largest debtor with largest creditor
4. Create settlement transactions
5. Minimize number of transactions

```

### 10.4 Investment P&L Calculation

```tsx
// Real-time calculation
Current Value = Quantity × Current Price
Total Invested = Sum(Buy Transactions) - Sum(Sell Transactions)
Unrealized P&L = Current Value - Total Invested
Realized P&L = Sum(Sell Amount - (Quantity × Avg Buy Price))
Total Return = Unrealized P&L + Realized P&L

```

---

## 11. SAMPLE API RESPONSES

```tsx
// POST /api/v1/expenses
{
  "success": true,
  "data": {
    "id": "uuid",
    "amount": 500.00,
    "category": {
      "id": "uuid",
      "name": "Food & Dining"
    },
    "date": "2025-12-11",
    "description": "Lunch with team",
    "tags": ["team", "lunch"]
  },
  "message": "Expense added successfully"
}

// GET /api/v1/portfolios/:id/analytics
{
  "success": true,
  "data": {
    "totalInvested": 50000.00,
    "currentValue": 56750.00,
    "totalReturn": 6750.00,
    "returnPercentage": 13.5,
    "diversification": {
      "stocks": 60,
      "crypto": 25,
      "mutualFunds": 15
    },
    "topPerformers": [...],
    "riskMetrics": {
      "volatility": "medium",
      "sharpeRatio": 1.8
    }
  }
}

```

---

This comprehensive design provides you with:

- ✅ Clear microservices boundaries
- ✅ Scalable database schemas
- ✅ Modern tech stack
- ✅ Security best practices
- ✅ Event-driven architecture
- ✅ Production-ready patterns

Perfect for showcasing your full-stack expertise! 🚀