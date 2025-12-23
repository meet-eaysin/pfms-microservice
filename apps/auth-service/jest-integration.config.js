/**
 * Jest Configuration - Integration Tests
 * Auth Service
 */

const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'auth-service:integration',

  // Test file patterns - only integration tests
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.ts',
    '<rootDir>/tests/integration/**/*.spec.ts',
    '<rootDir>/src/**/*.integration.spec.ts',
  ],

  // Module resolution
  roots: ['<rootDir>/src', '<rootDir>/tests/integration'],

  // Global setup/teardown
  globalSetup: '<rootDir>/tests/integration/global-setup.ts',
  globalTeardown: '<rootDir>/tests/integration/global-teardown.ts',

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.ts'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
    '!src/**/*.type.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.constant.ts',
    '!src/main.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  coverageDirectory: './coverage/integration',

  // Run tests serially for integration tests
  maxWorkers: 1,

  // Longer timeout for integration tests
  testTimeout: 60000,

  // Don't clear mocks between tests (integration tests may need state)
  clearMocks: false,
};
