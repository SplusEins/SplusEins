import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default defineConfig(
  { ignores: ['dist/', 'assets/'] },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: { projectService: true },
    },
  },
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  prettier,
  {
    rules: {
      eqeqeq: 'error',
      camelcase: ['warn', { properties: 'never' }],
      complexity: ['warn', { max: 30 }],
      'no-warning-comments': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      // async handlers without await are fine, they still return a promise
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    // fixtures mirror external snake_case JSON, supertest bodies are any
    files: ['tests/**'],
    rules: {
      camelcase: 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
);
