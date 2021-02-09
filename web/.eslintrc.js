module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 12,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/strongly-recommended',
    'standard'
  ],
  // required to lint *.vue files
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    eqeqeq: 'warn',
    'multiline-ternary': 'warn',
    camelcase: 'warn',
    semi: 'off' // no preference for semicolons at end
  }
}
