/**
 * Eslint Config
 * -----------------------------------------------------------------------------
 * We Make Websites eslint configuration.
 *
 */
const merge = require('merge')

module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:import/recommended',
    'plugin:vuejs-accessibility/recommended',
  ],
  globals: {
    geoip2: true,
    IntersectionObserver: true,
    Intl: true,
    Shopify: true,
    URLSearchParams: true,
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  plugins: [
    '@babel',
    'vuejs-accessibility',
  ],
  root: true,
  rules: merge(
    require('./rules/formatting'),
    require('./rules/import'),
    require('./rules/problems'),
    require('./rules/suggestions'),
    require('./rules/vue'),
    require('./rules/vue-accessibility'),
  ),
}
