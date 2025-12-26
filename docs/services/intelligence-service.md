# Intelligence Service Documentation

## 1. Service Overview

**Service Name**: `intelligence-service`
**Purpose**: Powers the AI features of the platform, including Chat, Insights, and Predictions.
**Responsibility**:

- AI Chatbot (Financial Assistant)
- Spend Anomaly Detection
- Cashflow Forecasting (ML)
- Transaction Auto-Categorization
  **Business Value**: Provides the "Smart" in "Smart Finance", differentiating the product from simple spreadsheet apps.
  **Scope**:
- **In Scope**: LLM integration, ML model inference, Vector DB management.
- **Out of Scope**: Model training infrastructure (assumed offline/job based).

## 2. Functional Description

**Core Features**:

- Natural Language Querying ("How much did I spend on Uber?").
- Context-aware insights.
- Categorization API.
- **Financial Health Scoring**: 0-100 Score based on Savings Rate, Debt-to-Income, and Diversification.
- **Smart Budgeting**: Suggested limits based on historical spending patterns.
- **Investment Sentiment**: News analysis for portfolio assets.
  **Internal Responsibilities**:
- RAG (Retrieval Augmented Generation) pipeline.
- Sanitizing data before sending to LLM.
  **Non-functional Expectations**:
- **Latency**: Streaming responses for Chat to reduce perceived latency.
- **Privacy**: Strict PII redaction before external API calls.

## 3. Database Design

**Database Type**: MongoDB (Chat History) + Redis (Cache) + Vector DB (pgvector or Pinecone)

### Schema (Key Collections)

#### `chat_sessions` (Mongo)

```json
{
  "_id": "uuid",
  "userId": "uuid",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "startedAt": "timestamp"
}
```

#### `forecasts` (Postgres)

| Column       | Type    | Description       |
| :----------- | :------ | :---------------- |
| `user_id`    | UUID    | PK                |
| `date`       | DATE    | Forecast Date     |
| `amount`     | DECIMAL | Predicted Balance |
| `confidence` | DECIMAL | 0-1               |

#### `financial_health_scores` (Postgres)

| Column         | Type      | Description |
| :------------- | :-------- | :---------- |
| `user_id`      | UUID      | PK          |
| `score`        | INT       | 0-100       |
| `components`   | JSONB     | Breakdown   |
| `calculated_at`| TIMESTAMP |             |

**Data Lifecycle**: Chat history 1 year.
**Migration Strategy**: Standard Schema updates.

## 4. Use Cases

**User-Driven**:

- "As a user, I ask: 'Can I afford a vacation?'"
- "As a user, I want to see why my Financial Health Score dropped."
  **System-Driven**:
- "Suggest category 'Food' for transaction 'MCDONALDS 342'."
- "Propose a budget of $400 for 'Dining Out' based on 3-month average."
  **Edge Cases**:
- LLM Hallucinations (Disclaimer required).
- Token limit exceeded.

## 5. API Design (Port 3009)

### AI Chat

#### Send Message

**Endpoint**: `POST /api/v1/ai/chat`

- **Body**: `{ "message": "Analyze my spending." }`
- **Response**: `{ "reply": "Sure...", "intent": "analytics" }`

### Insights

#### Get Categorization

**Endpoint**: `POST /api/v1/ai/categorize`

- **Body**: `{ "description": "Starbucks", "amount": 5.00 }`
- **Response**: `{ "category": "Coffee", "confidence": 0.99 }`

#### Get Forecast

**Endpoint**: `GET /api/v1/ai/forecast/cashflow`

- **Query**: `days=30`
- **Response**: `{ "points": [...] }`

#### Get Financial Health Score

**Endpoint**: `GET /api/v1/ai/health-score`

- **Response**: `{ "score": 85, "insights": ["Good savings rate", "High Debt"] }`

#### Get Smart Budget Suggestions

**Endpoint**: `GET /api/v1/ai/planning/budget-suggestions`

- **Response**: `{ "suggestions": [{ "category": "Food", "limit": 450, "reason": "Average spend $430" }] }`

## 6. Inter-Service Communication

**Calls**:

- `ledger-service`: To fetch transaction data for context.
- `planning-service`: To fetch current budgets vs actuals.
- `investment-service`: To fetch portfolio composition for sentiment analysis.
- External LLM (OpenAI/Gemini).
  **Called By**:
- **API Gateway** (Chat).
- `expense-service` (Auto-categorize).
- `planning-service` (Fetch suggested budgets).
  **Events Published**:
- `ai.health_score.updated`:
  - `notification-service`: Alert user if score drops significantly.
  **Subscribed Events**:
- `expense.created`: Update user context/embeddings.
- `investment.transaction.created`: Update portfolio context.

## 7. Third-Party Dependencies

1.  **OpenAI / Gemini / Anthropic API**: LLM Provider.
    - **Auth**: API Key.
    - **Cost**: Managed via rate limits.

## 8. Security Considerations

- **Data Leakage**: Do not send raw PII to LLM. Replace names with generic tokens if needed.
- **Injection**: Prompt Injection defenses required.

## 9. Configuration & Environment

- `OPENAI_API_KEY`.
- `MONGO_URL`.

## 10. Observability & Monitoring

- **Metrics**:
  - `ai_tokens_used_total`
  - `ai_response_time_seconds`
- **Logs**: Log user intents (not raw content if private).

## 11. Error Handling & Edge Cases

- **AI Down**: Fallback to rule-based logic or "Service Unavailable".

## 12. Assumptions & Open Questions

- **Assumption**: User consents to AI data processing.
