import { z } from 'zod';

export const loggingSchema = z.object({
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_FORMAT: z.enum(['json', 'pretty', 'simple']).default('json'),
  LOG_OUTPUT: z.enum(['console', 'file', 'both']).default('console'),
  LOG_FILE_PATH: z.string().default('./logs/app.log'),
  LOG_FILE_MAX_SIZE: z.string().default('10m').describe('Max log file size before rotation'),
  LOG_FILE_MAX_FILES: z.coerce
    .number()
    .int()
    .positive()
    .default(14)
    .describe('Max number of rotated log files'),
  LOG_TIMESTAMP: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  LOG_CORRELATION_ID: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  LOG_REQUEST_BODY: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('false'),
  LOG_RESPONSE_BODY: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('false'),
  LOG_SENSITIVE_FIELDS: z
    .string()
    .default('password,token,secret,creditCard')
    .describe('Comma-separated field names to redact'),
  LOG_IGNORED_ROUTES: z
    .string()
    .default('/health,/metrics')
    .describe('Comma-separated routes to skip logging'),
  SENTRY_DSN: z.string().url().optional().describe('Sentry error tracking URL'),
  SENTRY_ENVIRONMENT: z.string().optional().describe('Sentry environment name'),
  SENTRY_TRACE_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.1),
});

export type LoggingConfig = z.infer<typeof loggingSchema>;
