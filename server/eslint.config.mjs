import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules/', 'dist/', 'assets/', 'tests/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      eqeqeq: 'warn', // don't error on wrong equality signs
      camelcase: 'warn', // don't error on non camel case
      complexity: ['warn', { max: 30 }],
      'no-warning-comments': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
