import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export const strictConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        project: true,
      },
    },
    rules: {
      // ============================================
      // STRICT TYPE SAFETY - NO ANY ALLOWED
      // ============================================
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // ============================================
      // CODE COMPLEXITY - MAX 3 PARAMETERS
      // ============================================
      'max-params': ['error', 3],
      complexity: ['error', 10],
      'max-depth': ['error', 3],
      'max-nested-callbacks': ['error', 3],
      'no-nested-ternary': 'error',

      // ============================================
      // CODE STYLE - 2 SPACE INDENTATION
      // ============================================
      indent: 'off', // Disabled in favor of TypeScript version
      '@typescript-eslint/indent': ['error', 2, { SwitchCase: 1 }],
      'no-mixed-spaces-and-tabs': 'error',
      'no-tabs': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // ============================================
      // UNUSED CODE
      // ============================================
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-unused-expressions': 'error',

      // ============================================
      // BOOLEAN EXPRESSIONS
      // ============================================
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: true,
        },
      ],

      // ============================================
      // NAMING CONVENTIONS
      // ============================================
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          prefix: ['I'],
        },
      ],

      // ============================================
      // IMMUTABILITY
      // ============================================
      'prefer-const': 'error',
      '@typescript-eslint/prefer-readonly': 'error',

      // ============================================
      // CONSISTENT RETURNS
      // ============================================
      '@typescript-eslint/consistent-return': 'off', // Not available in typescript-eslint
      'consistent-return': 'error',
    },
  }
);

export const config = strictConfig;
