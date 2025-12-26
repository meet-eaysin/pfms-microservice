# Auth Service Documentation

## 1. Service Overview

**Service Name**: `auth-service`
**Purpose**: Manages user authentication, session handling, and security credentials using `better-auth`.
**Responsibility**:

- User Registration & Login (Email/Password & OAuth)
- Multi-Factor Authentication (MFA/2FA)
- Session Management (Database-backed sessions)
- OAuth Integration (Google, GitHub, Apple)
- Password Management (Reset, Change)
- Email Verification
  **Business Value**: Secure foundation for the platform, ensuring only authorized access to financial data.
  **Scope**:
- **In Scope**: Credentials, Sessions, MFA, Social Logins, Email Verification.
- **Out of Scope**: User Profiles (names, addresses) - handled by `user-service`.

## 2. Functional Description

**Core Features (via `better-auth`)**:

- **Plugin-based Architecture**: Extensible auth system.
- **Secure Password Hashing**: Managed by `better-auth` (Argon2).
- **Session Management**: Persistent sessions stored in PostgreSQL.
- **Multi-Factor Authentication**: TOTP support.
- **Social Auth**: Native support for Google, GitHub, and Apple.
- **Email Verification**: Built-in flow for account verification.
  **Internal Responsibilities**:
- Configuring `better-auth` instance and plugins.
- Interfacing with PostgreSQL for auth data storage.
- Publishing events (e.g., `user.created`) to the Event Bus.
  **Non-functional Expectations**:
- **Latency**: < 100ms for session validation.
- **Reliability**: 99.99% availability (Critical Path).
- **Scalability**: Horizontally scalable; session state persisted in DB.

## 3. Database Design

**Database Type**: PostgreSQL (Primary) + Redis (Cache/Rate Limiting)

### Schema (Better Auth Tables)

#### `user`

| Column          | Type      | Constraints      | Description               |
| :-------------- | :-------- | :--------------- | :------------------------ |
| `id`            | TEXT      | PK               | Unique User ID            |
| `email`         | TEXT      | UNIQUE, NOT NULL | User's primary email      |
| `name`          | TEXT      | NOT NULL         | Display Name              |
| `emailVerified` | BOOLEAN   | DEFAULT FALSE    | Email verification status |
| `image`         | TEXT      | NULLABLE         | Profile image URL         |
| `createdAt`     | TIMESTAMP | DEFAULT NOW()    | Creation timestamp        |
| `updatedAt`     | TIMESTAMP | DEFAULT NOW()    | Update timestamp          |

#### `session`

| Column      | Type      | Description          |
| :---------- | :-------- | :------------------- |
| `id`        | TEXT      | Session ID           |
| `userId`    | TEXT      | FK -> user.id        |
| `token`     | TEXT      | Unique session token |
| `expiresAt` | TIMESTAMP | Expiration timestamp |
| `ipAddress` | TEXT      | Client IP            |
| `userAgent` | TEXT      | Client User Agent    |

#### `account`

| Column                 | Type      | Description               |
| :--------------------- | :-------- | :------------------------ |
| `id`                   | TEXT      | ID                        |
| `userId`               | TEXT      | FK -> user.id             |
| `accountId`            | TEXT      | Provider-specific User ID |
| `providerId`           | TEXT      | e.g., "google", "github"  |
| `accessToken`          | TEXT      | OAuth Access Token        |
| `refreshToken`         | TEXT      | OAuth Refresh Token       |
| `accessTokenExpiresAt` | TIMESTAMP | Token Expiry              |

#### `verification`

| Column       | Type      | Description             |
| :----------- | :-------- | :---------------------- |
| `id`         | TEXT      | ID                      |
| `identifier` | TEXT      | email or phone          |
| `value`      | TEXT      | verification token/code |
| `expiresAt`  | TIMESTAMP | Expiry                  |

**Data Lifecycle**: Managed by `better-auth` and Prisma.
**Migration Strategy**: Prisma Migrations.

## 4. Use Cases

**User-Driven**:

- "As a user, I want to sign up with email/password or Google."
- "As a user, I want to verify my email before accessing certain features."
- "As a user, I want to enable 2FA for extra security."
  **System-Driven**:
- "Revoke all sessions when password is changed."
- "Cleanup expired verification tokens automatically."
  **Edge Cases**:
- Social login account linking (same email).
- Session hijacking prevention (IP/UA tracking).

## 5. API Design (Port 3001)

`better-auth` endpoints are typically prefixed with `/api/auth` (configurable).

### Authentication Endpoints

- `POST /api/auth/signup/email`: Register with email/password.
- `POST /api/auth/signin/email`: Login with email/password.
- `GET /api/auth/signin/:provider`: Initiate OAuth flow (Google/Github).
- `POST /api/auth/signout`: Terminate session.
- `GET /api/auth/get-session`: Retrieve current session and user info.

### Account Management

- `POST /api/auth/change-password`: Update password.
- `POST /api/auth/forget-password`: Request reset link.
- `POST /api/auth/reset-password`: Reset password with token.
- `POST /api/auth/verify-email`: Verify email with token.

### MFA

- `POST /api/auth/two-factor/enable`: Enable MFA.
- `POST /api/auth/two-factor/verify`: Verify MFA code.

## 6. Inter-Service Communication

**Calls**:

- `notification-service` (Async/Event): To send verification emails and reset links.
- `user-service` (Async/Event): To sync basic profile data.

**Called By**:

- **API Gateway**: Routes all `/api/auth/*` traffic.
- **Other Services**: Validate sessions via `better-auth` client or middleware.

**Events Published**:

- `user.created`: Triggered on successful registration.
- `session.created`: Security audit logs.
- `password.reset`: Security notification.

## 7. Third-Party Dependencies

1. **OAuth Providers**: Google, GitHub, Apple.
2. **PostgreSQL**: Persistence for all auth data.
3. **Redis**: Caching and potential rate limiting.

## 8. Security Considerations

- **Password Hashing**: Argon2 (managed by `better-auth`).
- **CSRF Protection**: Built-in to `better-auth`.
- **Session Security**: HttpOnly, Secure, SameSite cookies.
- **Rate Limiting**: Applied to sensitive endpoints (login, forgot-password).

## 9. Configuration & Environment

Configuration is managed via `@pfms/config` and the `AuthService` Config.

- `BETTER_AUTH_SECRET`: Used for encryption and CSRF.
- `BETTER_AUTH_DATABASE_URL`: Connection string for auth tables.
- `BETTER_AUTH_COOKIE_NAME`: Default `better-auth-session`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: OAuth.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: OAuth.

## 10. Observability & Monitoring

- **Logs**: Winston/Pino integration.
- **Metrics**: Authentication success/failure rates.
- **Health**: `/health` checks DB connectivity.

## 11. Error Handling

- **401 Unauthorized**: Invalid credentials or expired session.
- **403 Forbidden**: Invalid verification token or MFA required.
- **422 Unprocessable Entity**: Validation errors (e.g., weak password).

## 12. Assumptions & Open Questions

- **Assumption**: `better-auth` is the source of truth for all authentication logic.
- **Assumption**: The `user-service` handles extended profile data (address, etc.) while `auth-service` handles core credentials.
