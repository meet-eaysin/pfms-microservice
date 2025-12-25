# Report Service Documentation

## 1. Service Overview

**Service Name**: `report-service`
**Purpose**: Generates static, formatted documents (PDF, Excel, CSV) from financial data.
**Responsibility**:

- Compiling data from multiple services.
- Rendering visual reports (Charts, Tables).
- Exporting data for portability.
  **Business Value**: Essential for "Hard Copy" records, Tax filing, and deep offline analysis.
  **Scope**:
- **In Scope**: Document generation, Storage of generated files, Download links.
- **Out of Scope**: Interactive dashboards (UI handles that).

## 2. Functional Description

**Core Features**:

- Monthly Statements (PDF).
- Tax Reports (Excel).
- Full Data Export (JSON/CSV).
  **Internal Responsibilities**:
- Async Job Queue for long-running generation tasks.
- Uploading artifacts to S3.
  **Non-functional Expectations**:
- **Latency**: High (Seconds to Minutes). Must be async.

## 3. Database Design

**Database Type**: PostgreSQL

### Schema (Key Tables)

#### `report_jobs`

| Column       | Type      | Description                            |
| :----------- | :-------- | :------------------------------------- |
| `id`         | UUID      | PK                                     |
| `user_id`    | UUID      | FK                                     |
| `type`       | ENUM      | STATEMENT, TAX, EXPORT                 |
| `parameters` | JSONB     | Date range, filters                    |
| `status`     | ENUM      | PENDING, PROCESSING, COMPLETED, FAILED |
| `file_url`   | VARCHAR   | S3 Link                                |
| `created_at` | TIMESTAMP |                                        |

**Data Lifecycle**: Generated files retained for 30 days then expiry (configurable).
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want a PDF statement of last month's expenses."
- "As a user, I want to download all my data to leave the platform (GDPR)."
  **System-Driven**:
- "Generate Annual Tax Summary on Jan 1st."
  **Edge Cases**:
- Report too large (Memory limit).

## 5. API Design (Port 3012)

### Jobs

#### Create Report Job

**Endpoint**: `POST /api/v1/reports`

- **Body**:
  ```json
  {
    "type": "MONTHLY_STATEMENT",
    "format": "PDF",
    "year": 2024,
    "month": 1
  }
  ```
- **Response**: `{ "jobId": "...", "status": "PENDING" }`

#### Get Job Status

**Endpoint**: `GET /api/v1/reports/:id`

- **Response**: `{ "status": "COMPLETED", "downloadUrl": "https://..." }`

### Templates

#### List Templates

**Endpoint**: `GET /api/v1/reports/templates`

## 6. Inter-Service Communication

**Calls**:

- `ledger-service`: Fetch expenses/income.
- `investment-service`: Fetch portfolio summary.
- `user-service`: Fetch profile details for header.
  **Called By**:
- **API Gateway**
  **Events Published**:
- `report.completed`:
  - `notification-service`: Email user "Your report is ready".

## 7. Third-Party Dependencies

1.  **Puppeteer / PDFKit**: Rendering PDFs.
2.  **ExcelJS**: Generating Spreadsheets.
3.  **S3**: File Storage.

## 8. Security Considerations

- **Access Control**: Signed URLs for downloads. Files are private.
- **Encryption**: S3 Server-Side Encryption.

## 9. Configuration & Environment

- `AWS_BUCKET`, `AWS_REGION`.
- `RABBITMQ_URL`.

## 10. Observability & Monitoring

- **Metrics**:
  - `reports_generated_total`
  - `report_generation_duration_seconds`
- **Logs**: Failure reasons (e.g., Timeout).

## 11. Error Handling & Edge Cases

- **Timeout**: If data gathering takes too long, fail job and notify admin.

## 12. Assumptions & Open Questions

- **Assumption**: We pull data via API calls (might be slow). Optimally, we might query a data warehouse if implemented later.
