# Intelligence Service Documentation

## 1. Service Overview
**Service Name**: `intelligence-service`
**Bounded Context**: Analytics & Decision Support
**Responsibility**:
- Advanced Reporting (PDF Exports, Cashflow Statements).
- AI Categorization (Machine Learning pipeline).
- Natural Language Querying ("How much did I spend on Sushi?").
- Predictive Analytics (Forecasts).

**Non-Responsibilities**:
- Storing Transactional Truth (Ledger Service).
- Real-time Balance checks (Ledger Service).

**Justification**:
Consolidates `AI/Analytics` and `Report` services. Both are read-heavy, compute-intensive consumers of data. Merging them centralizes the "Data Science" aspect of the platform. Reports are just static outputs of Analytics.

## 2. Use Cases

### User
- **Export Data**: "Download 2024 Tax Report (PDF)".
- **Ask Assistant**: "What is my net worth trend?"
- **Insights**: "You spent 20% more on Coffee this month."
- **Auto-Categorize**: "Uber Eats" -> "Dining".

### System
- **Nightly Batch**: Analyze daily transactions to detect anomalies.

## 3. Database Design
**Database**: MongoDB (Primary for unstructured data) + S3 (Artifacts)
**Schema**: `intelligence`

### Core Collections

#### `generated_reports`
Metadata for file exports.
```json
{
  "_id": "ObjectId",
  "userId": "UUID",
  "type": "TAX_REPORT",
  "status": "COMPLETED",
  "fileUrl": "s3://reports/user-123/2024-tax.pdf",
  "parameters": { "year": 2024 },
  "createdAt": "ISODate"
}
```

#### `chat_history`
Context for LLM Assistant.
```json
{
  "_id": "ObjectId",
  "userId": "UUID",
  "sessionId": "UUID",
  "messages": [
    { "role": "user", "content": "Analyze my spending" },
    { "role": "assistant", "content": "Sure..." }
  ]
}
```

#### `spending_patterns` (Materialized View)
Pre-aggregated stats for fast lookup.
```json
{
  "_id": "userId_month_year",
  "totalExpense": 5000,
  "topCategories": [
    { "name": "Rent", "amount": 2000 },
    { "name": "Food", "amount": 800 }
  ],
  "anomalies": []
}
```

## 4. API Design
**Protocol**: REST / JSON

### Endpoints
- `POST /reports` - Request a report generation (Async).
    - Returns `jobId`.
- `GET /reports` - List previous reports.
- `POST /ai/chat` - Send message to assistant.
- `POST /ai/categorize` - Predict category for a raw transaction description.

## 5. Business Logic & Workflows

### Report Generation (Async)
1. **Input**: Report Type, Date Range.
2. **Queue**: Push job to `reporting_queue`.
3. **Worker**:
    - Fetch raw data from **Ledger Service** (via API or Read Replica).
    - Aggregate and formatting (Puppeteer for PDF).
    - Upload to S3.
    - Update `generated_reports` status.
4. **Notify**: Send Event -> Notification Service emails user.

### Auto-Categorization
1. **Input**: "Starbucks #1234".
2. **Model**: Query local NLP model or vector DB.
3. **Output**: "Category: Coffee", "Confidence: 0.98".

## 6. Inter-Service Communication

### Inbound
- **Ledger Service**: Sends `transaction.created` events for real-time indexing.

### Outbound
- **Ledger Service**: Batch fetch for heavy reports.
- **S3**: Storage.

## 7. Scalability & Performance
- **Isolation**: Heavy reporting jobs run on separate worker nodes to avoid slowing down API.
- **Data Lake**: Periodically syncs Ledger data to a Data Warehouse (e.g., BigQuery) if scale demands.

## 8. Observability
- **Metrics**: `report_generation_duration_seconds`, `ai_model_latency`.

## 9. Testing Strategy
- **Unit**: Template rendering.
- **Integration**: End-to-End flow: Request Report -> Wait for Job -> Verify S3 URL.
