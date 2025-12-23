import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Load and validate configuration from environment variables
 * @param schema Zod schema to validate against
 * @returns Validated configuration object
 */
export const loadConfig = <T extends z.ZodTypeAny>(schema: T): z.infer<T> => {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(formatted, null, 2));
    process.exit(1);
  }

  return result.data;
};
