import { DeviceInfo } from '../value-objects/device-info';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: string,
    public readonly isVerified: boolean,
    public readonly mfaEnabled: boolean,
    public readonly createdAt: Date,
    public readonly passwordHash?: string | null, // Optional for OAuth users
    public readonly mfaSecret?: string | null,
  ) {}
}

export class Session {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly refreshToken: string,
    public readonly expiresAt: Date,
    public readonly deviceInfo?: DeviceInfo | null,
  ) {}
}

export class OAuthAccount {
  constructor(
    public readonly providerId: string,
    public readonly providerUserId: string,
    public readonly userId: string,
  ) {}
}
