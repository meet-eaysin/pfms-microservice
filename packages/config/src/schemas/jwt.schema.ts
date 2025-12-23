import { z } from 'zod';

export const jwtSchema = z.object({
  JWT_SECRET: z.string().min(32).describe('JWT secret key for signing tokens'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .optional()
    .describe('JWT refresh secret (defaults to JWT_SECRET)'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m').describe('Access token expiration'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d').describe('Refresh token expiration'),
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512']).default('HS256'),
  JWT_ISSUER: z.string().default('pfms').describe('JWT issuer claim'),
  JWT_AUDIENCE: z.string().optional().describe('JWT audience claim'),
  JWT_ENABLE_SIGNING: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  JWT_VERIFY_SIGNATURE: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  JWT_CLOCK_TOLERANCE: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(0)
    .describe('Clock tolerance in seconds'),
  JWT_MAX_AGE: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Max age for tokens in seconds'),
});

export type JWTConfig = z.infer<typeof jwtSchema>;
