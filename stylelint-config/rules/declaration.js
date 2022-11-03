/* eslint-disable max-len */

module.exports = {
  // Disallow duplicate properties within declaration blocks.
  'declaration-block-no-duplicate-properties': true,
  // Disallow longhand properties that can be combined into one shorthand property.
  'declaration-block-no-redundant-longhand-properties': [
    true, {
      ignoreShorthands: ['/^grid.*/'],
    },
  ],
  // Disallow shorthand properties that override related longhand properties within declaration blocks.
  'declaration-block-no-shorthand-property-overrides': true,
  // Require a newline or disallow whitespace after the semicolons of declaration blocks.
  'declaration-block-semicolon-newline-after': 'always',
  // Require a newline or disallow whitespace before the semicolons of declaration blocks.
  'declaration-block-semicolon-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the semicolons of declaration blocks.
  'declaration-block-semicolon-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the semicolons of declaration blocks.
  'declaration-block-semicolon-space-before': 'never',
  // Limit the number of declaration within single line declaration blocks.
  'declaration-block-single-line-max-declarations': 2,
  // Require or disallow a trailing semicolon within declaration blocks.
  'declaration-block-trailing-semicolon': 'always',
  // Require a single space or disallow whitespace after the bang of declarations.
  'declaration-bang-space-after': 'never',
  // Require a single space or disallow whitespace before the bang of declarations.
  'declaration-bang-space-before': 'always',
  // Require a newline or disallow whitespace after the colon of declarations.
  'declaration-colon-newline-after': 'always-multi-line',
  // Require a single space or disallow whitespace after the colon of declarations.
  'declaration-colon-space-after': 'always',
  // Require a single space or disallow whitespace before the colon of declarations.
  'declaration-colon-space-before': 'never',
  //  Require or disallow an empty line before declarations.
  'declaration-empty-line-before': 'never',
  // Disallow !important within declarations.
  'declaration-no-important': true,
  // Specify a list of disallowed property and unit pairs within declarations.
  'declaration-property-unit-disallowed-list': [
    {
      'letter-spacing': ['rem'],
      'line-height': ['px', 'rem'],
    },
  ],
  // Specify a list of allowed property and unit pairs within declarations.
  'declaration-property-unit-allowed-list': null,
  // Specify a list of disallowed property and value pairs within declarations.
  'declaration-property-value-disallowed-list': [
    {
      '/^animation/': ['linear'],
      '/^border$/': ['none'],
    },
  ],
  // Specify a list of allowed property and value pairs within declarations.
  'declaration-property-value-allowed-list': {},
  // Disallow !important within keyframe declarations.
  'keyframe-declaration-no-important': true,
}
