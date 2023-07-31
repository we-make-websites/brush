/**
 * Eslint Config Module
 * -----------------------------------------------------------------------------
 * We Make Websites eslint configuration for non-webpack projects.
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
  ],
  globals: {
    geoip2: true,
    IntersectionObserver: true,
    Intl: true,
    Shopify: true,
    URLSearchParams: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  plugins: [],
  root: true,
  rules: merge(
    require('./rules/formatting'),
    require('./rules/import'),
    require('./rules/problems'),
    require('./rules/suggestions'),
    require('./rules/vue'),
  ),
}
