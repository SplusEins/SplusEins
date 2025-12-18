module.exports = {
  env: {
    browser: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/strongly-recommended',
    'plugin:nuxt/recommended',
    'standard',
    'prettier'
  ],
  // required to lint *.vue files
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    eqeqeq: 'warn', // don't error on wrong equality signs
    camelcase: 'warn', // don't error on non camel case
    'spaced-comment': 'warn',
    semi: 'off', // no preference for semicolons at end
    complexity: ['warn', { max: 30 }],
    'no-warning-comments': 'warn',
    'vue/valid-v-slot': 'off', // false positives for vuetify
    'vue/html-quotes': 'off', // doesn't work properly
    'vue/multi-word-component-names': 'warn', // fixme at some point
    'vue/no-v-text-v-html-on-component': 'warn' // we like to use this

  }
}
