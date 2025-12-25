# Auth Service Documentation

## 1. Service Overview

**Service Name**: `auth-service`
**Purpose**: Manages user authentication, session handling, and security credentials.
**Responsibility**:

- User Registration & Login
- Multi-Factor Authentication (MFA)
- Session Management (Refresh Tokens, Device tracking)
- OAuth Integration (Google, Facebook, Apple)
- Password Management (Reset, Change)
  **Business Value**: secure foundation for the platform, ensuring only authorized access to financial data.
  **Scope**:
- **In Scope**: Credentials, Tokens, Sessions, MFA, 3rd Party Logins.
- **Out of Scope**: User Profiles (names, addresses) - handled by `user-service`.

## 2. Functional Description

**Core Features**:

- JWT-based Stateless Authentication (Access/Refresh Token pattern).
- Secure Password Hashing (Argon2 or similar via `better-auth`).
- Time-based One-Time Password (TOTP) for MFA.
- Device fingerprinting and session revocation.
- Role-Based Access Control (RBAC) token claims.
  **Internal Responsibilities**:
- Validating credentials against encrypted storage.
- Issuing and Verifying JSON Web Tokens (JWT).
- Interfacing with Email Service for verification/reset links.
  **Non-functional Expectations**:
- **Latency**: < 100ms for login/token refresh.
- **Reliability**: 99.99% availability (Critical Path).
- **Scalability**: Stateless apart from Redis session cache; horizontally scalable.

## 3. Database Design

**Database Type**: PostgreSQL (Primary) + Redis (Session Cache)

### Schema (Key Tables)

#### `users`

| Column          | Type      | Constraints      | Description                    |
| :-------------- | :-------- | :--------------- | :----------------------------- |
| `id`            | UUID      | PK               | Unique User ID                 |
| `email`         | VARCHAR   | UNIQUE, NOT NULL | User's primary email           |
| `password_hash` | VARCHAR   | NULLABLE         | Null if external provider only |
| `role`          | VARCHAR   | DEFAULT 'user'   | Authorization Scope            |
| `is_verified`   | BOOLEAN   | DEFAULT FALSE    | Email verification status      |
| `mfa_enabled`   | BOOLEAN   | DEFAULT FALSE    | MFA status flag                |
| `created_at`    | TIMESTAMP | DEFAULT NOW()    | Timestamp                      |

#### `sessions` (Redis / DB Fallback)

| Column          | Type      | Description               |
| :-------------- | :-------- | :------------------------ |
| `id`            | UUID      | Session ID                |
| `user_id`       | UUID      | FK -> users.id            |
| `refresh_token` | TEXT      | Hashed token for rotation |
| `device_info`   | JSONB     | User Agent, IP            |
| `expires_at`    | TIMESTAMP | TTL                       |

#### `oauth_accounts`

| Column             | Type    | Description               |
| :----------------- | :------ | :------------------------ |
| `provider_id`      | VARCHAR | e.g. "google", "facebook" |
| `provider_user_id` | VARCHAR | External ID               |
| `user_id`          | UUID    | FK -> users.id            |

**Data Lifecycle**: Users created on register. Soft-deleted on account closure (compliance retention may apply).
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to sign up with email/password."
- "As a user, I want to enable 2FA for extra security."
- "As a user, I want to see all devices logged into my account."
  **System-Driven**:
- "Revoke session when password is changed."
- "Lock account after 5 failed login attempts."
  **Edge Cases**:
- Token expiry during active usage (Auto-refresh).
- OAuth provider downtime.

## 5. API Design (Port 3001)

### Authentication

#### Register

**Endpoint**: `POST /api/v1/auth/register`

- **Auth**: Public
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response (201)**:
  ```json
  {
    "user": { "id": "uuid", "email": "..." },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
  ```
- **Validation**: Email format, Password complexity.

#### Login

**Endpoint**: `POST /api/v1/auth/login`

