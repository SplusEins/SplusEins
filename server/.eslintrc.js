module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'standard',
    'prettier'
  ],

  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    eqeqeq: 'warn', // don't error on wrong equality signs
    camelcase: 'warn', // don't error on non camel case
    'spaced-comment': 'warn',
    'prefer-regex-literals': 'warn',
    complexity: ['warn', { max: 30 }],
    'no-warning-comments': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'space-before-function-paren': 'off'
  }
};
