# Notification Service Documentation

## 1. Service Overview
**Service Name**: `notification-service`
**Bounded Context**: Communication Infrastructure
**Responsibility**:
- Reliable delivery of messages via multiple channels (Email, SMS, Push).
- Template Management (HTML/Text).
- Delivery Status Tracking (Sent, Delivered, Failed, Bounced).
- User preferences enforcement (Do Not Disturb, Unsubscribe).

**Non-Responsibilities**:
- Deciding *when* to send a message (Business logic belongs in domain services).
- Managing User Profiles (Identity Service).

**Justification**:
Kept as a separate service to centralize the integration complexity of 3rd party providers (SendGrid, Twilio, FCM) and prevent "template sprawl" across the system. It acts as a "dumb pipe" with reliability guarantees.

## 2. Use Cases

### System
- **Send Transactional Email**: OTPs, Password Resets, Receipts.
- **Send Marketing Broadcast**: Newsletters (triggered by Admin).
- **Send Push Notification**: Real-time alerts (e.g., "Budget Exceeded").

### User
- **Unsubscribe**: Manage communication preferences (link in email).

## 3. Database Design
**Database**: PostgreSQL
**Schema**: `notifications`

### Core Tables

#### `templates`
Stores localized message formats.
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'welcome_email_v1'
    type VARCHAR(20) NOT NULL, -- email, sms, push
    subject_template TEXT,
    body_template TEXT NOT NULL, -- Handlebars/Mustache syntax
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `notification_logs`
Audit trail of all sent messages.
```sql
CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- Reference to Identity Service
    template_slug VARCHAR(100),
    channel VARCHAR(20) NOT NULL,
    recipient VARCHAR(255) NOT NULL, -- email or phone
    status VARCHAR(20) DEFAULT 'queued', -- queued, sent, delivered, failed
    provider_id VARCHAR(255), -- ID from SendGrid/Twilio
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Design
**Protocol**: gRPC (Internal) / REST (Admin)

### Internal API (gRPC)
Used by other microservices.
```protobuf
service NotificationService {
  rpc SendEmail (SendEmailRequest) returns (SendResponse);
  rpc SendSms (SendSmsRequest) returns (SendResponse);
  rpc SendPush (SendPushRequest) returns (SendResponse);
}
```

### Event Consumers
RabbitMQ Exchange: `global.events`
- `identity.user.registered` -> Sends Welcome Email (if configured).
- `finance.budget.exceeded` -> Sends Push Notification.

## 5. business Logic & Workflows

### Sending Flow
1. **Request**: Received via gRPC or Event.
2. **Preference Check**: Call Identity Service (or check local cache) to verify if user opted out of this `category`.
3. **Rendering**: Hydrate `template` with provided `data`.
4. **Dispatch**: Send to Provider (e.g., SendGrid).
5. **Logging**: Record result in `notification_logs`.

### Retry Policy
- **Transient Failures**: 3 retries (Exponential Backoff).
- **Permanent Failures**: Log error, alert admin if rate > 1%.

## 6. Inter-Service Communication

### Inbound
- **Identity Service**: Calls for OTPs.
- **Ledger Service**: Calls for Receipts.
- **Planning Service**: Calls for Alerts.

### Outbound
- **Identity Service**: To fetch email/phone if only `userId` is provided in an event.

## 7. Authentication & Security
- **Internal**: Mutual TLS (mTLS) or Private VPC for gRPC endpoints.
- **Secrets Management**: API Keys for Twilio/SendGrid stored in Vault/K8s Secrets. never in code.

## 8. Scalability & Performance
- **Queueing**: Uses a persistent queue (BullMQ/RabbitMQ) for all non-critical messages to handle bursts.
- **Priority**: OTPs get "High Priority" queue; Marketing gets "Low Priority".

## 9. Observability
- **Metrics**: `delivery_success_rate`, `provider_latency`.
- **Alerts**: "Email Bounce Rate > 5%", "SMS Credit Low".

## 10. Testing Strategy
- **Unit**: Template rendering.
- **Integration**: Mock 3rd Party Providers (do not send real emails in tests).
