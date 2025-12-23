/**
 * Jest Configuration - E2E Tests
 * Expense Service
 */

const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'expense-service:e2e',

  // Test file patterns - only e2e tests
  testMatch: [
    '<rootDir>/tests/e2e/**/*.test.ts',
    '<rootDir>/tests/e2e/**/*.spec.ts',
    '<rootDir>/src/**/*.e2e.spec.ts',
  ],

  // Module resolution
  roots: ['<rootDir>/src', '<rootDir>/tests/e2e'],

  // Global setup/teardown
  globalSetup: '<rootDir>/tests/e2e/global-setup.ts',
  globalTeardown: '<rootDir>/tests/e2e/global-teardown.ts',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.ts'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.type.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.constant.ts',
    '!src/index.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  coverageDirectory: './coverage/e2e',

  // Run tests serially for e2e tests
  maxWorkers: 1,

  // Longer timeout for e2e tests
  testTimeout: 120000,

  // Don't clear mocks between tests
  clearMocks: false,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles (useful for debugging hanging tests)
  detectOpenHandles: true,
};
