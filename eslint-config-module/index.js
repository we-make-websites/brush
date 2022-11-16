const merge = require('merge')

module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
  ],
  globals: {
    geoip2: true,
    IntersectionObserver: true,
    Intl: true,
    Shopify: true,
    URLSearchParams: true,
  },
  plugins: [],
  root: true,
  rules: merge(
    require('./rules/formatting'),
    require('./rules/problems'),
    require('./rules/suggestions'),
    require('./rules/vue'),
  ),
}
