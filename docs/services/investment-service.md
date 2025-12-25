# Investment Service Documentation

## 1. Service Overview
**Service Name**: `investment-service`
**Bounded Context**: Portfolio Management & Market Analysis
**Responsibility**:
- Asset Tracking (Stocks, Crypto, ETFs, Bonds).
- Portfolio Performance (Realized/Unrealized Gains, ROI).
- Market Data Ingestion (Real-time/EOD prices).
- Transaction History (Buy, Sell, Dividends, Splits).

**Non-Responsibilities**:
- General Expense Tracking (Ledger Service).
- Tax Filing (Ledger Service handles the aggregates, Investment Service provides the data).

**Justification**:
Consolidates `Investment Service` and `Market Data Service`. Market Data is technically just an "Oracle" for the Investment domain. separating it creates latency and complexity when calculating portfolio values (a Portfolio Service would have to query Market Data for every single viewing). Merging them allows for efficient joining of "My Quantity" * "Current Price".

## 2. Use Cases

### User
- **Add Transaction**: "Bought 10 AAPL at $150 on 2023-01-01".
- **View Dashboard**: Total Value, Daily Change, Allocation Pie Chart.
- **Watchlist**: Track assets I don't own yet.
- **Drill Down**: See performance of a specific holding.

### System
- **Price Scheduler**: Periodically fetch latest prices for all user-held symbols.

## 3. Database Design
**Database**: PostgreSQL
**Schema**: `investment`

### Core Tables

#### `portfolios`
Logical grouping of assets.
```sql
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `holdings`
Current snapshot of ownership (Optimized Read Model).
```sql
CREATE TABLE holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL, -- AAPL, BTC
    market_code VARCHAR(10) DEFAULT 'US', -- Exchange code
    quantity DECIMAL(20,8) NOT NULL,
    average_buy_price DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_id, symbol)
);
```

#### `transactions`
The immutable history.
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id),
    type VARCHAR(20) NOT NULL, -- BUY, SELL, DIVIDEND, SPLIT
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20,8) NOT NULL,
    price_per_unit DECIMAL(15,2) NOT NULL,
    fees DECIMAL(15,2) DEFAULT 0,
    date TIMESTAMP NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `market_prices` (Timeseries)
Historical price data.
```sql
CREATE TABLE market_prices (
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    date TIMESTAMP NOT NULL,
    source VARCHAR(50), -- 'yahoo', 'alpha_vantage'
    PRIMARY KEY (symbol, date)
);
-- Note: In production, this might move to TimeScaleDB or InfluxDB.
```

## 4. API Design
**Protocol**: REST / JSON

### Endpoints
- `GET /portfolios` - List summaries.
- `GET /portfolios/:id` - Detailed view with current market value.
- `POST /transactions` - Record a trade.
    - Side Effect: Re-calculates `holdings` average price.
- `GET /market/search` - Search for symbols (Proxy to Provider).
- `GET /market/chart/:symbol` - Get price history.

## 5. Business Logic & Workflows

### Recording a BUY
1. **Input**: Symbol, Qty, Price, Date.
2. **Transaction**: Insert row into `transactions`.
3. **Holding Update**: 
   - Get existing holding.
   - Calculate new `weighted_average_price`.
   - `NewQty = OldQty + BuyQty`.
   - Update `holdings` table.
4. **Ledger Sync (Optional)**: If linked to a cash account, debit the cost from **Ledger**.

### Price Updates (Background Job)
1. **Trigger**: Every 15 minutes (or daily EOD).
2. **Scope**: Select distinct `symbol` from `holdings` table.
3. **Fetch**: Batch query external Provider API.
4. **Store**: Insert into `market_prices`.

## 6. Inter-Service Communication

### Outbound
- **Ledger Service**: Optionally push "Realized Gains" (Sell events) or "Dividends" as Income transactions.
- **External APIs**: Yahoo Finance / Finnhub.

## 7. Scalability & Performance
- **Caching**: `latest_price:{symbol}` in Redis is critical. Do not query DB for current price constantly.
- **Batching**: Market data providers have rate limits. Must batch requests.

## 8. Observability
- **Metrics**: `market_data_api_latency`, `portfolio_valuation_time`.

## 9. Testing Strategy
- **Unit**: Average Cost Basis (ACB) calculation logic. This is complex (FIFO vs Weighted Avg).
- **Integration**: Mock the Market Data API to ensure system handles "API Down" gracefully.
