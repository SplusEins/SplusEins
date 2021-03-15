module.exports = {
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/strongly-recommended',
    'plugin:nuxt/recommended',
    'standard'
  ],
  // required to lint *.vue files
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    'multiline-ternary': 'warn',
    eqeqeq: 'warn', // don't error on wrong equality signs
    camelcase: 'warn', // don't error on non camel case
    quotes: 'warn', // don't error on double qoutes
    'comma-dangle': 'warn',
    'spaced-comment': 'warn',
    semi: 'off', // no preference for semicolons at end
    complexity: ['warn', { max: 30 }],
    'no-warning-comments': 'warn'
  }
}