- **Auth**: Public
- **Body**: `{ "email": "...", "password": "..." }`
- **Response (200)**: `{ "user": ..., "accessToken": ..., "refreshToken": ... }`
- **Error (401)**: `{ "message": "Invalid credentials" }`

#### Logout

**Endpoint**: `POST /api/v1/auth/logout`

- **Auth**: Bearer Token
- **Response (200)**: `{ "success": true }`

#### Refresh Token

**Endpoint**: `POST /api/v1/auth/refresh`

- **Auth**: Public (Cookie/Body)
- **Body**: `{ "refreshToken": "..." }`
- **Response (200)**: `{ "accessToken": "new...", "refreshToken": "new..." }`

### Password Management

#### Forgot Password

**Endpoint**: `POST /api/v1/auth/forgot-password`

- **Body**: `{ "email": "..." }`
- **Response (200)**: `{ "message": "If email exists, link sent." }`

#### Reset Password

**Endpoint**: `POST /api/v1/auth/reset-password`

- **Body**: `{ "token": "...", "newPassword": "..." }`
- **Response**: `{ "success": true }`

### MFA

#### Enable MFA

**Endpoint**: `POST /api/v1/auth/mfa/enable`

- **Auth**: Bearer Token
- **Body**: `{ "method": "totp" }`
- **Response**: `{ "secret": "...", "qrCode": "data:image..." }`

#### Verify MFA

**Endpoint**: `POST /api/v1/auth/mfa/verify`

- **Body**: `{ "code": "123456" }`
- **Response**: `{ "verified": true, "backupCodes": [...] }`

## 6. Inter-Service Communication

**Calls**:

- `notification-service` (Async/Event): To send verification emails, password reset links.
- `user-service` (Sync/Event): To create initial profile (Name, Preferences) on registration.
  **Called By**:
- **API Gateway**: All auth traffic.
- All Services: Validate tokens (via library/middleware, not direct API call ideally, but `auth-service` generates the keys).
  **Events Published**:
- `user.created` (RabbitMQ): Trigger profile creation, welcome email.
- `user.login`: Security audit.
- `user.password_changed`: Revoke other sessions.

## 7. Third-Party Dependencies

1.  **Google/Facebook/Apple IDs**:
    - **Purpose**: OAuth Sign-in.
    - **Auth**: Client ID/Secret.
    - **Failure**: Fallback to email/pass.
2.  **Redis**:
    - **Purpose**: Session storage.
    - **Security**: Internal VPC only.

## 8. Security Considerations

- **Passwords**: Never stored plain. Hashed with Salt.
- **Tokens**: Short-lived Access Tokens (15m), Long-lived Refresh Tokens (7d).
- **MFA**: Encouraged/Enforced for critical actions.
- **Rate Limiting**: Aggressive on Login/Register endpoints to prevent brute-force (implemented at Gateway or Service middleware).
- **Secrets**: Stored in Vault/Env Vars.

## 9. Configuration & Environment

- `DATABASE_URL`: Postgres.
- `REDIS_URL`: Session store.
- `JWT_SECRET` / `JWT_PUBLIC_KEY`: Token signing.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth.
- `FRONTEND_URL`: For callback redirects.

## 10. Observability & Monitoring

- **Logs**: JSON format (Pino). Log Login Success/Failure (exclude PII/Passwords).
- **Metrics**:
  - `auth_login_total{status="success|failure"}`
  - `auth_register_total`
- **Health Check**: `/health` endpoint checks DB and Redis connectivity.

## 11. Error Handling & Edge Cases

- **Invalid Token**: 401 Unauthorized.
- **Expired Token**: 401 (Client must call Refresh).
- **Account Locked**: 403 Forbidden.
- **DB Down**: 500 Internal Server Error (Retry safe for reads).

## 12. Assumptions & Open Questions

- **Assumption**: `better-auth` handles the complexity of OAuth flow and session management.
- **Open**: Do we strictly enforce email verification before allowing login? (Currently assumed Yes).
