/**
 * Stylelint Config
 * -----------------------------------------------------------------------------
 * We Make Websites stylelint configuration.
 *
 */
// const merge = require('merge')

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
    './plugins/content-no-strings',
  ],
  extends: [
    'stylelint-config-standard',
    'stylelint-stylistic/config',
  ],
  // rules: merge(
  //   require('./rules/at-rule'),
  //   require('./rules/block'),
  //   require('./rules/color'),
  //   require('./rules/comment'),
  //   require('./rules/declaration'),
  //   require('./rules/font'),
  //   require('./rules/function'),
  //   require('./rules/general'),
  //   require('./rules/length'),
  //   require('./rules/media'),
  //   require('./rules/number'),
  //   require('./rules/order'),
  //   require('./rules/property'),
  //   require('./rules/rule'),
  //   require('./rules/scss'),
  //   require('./rules/selector'),
  //   require('./rules/string'),
  //   require('./rules/time'),
  //   require('./rules/unit'),
  //   require('./rules/value'),
  //   {
  //     'shopify/content-no-strings': null,
  //   },
  // ),
}
