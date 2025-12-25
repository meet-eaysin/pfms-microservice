# Identity Service Documentation

## 1. Service Overview
**Service Name**: `identity-service`
**Bounded Context**: Identity & Access Management (iam)
**Responsibility**:
- Authentication (Login, Register, MFA, SSO)
- User Identity (Profiles, KYC status, Security Settings)
- Session Management & Token Issuance
- Access Control (RBAC, Permissions)

**Non-Responsibilities**:
- Sending Emails/SMS (delegated to Notification Service)
- Financial Data (delegated to Ledger/Planning)
- Social Graphs/Groups (delegated to Social Finance)

**Justification**:
Consolidates `Auth Service` and `User Service` to eliminate the tight coupling between "Who I am" (Auth) and "Who I am" (Profile). Unifies the transaction boundary for account creation and security updates.

## 2. Use Cases

### User
- **Registration**: Sign up with Email/Password or OAuth (Google, Apple, Facebook).
- **Authentication**: Login, Refresh Token, Logout.
- **Security**: Enable/Disable MFA (TOTP/SMS), Change Password, Recover Account.
- **Profile**: View/Update Personal Details (Name, Avatar, Preferences).
- **Privacy**: Manage data visibility and marketing consents.

### Admin
- **User Management**: Ban/Unban users, Force password reset, View session history.
- **Role Management**: Assign roles (Support, Admin, User).

### System
- **Token Validation**: Internal endpoint/library for other services to validate JWTs.
- **Event Emission**: Broadcast `user.created`, `user.updated`, `user.banned`.

## 3. Database Design
**Database**: PostgreSQL
**Schema**: `identity`

### Core Tables

#### `users`
The root identity entity.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth users
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'user', -- RBAC: user, admin, support
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `profiles` (Formerly User Service)
1:1 relation with `users`. Stores non-auth identity data.
```sql
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}', -- Notification/UI prefs
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `oauth_links`
Supports multiple providers per user.
```sql
CREATE TABLE oauth_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- google, apple
    provider_sub VARCHAR(255) NOT NULL, -- Provider's unique ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_sub)
);
```

#### `sessions`
Active refresh tokens and device metadata.
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_fingerprint VARCHAR(255),
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. API Design
**Protocol**: REST / JSON
**Auth**: Bearer Token (JWT)

### Public Endpoints
- `POST /auth/register` - Create account
- `POST /auth/login` - Get Access/Refresh Pair
- `POST /auth/refresh` - Rotate tokens
- `POST /auth/logout` - Revoke session
- `POST /auth/password/reset` - Request reset link (Triggers Notification)

### Protected Endpoints
- `GET /me` - Get current user + profile
- `PATCH /me` - Update profile fields
- `POST /me/avatar` - Upload new avatar
- `PUT /me/security/mfa` - Enable/Disable MFA
- `GET /users/:id` - Public profile view (limited fields)

## 5. Business Logic & Workflows

### Registration Flow
1. **Input**: Email, Password, Name.
2. **Validation**: Check email uniqueness. Enforce password complexity.
3. **Transaction**:
    - Insert into `users`.
    - Insert into `profiles`.
    - Generate Verification Token.
4. **Event**: Emit `identity.user.registered` (Payload: userId, email, verificationToken).
5. **Side Effect**: Notification Service consumes event -> Sends Email.

### Login Flow
1. **Input**: Email, Password.
2. **Verification**: Verify hash with Argon2/Bcrypt. Check `is_active`.
3. **Token**: Issue JWT (Access) and Opaque Token (Refresh).
4. **Session**: Store Refresh hash in `sessions` table.

## 6. Inter-Service Communication

### Inbound
- **None**: Identity is a dependency, not a dependent.

### Outbound (Events)
RabbitMQ Exchange: `identity.events`
- `user.created`: Consumed by Planning (Create default budget), Social (Index for search).
- `user.updated`: Consumed by Cache invalidation.
- `user.deleted`: Consumed by ALL (GDPR cleanup).

### Synchronous
- **Notification Service**: REST/gRPC call for CRITICAL security alerts (MFA codes) to ensure delivery confirmation before UI response.

## 7. Authentication & Security
- **Integration**: `Better Auth` library.
- **Tokens**:
    - **Access Token**: JWT, 15min expiry. Contains `sub` (userId), `role`, `scopes`.
    - **Refresh Token**: High entropy string, 7-30 days expiry. DB backed.
- **Passwords**: Hashed with Argon2id.
- **MFA**: TOTP (Authenticator App) or SMS. Enforced for critical actions (Password Change).

## 8. Scalability & Performance
- **Read Heavy**: `/me` and profile fetches are 90% of traffic.
- **Caching**: Redis Cache for `users:{id}` and `sessions:{token}`.
- **Database**: Read Replicas for `profiles` queries.
- **Rate Limiting**: Strict limits on `/auth/login` and `/auth/register` to prevent abuse.

## 9. Observability
- **Metrics**: Login success/failure rate, Token issuance rate.
- **Logs**: Structured logs with `userId` and `requestId`. Audit log for all security modifications.
- **Alerts**: Spike in failed logins (Brute Force), Drop in registration success (System failure).

## 10. Testing Strategy
- **Unit**: Profile validation logic, Token generation.
- **Integration**: Auth flow with Refresh Token rotation. database constraints.
- **Contract**: Ensure JWT structure matches what API Gateway expects.
