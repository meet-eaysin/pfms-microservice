# User Service Documentation

## 1. Service Overview

**Service Name**: `user-service`
**Purpose**: Manages user profiles, preferences, settings, and family relationships.
**Responsibility**:

- User Profile Management (Avatar, Name, Demographics)
- Application Preferences (Theme, Language, Notifications)
- Financial Preferences (Currency, Risk Tolerance, Budget Limits)
- Family/Household Management (Invites, Roles)
  **Business Value**: Provides the personalization layer and context for all other financial services.
  **Scope**:
- **In Scope**: Profile data, Settings, Relationships.
- **Out of Scope**: Authentication credentials (managed by `auth-service`), specific financial transactions.

## 2. Functional Description

**Core Features**:

- CRUD for User Profiles.
- Fine-grained preference management (Financial vs Privacy vs System).
- Avatar upload and serving.
- Family Group management (separate from Social Finance groups).
  **Internal Responsibilities**:
- Listening to `user.created` to initialize default profiles.
- Validating profile updates.
  **Non-functional Expectations**:
- **Consistency**: High. Profile data is widely replicated/cached by other services.
- **Privacy**: Strict PII controls (GDPR/CCPA compliance features).

## 3. Database Design

**Database Type**: PostgreSQL (Primary) + Redis (Cache)

### Schema (Key Tables)

#### `user_profiles`

| Column       | Type    | Constraints | Description             |
| :----------- | :------ | :---------- | :---------------------- |
| `user_id`    | UUID    | PK, FK      | Links to Identity       |
| `first_name` | VARCHAR | NOT NULL    |                         |
| `last_name`  | VARCHAR |             |                         |
| `avatar_url` | VARCHAR |             | S3/CDN link             |
| `phone`      | VARCHAR |             | Optional                |
| `dob`        | DATE    |             | For planning/retirement |

#### `financial_preferences`

| Column              | Type    | Description       |
| :------------------ | :------ | :---------------- |
| `user_id`           | UUID    | PK, FK            |
| `base_currency`     | CHAR(3) | Default 'USD'     |
| `fiscal_year_start` | DATE    | Default Jan 1     |
| `risk_tolerance`    | ENUM    | Low, Medium, High |

#### `notification_settings`

| Column               | Type    | Description |
| :------------------- | :------ | :---------- |
| `user_id`            | UUID    | PK, FK      |
| `email_daily_digest` | BOOLEAN |             |
| `push_transactions`  | BOOLEAN |             |

#### `family_members`

| Column           | Type    | Description         |
| :--------------- | :------ | :------------------ |
| `head_user_id`   | UUID    | PK, FK              |
| `member_user_id` | UUID    | PK, FK              |
| `relationship`   | VARCHAR | Spouse, Child, etc. |

**Data Lifecycle**: Created on registration. Updates frequent. Deleted on account removal.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to update my avatar."
- "As a user, I want to change my reporting currency to EUR."
- "As a user, I want to add my spouse to my account."
  **System-Driven**:
- "Notify other services when user currency changes (to trigger conversion)."
  **Edge Cases**:
- User updates profile while a report is generating.
- Family member deletes account (Cascade remove from family).

## 5. API Design (Port 3002)

### Profile

#### Get Profile

**Endpoint**: `GET /api/v1/user/profile`

- **Auth**: Bearer Token
- **Response (200)**:
  ```json
  {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "currency": "USD"
  }
  ```

#### Update Profile

**Endpoint**: `PUT /api/v1/user/profile`

- **Body**: `{ "firstName": "Johnny", "phone": "+1234567890" }`
- **Response**: Updated profile object.

#### Upload Avatar

**Endpoint**: `POST /api/v1/user/profile/avatar`

- **Req**: Multipart Form Data (Image)
- **Response**: `{ "url": "https://cdn.pfms.com/..." }`

### Preferences

#### Get Financial Settings

**Endpoint**: `GET /api/v1/user/preferences/financial`

- **Response**: `{ "currency": "USD", "riskTolerance": "Medium" }`

#### Update Financial Settings

**Endpoint**: `PUT /api/v1/user/preferences/financial`

- **Body**: `{ "currency": "EUR" }`
- **Events**: `user.preferences.updated`

### Family

#### List Family

**Endpoint**: `GET /api/v1/user/family`

- **Response**: `{ "members": [...] }`

#### Invite Member

**Endpoint**: `POST /api/v1/user/family/invite`

- **Body**: `{ "email": "spouse@example.com", "relationship": "POUSE" }`
- **Response**: `{ "status": "invited" }`

## 6. Inter-Service Communication

**Calls**:

- `notification-service`: To send family invites.
  **Called By**:
- `ledger-service`: To get User Currency for reports.
- `investment-service`: To get Risk Tolerance for advice.
  **Events Published**:
- `user.updated` (RabbitMQ): Significant profile changes.
- `user.preferences.updated`: Specifically for changes affective calculation logic (Currency, Timezone).
  **Subscribed Events**:
- `auth.user.created`: Triggers creation of default profile and settings entries.

## 7. Third-Party Dependencies

1.  **S3 / MinIO/ R2**:
    - **Purpose**: Storing User Avatars.
    - **Access**: Signed URLs or presigned uploads.
    - **Failure**: Feature degraded (no avatar), core flow works.

## 8. Security Considerations

- **Authorization**: Users can only edit THEIR own profile (or Family Head depending on rules).
- **PII**: Profile data contains PII. Access must be logged.
- **Input Validation**: Strict sanitization on string inputs (Name, Bio).
- **File Uploads**: Validate mime-types and size for avatars.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `AWS_ACCESS_KEY_ID` / `SECRET` / `BUCKET`: Object Storage.
- `RABBITMQ_URL`: Event bus.

## 10. Observability & Monitoring

- **Metrics**:
  - `user_profile_update_total`
  - `user_avatar_upload_size_bytes`
- **Logs**: Audit trail of profile changes (Who changed what when).

## 11. Error Handling & Edge Cases

- **Profile Not Found**: Should technically never happen for valid tokens, but handle with 404.
- **Concurrency**: Optimistic locking if two devices edit profile simultaneously.

## 12. Assumptions & Open Questions

- **Assumption**: `auth-service` passes the User ID in the token, which `user-service` trusts.
- **Open**: How do we handle "Family View" across services? Does `user-service` just link IDs, or does it enforce permissions? (Assuming assume linking only for now).
