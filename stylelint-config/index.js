/**
 * Stylelint Config
 * -----------------------------------------------------------------------------
 * We Make Websites stylelint configuration.
 *
 */
const merge = require('merge')

module.exports = {
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss',
    },
  ],
  plugins: [
    'stylelint-scss',
    'stylelint-order',
    'stylelint-stylistic',
  ],
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss',
    'stylelint-stylistic/config',
  ],
  rules: merge(
    require('./rules/at-rule'),
    require('./rules/block'),
    require('./rules/color'),
    require('./rules/comment'),
    require('./rules/declaration'),
    require('./rules/font'),
    require('./rules/function'),
    require('./rules/general'),
    require('./rules/media'),
    require('./rules/number'),
    require('./rules/order'),
    require('./rules/property'),
    require('./rules/scss'),
    require('./rules/selector'),
    require('./rules/stylistic'),
    require('./rules/unit'),
    require('./rules/value'),
  ),
}
