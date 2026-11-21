import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  { ignores: ['dist/', 'dev-dist/', 'src/assets/'] },
  js.configs.recommended,
  ...vue.configs['flat/strongly-recommended'],
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    // allows <script lang="ts"> in components
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  prettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        // defined in vite.config.js
        __TEAM__: 'readonly',
        __STAGING__: 'readonly',
        __VERSION__: 'readonly',
      },
    },
    rules: {
      eqeqeq: 'warn', // don't error on wrong equality signs
      camelcase: ['warn', { properties: 'never' }], // don't error on non camel case
      complexity: ['warn', { max: 30 }],
      'no-warning-comments': 'warn',
      'vue/valid-v-slot': 'off', // false positives for vuetify
    },
  },
  {
    // these files run in Node.js, not in the browser
    files: ['*.config.js', 'server.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // pages are named after their URL
    files: ['src/pages/*.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
];
