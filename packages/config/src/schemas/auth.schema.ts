import { z } from 'zod';

export const authSchema = z.object({
  // Better-auth configuration
  BETTER_AUTH_SECRET: z
    .string()
    .min(32)
    .optional()
    .describe('Better-auth secret for CSRF and encryption'),
  BETTER_AUTH_DATABASE_URL: z
    .string()
    .url()
    .optional()
    .describe('Database URL for better-auth (defaults to DATABASE_URL)'),
  BETTER_AUTH_COOKIE_NAME: z.string().default('better-auth-session'),
  BETTER_AUTH_COOKIE_SECURE: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  BETTER_AUTH_COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  BETTER_AUTH_COOKIE_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .default(2592000)
    .describe('30 days in seconds'),

  // OAuth providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URI: z.string().url().optional(),

  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  APPLE_REDIRECT_URI: z.string().url().optional(),

  // Email verification
  EMAIL_VERIFICATION_ENABLED: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  EMAIL_VERIFICATION_EXPIRY: z.coerce
    .number()
    .int()
    .positive()
    .default(3600)
    .describe('1 hour in seconds'),

  // Password policy
  PASSWORD_MIN_LENGTH: z.coerce.number().int().min(6).default(8),
  PASSWORD_REQUIRE_UPPERCASE: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  PASSWORD_REQUIRE_LOWERCASE: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  PASSWORD_REQUIRE_NUMBERS: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  PASSWORD_REQUIRE_SPECIAL: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  PASSWORD_EXPIRY_DAYS: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Days before password expires'),

  // MFA
  MFA_ENABLED: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('false'),
  MFA_TOTP_ISSUER: z.string().default('PFMS'),
  MFA_BACKUP_CODES_COUNT: z.coerce.number().int().positive().default(10),

  // Account lockout
  ACCOUNT_LOCKOUT_ENABLED: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  ACCOUNT_LOCKOUT_ATTEMPTS: z.coerce.number().int().positive().default(5),
  ACCOUNT_LOCKOUT_DURATION_MINUTES: z.coerce.number().int().positive().default(15),

  // Session
  SESSION_ABSOLUTE_TIMEOUT_HOURS: z.coerce.number().int().positive().default(24),
  SESSION_IDLE_TIMEOUT_HOURS: z.coerce.number().int().positive().default(2),
  SESSION_SLIDING_WINDOW: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),

  // Device tracking
  DEVICE_TRACKING_ENABLED: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  DEVICE_FINGERPRINT_ENABLED: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('false'),
});

export type AuthConfig = z.infer<typeof authSchema>;
