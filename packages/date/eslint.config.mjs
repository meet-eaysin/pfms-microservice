import { strictConfig } from '@pfms/eslint-config/strict';

export default [
  ...strictConfig,
  {
    files: ['**/*.ts'],
    ignores: ['dist/**', 'node_modules/**'],
  },
];
