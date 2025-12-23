import { z } from 'zod';

export const rabbitmqSchema = z.object({
  RABBITMQ_URL: z.string().url().optional().describe('RabbitMQ connection URL'),
  RABBITMQ_HOST: z.string().default('localhost'),
  RABBITMQ_PORT: z.coerce.number().int().positive().default(5672),
  RABBITMQ_USER: z.string().default('guest'),
  RABBITMQ_PASSWORD: z.string().default('guest'),
  RABBITMQ_VHOST: z.string().default('/'),
  RABBITMQ_PROTOCOL: z.enum(['amqp', 'amqps']).default('amqp'),
  RABBITMQ_PREFETCH_COUNT: z.coerce
    .number()
    .int()
    .positive()
    .default(10)
    .describe('Consumer prefetch count'),
  RABBITMQ_HEARTBEAT: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(60)
    .describe('Heartbeat interval in seconds'),
  RABBITMQ_CONNECTION_TIMEOUT: z.coerce.number().int().positive().default(30000),
  RABBITMQ_SOCKET_TIMEOUT: z.coerce.number().int().positive().default(30000),
  RABBITMQ_MAX_RETRIES: z.coerce.number().int().nonnegative().default(5),
  RABBITMQ_RETRY_DELAY: z.coerce
    .number()
    .int()
    .positive()
    .default(1000)
    .describe('Retry delay in milliseconds'),
  RABBITMQ_QUEUE_DURABLE: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  RABBITMQ_QUEUE_AUTO_DELETE: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('false'),
  RABBITMQ_QUEUE_TTL: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Queue message TTL in milliseconds'),
  RABBITMQ_QUEUE_MAX_LENGTH: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .describe('Max messages in queue'),
});

export type RabbitMQConfig = z.infer<typeof rabbitmqSchema>;
