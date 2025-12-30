const baseConfig = require('../../jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'expense-service:unit',
  testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],
  coverageDirectory: '<rootDir>/coverage/unit',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
  ],
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
