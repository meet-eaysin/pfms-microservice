import { z } from 'zod';

/**
 * Environment variable schema for PFMS services
 * Provides type-safe environment configuration with runtime validation
 */
export const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  SERVICE_NAME: z.string().optional(),
  SERVICE_PORT: z.coerce.number().int().positive().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Database
  DATABASE_URL: z.string().url().optional(),
  DATABASE_HOST: z.string().optional(),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_NAME: z.string().optional(),
  DATABASE_USER: z.string().optional(),
  DATABASE_PASSWORD: z.string().optional(),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().min(16).optional(),
  REDIS_DB: z.coerce.number().int().min(0).default(0),

  // RabbitMQ
  RABBITMQ_HOST: z.string().default('localhost'),
  RABBITMQ_PORT: z.coerce.number().int().positive().default(5672),
  RABBITMQ_USER: z.string().optional(),
  RABBITMQ_PASSWORD: z.string().min(16).optional(),

  // JWT
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRY: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('*'),

  // Feature Flags
  ENABLE_SWAGGER: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('false'),
  ENABLE_METRICS: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default('true'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables against the schema
 * @throws {Error} If validation fails with detailed error messages
 * @returns {Env} Validated and typed environment variables
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error('');

    const formatted = result.error.format();
    Object.entries(formatted).forEach(([key, value]) => {
      if (key !== '_errors' && value && typeof value === 'object') {
        const errors = (value as any)._errors;
        if (errors && errors.length > 0) {
          console.error(`  ${key}:`);
          errors.forEach((error: string) => {
            console.error(`    - ${error}`);
          });
        }
      }
    });

    console.error('');
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  return result.data;
}

/**
 * Validates environment variables and returns them, or undefined if validation fails
 * Useful for optional validation scenarios
 */
export function tryValidateEnv(): Env | undefined {
  const result = envSchema.safeParse(process.env);
  return result.success ? result.data : undefined;
}

/**
 * Gets a specific environment variable with type safety
 * @param key - The environment variable key
 * @returns The value if it exists, undefined otherwise
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] | undefined {
  const env = tryValidateEnv();
  return env?.[key];
}

/**
 * Checks if all required environment variables are set
 * @param required - Array of required environment variable keys
 * @returns true if all required variables are set, false otherwise
 */
export function checkRequiredEnv(required: (keyof Env)[]): boolean {
  const env = tryValidateEnv();
  if (!env) return false;

  return required.every((key) => {
    const value = env[key];
    return value !== undefined && value !== '';
  });
}
