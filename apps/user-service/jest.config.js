/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/index.ts', '!src/**/*.interface.ts'],
  coverageDirectory: 'coverage/unit',
  coverageReporters: ['text', 'lcov', 'html'],
  verbose: true,
  testTimeout: 10000,
};
