import { config as baseConfig } from '@pfms/eslint-config/base';

export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**', '**/*.spec.ts'],
  },
];
