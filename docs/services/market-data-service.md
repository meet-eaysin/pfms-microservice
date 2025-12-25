# Market Data Service Documentation

## 1. Service Overview

**Service Name**: `market-data-service`
**Purpose**: Acts as an Oracle for financial market data (Stock prices, Crypto rates, Forex).
**Responsibility**:

- Fetching real-time/delayed prices from external providers.
- Caching market data to avoid rate limits.
- Asset Symbol Search.
  **Business Value**: Ensures investment values are accurate and up-to-date without spamming costly external APIs.
  **Scope**:
- **In Scope**: Fetching, Caching, Serving prices.
- **Out of Scope**: Storing user portfolios (Investment Service), Trading execution.

## 2. Functional Description

**Core Features**:

- Unified API for multiple asset classes (Stocks, Crypto).
- Intelligent caching (TTL based on market hours).
- Batch price fetching.
  **Internal Responsibilities**:
- Managing API keys for 3rd party providers (AlphaVantage, CoinGecko, Yahoo Finance).
  **Non-functional Expectations**:
- **Reliability**: Graceful degradation if external API is down (Serve stale cache).
- **Latency**: < 50ms (Served from Redis).

## 3. Database Design

**Database Type**: Redis (Primary Cache) + PostgreSQL (Historical Data)

### Schema (Key Tables)

#### `asset_prices`

| Column         | Type      | Description        |
| :------------- | :-------- | :----------------- |
| `symbol`       | VARCHAR   | PK, "AAPL"         |
| `price`        | DECIMAL   | Last close/current |
| `currency`     | CHAR(3)   |                    |
| `last_updated` | TIMESTAMP |                    |

#### `historical_candles`

| Column   | Type    | Description  |
| :------- | :------ | :----------- |
| `symbol` | VARCHAR | Composite PK |
| `date`   | DATE    | Composite PK |
| `open`   | DECIMAL |              |
| `high`   | DECIMAL |              |
| `low`    | DECIMAL |              |
| `close`  | DECIMAL |              |
| `volume` | BIGINT  |              |

**Data Lifecycle**: Hot prices in Redis (TTL 15min). EOD history in Postgres (Permanent).
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to search for 'Tesla' to add to my portfolio."
  **System-Driven**:
- "Investment Service requests current price of 'BTC' to value portfolio."
  **Edge Cases**:
- Provider API rate limit exceeded.
- Unknown symbol.

## 5. API Design (Port 3013)

### Prices

#### Get Price

**Endpoint**: `GET /api/v1/market/price/:symbol`

- **Response**:
  ```json
  {
    "symbol": "AAPL",
    "price": 175.5,
    "currency": "USD",
    "percentChange": 1.25,
    "lastUpdated": "..."
  }
  ```

#### Batch Prices

**Endpoint**: `POST /api/v1/market/prices`

- **Body**: `{ "symbols": ["AAPL", "BTC", "ETH"] }`
- **Response**: `{ "AAPL": {...}, "BTC": {...} }`

### Search

#### Search Assets

**Endpoint**: `GET /api/v1/market/search`

- **Query**: `q=Apple`
- **Response**:
  ```json
  {
    "matches": [{ "symbol": "AAPL", "name": "Apple Inc.", "type": "Equity" }]
  }
  ```

## 6. Inter-Service Communication

**Calls**:

- External APIs (Yahoo Finance / CoinGecko).
  **Called By**:
- `investment-service`: Heavily used.
  **Events Published**:
- `market.price_update` (Optional/Periodic): Broadcast major index moves.

## 7. Third-Party Dependencies

1.  **Yahoo Finance API** (Unofficial/Official): Stocks.
2.  **CoinGecko API**: Crypto.
3.  **AlphaVantage/IEX**: Backup for stocks.
    - **Auth**: API Keys.
    - **Rate Limits**: Strict (e.g. 5 calls/min on free tier) -> Requires aggressive caching.

## 8. Security Considerations

- **API Keys**: Never expose external provider keys to client.
- **Validation**: Sanitize symbol inputs to prevent injection (though low risk).

## 9. Configuration & Environment

- `YAHOO_API_KEY`, `COINGECKO_API_KEY`.
- `REDIS_URL`.

## 10. Observability & Monitoring

- **Metrics**:
  - `external_api_calls_total{provider="yahoo"}`
  - `cache_hit_ratio`
- **Logs**: Log failures to upstream providers.

## 11. Error Handling & Edge Cases

- **Symbol Not Found**: 404.
- **Provider Error**: 502 Bad Gateway (or return cached data with warning).

## 12. Assumptions & Open Questions

- **Assumption**: We use free/freemium tiers of APIs, so real-time data is not guaranteed (likely 15min delayed).
