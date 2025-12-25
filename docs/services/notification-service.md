# Notification Service Documentation

## 1. Service Overview

**Service Name**: `notification-service`
**Purpose**: Centralized communication hub for delivering messages to users.
**Responsibility**:

- Delivery via Email, SMS, Push (FCM/APNS).
- Template Rendering (Handlebars/Mustache).
- Preference Enforcement (Do Not Disturb, Opt-outs).
- Rate Limiting (Anti-spam).
  **Business Value**: Keeps users engaged and informed without cluttering other services with email provider logic.
  **Scope**:
- **In Scope**: Delivery, status tracking, templates.
- **Out of Scope**: Content logic (The _what_ is decided by other services, this service handles _how_).

## 2. Functional Description

**Core Features**:

- Unified Send API.
- Provider Abstraction (Switch between SendGrid/SES/Mailgun).
- Device Token Management.
  **Internal Responsibilities**:
- Queueing messages for reliable delivery.
- Handling Webhooks (Bounces, Deliveries).
  **Non-functional Expectations**:
- **Reliability**: Messages must not be lost. Dead Letter Queues required.
- **Latency**: Async delivery is acceptable (< 1 min).

## 3. Database Design

**Database Type**: PostgreSQL

### Schema (Key Tables)

#### `notifications`

| Column    | Type      | Description                |
| :-------- | :-------- | :------------------------- |
| `id`      | UUID      | PK                         |
| `user_id` | UUID      | FK                         |
| `type`    | VARCHAR   | "ALERT", "DIGEST"          |
| `channel` | ENUM      | EMAIL, SMS, PUSH           |
| `status`  | ENUM      | QUEUED, SENT, FAILED, READ |
| `sent_at` | TIMESTAMP |                            |

#### `user_devices`

| Column     | Type    | Description   |
| :--------- | :------ | :------------ |
| `user_id`  | UUID    | FK            |
| `token`    | VARCHAR | FCM Token     |
| `platform` | VARCHAR | iOS / Android |

#### `templates`

| Column      | Type    | Description         |
| :---------- | :------ | :------------------ |
| `slug`      | VARCHAR | PK, "welcome-email" |
| `subject`   | VARCHAR |                     |
| `body_html` | TEXT    |                     |
| `body_text` | TEXT    |                     |

**Data Lifecycle**: Notification log retained for 90 days.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to unsubscribe from marketing emails but keep transactional ones."
  **System-Driven**:
- "Auth Service requests 'Welcome Email' on registration."
- "Planning Service requests 'Budget Alert' push notification."
  **Edge Cases**:
- Invalid email address (Bounce).
- User has no registered devices for Push.

## 5. API Design (Port 3010)

### Send

#### Send Notification (Internal)

**Endpoint**: `POST /api/v1/notifications/send`

- **Auth**: Service-to-Service Only
- **Body**:
  ```json
  {
    "userId": "uuid",
    "type": "welcome_email",
    "channels": ["EMAIL"],
    "data": { "name": "John" }
  }
  ```
- **Response**: `{ "id": "task_uuid" }`

### App API

#### List Notifications

**Endpoint**: `GET /api/v1/notifications`

- **Query**: `read=false`
- **Response**: `{ "notifications": [...] }`

#### Mark Read

**Endpoint**: `PATCH /api/v1/notifications/:id/read`

#### Register Device

**Endpoint**: `POST /api/v1/notifications/push/register`

- **Body**: `{ "token": "...", "platform": "android" }`

## 6. Inter-Service Communication

**Calls**:

- External Providers (SendGrid, Twilio, Firebase).
  **Called By**:
- All Services (Auth, Planning, Layer).
  **Events Published**:
- `notification.failed`: Log error.
  **Subscribed Events**:
- `user.created`: Send Welcome Email.
- `budget.exceeded`: Send Alert.

## 7. Third-Party Dependencies

1.  **Nodemailer / SES / SendGrid**: Email.
2.  **Firebase Cloud Messaging (FCM)**: Push.
3.  **Twilio**: SMS.
    - **Auth**: API Keys via ENV.
    - **Rate Limits**: Respect provider limits.

## 8. Security Considerations

- **Sanitization**: Prevent HTML injection in templates.
- **Access**: User must only list their own notifications.

## 9. Configuration & Environment

- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`.
- `FCM_SERVER_KEY`.

## 10. Observability & Monitoring

- **Metrics**:
  - `notifications_sent_total{method="email", status="success"}`
- **Logs**: Delivery confirmation logs.

## 11. Error Handling & Edge Cases

- **Provider Down**: Retry 3 times, then Fail.

## 12. Assumptions & Open Questions

- **Assumption**: We store user preferences in `user-service`, but `notification-service` fetches/caches them or receives them in payload.
