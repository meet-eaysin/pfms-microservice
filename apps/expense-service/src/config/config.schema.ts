import { z } from 'zod';

/**
 * Expense Service Configuration Schema
 * Service-specific environment variables
 */

export const ExpenseServiceConfigSchema = z.object({
  // Server
  SERVICE_NAME: z.string().default('expense-service'),
  SERVICE_PORT: z.coerce.number().default(3003),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (Expense Service has its own PostgreSQL)
  DATABASE_HOST: z.string().default('localhost'),
  DATABASE_PORT: z.coerce.number().default(5432),
  DATABASE_NAME: z.string().default('expense_db'),
  DATABASE_USER: z.string().default('postgres'),
  DATABASE_PASSWORD: z.string().default('postgres'),
  DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z
    .string()
    .transform((v: string) => v === 'true')
    .default('false'),

  // Redis (Shared cache)
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // RabbitMQ (Shared message bus)
  RABBITMQ_HOST: z.string().default('localhost'),
  RABBITMQ_PORT: z.coerce.number().default(5672),
  RABBITMQ_USER: z.string().default('guest'),
  RABBITMQ_PASSWORD: z.string().default('guest'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Feature flags
  ENABLE_SWAGGER: z
    .string()
    .transform((v: string) => v === 'true')
    .default('true'),
  ENABLE_METRICS: z
    .string()
    .transform((v: string) => v === 'true')
    .default('false'),
});

export type ExpenseServiceConfig = z.infer<typeof ExpenseServiceConfigSchema>;

/**
 * Load and validate expense service configuration
 */
export const loadExpenseServiceConfig = (): ExpenseServiceConfig => {
  try {
    return ExpenseServiceConfigSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      error.errors.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    }
    throw error;
  }
};

/**
 * Build PostgreSQL connection string
 */
export const buildDatabaseUrl = (config: ExpenseServiceConfig): string => {
  if (config.DATABASE_URL) {
    return config.DATABASE_URL;
  }

  const ssl = config.DATABASE_SSL ? '?sslmode=require' : '';
  return `postgresql://${config.DATABASE_USER}:${config.DATABASE_PASSWORD}@${config.DATABASE_HOST}:${config.DATABASE_PORT}/${config.DATABASE_NAME}${ssl}`;
};

/**
 * Build Prisma database URL for .env
 */
export const getPrismaDatabaseUrl = (config?: ExpenseServiceConfig): string => {
  const c = config || loadExpenseServiceConfig();
  return buildDatabaseUrl(c);
};
