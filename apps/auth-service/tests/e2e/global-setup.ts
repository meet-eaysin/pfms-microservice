import * as dotenv from 'dotenv';
import * as path from 'path';

/**
 * Global Setup for E2E Tests
 * Runs once before all e2e tests
 */
export default async function globalSetup() {
  const envPath = path.resolve(__dirname, '../../.env.test');
  dotenv.config({ path: envPath });

  console.log('E2E tests setup complete');
}
