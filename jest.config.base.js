/**
 * Base Jest Configuration for PFMS Monorepo
 * Shared configuration for all microservices
 */

module.exports = {
  // Use ts-jest preset for TypeScript support
  preset: 'ts-jest',

  // Node environment for backend services
  testEnvironment: 'node',

  // Module resolution patterns
  moduleFileExtensions: ['js', 'json', 'ts'],

  // Root directories for test discovery
  roots: ['<rootDir>/src', '<rootDir>/test'],

  // Path mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@pfms/test-utils$': '<rootDir>/../../packages/test-utils/src/index.ts',
    '^@pfms/types$': '<rootDir>/../../packages/types/src/index.ts',
    '^@pfms/utils$': '<rootDir>/../../packages/utils/src/index.ts',
    '^@pfms/config$': '<rootDir>/../../packages/config/src/index.ts',
    '^@pfms/event-bus$': '<rootDir>/../../packages/event-bus/src/index.ts',
    '^uuid$': require.resolve('uuid'),
  },

  // Coverage configuration
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
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'clover'],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 15,
      lines: 25,
      statements: 30,
    },
  },

  // TypeScript transformation with ts-jest
  transform: {
    '^.+\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          strict: true,
          isolatedModules: true,
        },
      },
    ],
  },

  // Performance optimizations
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',

  // Test timeouts
  testTimeout: 10000,

  // Global setup/teardown
  // globalSetup: undefined,
  // globalTeardown: undefined,

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/build/', '/.next/'],
  modulePathIgnorePatterns: ['/dist/', '/build/', '/.next/'],

  // Verbose output
  verbose: true,

  // Clear mocks automatically between tests
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,

  // Error handling
  bail: 0,
  errorOnDeprecated: true,
  passWithNoTests: true,
};
