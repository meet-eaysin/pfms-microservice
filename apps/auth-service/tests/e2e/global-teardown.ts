/**
 * Global Teardown for E2E Tests
 * Runs once after all e2e tests
 */

export default async function globalTeardown() {
  // Cleanup test environment, stop servers, etc.
  console.log('E2E tests cleanup complete');
}
