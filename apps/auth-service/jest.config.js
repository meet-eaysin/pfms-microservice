/**
 * Jest Configuration - Unit Tests
 * Auth Service
 */

const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'auth-service:unit',

  // Test file patterns - only unit tests
  testMatch: [
    '<rootDir>/src/**/*.spec.ts',
    '<rootDir>/tests/unit/**/*.test.ts',
    '<rootDir>/tests/unit/**/*.spec.ts',
  ],

  // Exclude integration and e2e tests
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    '/tests/integration/',
    '/tests/e2e/',
    '.integration.spec.ts',
    '.e2e.spec.ts',
  ],

  // Module resolution
  roots: ['<rootDir>/src', '<rootDir>/tests/unit'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/unit/setup.ts'],

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
  coverageDirectory: './coverage/unit',
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 15,
      lines: 25,
      statements: 30,
    },
  },

  // Performance
  maxWorkers: '50%',

  // Timeouts
  testTimeout: 10000,
};
