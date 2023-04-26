/* eslint-disable max-len */

const message = (rule, unit) => {
  switch (rule) {
    case 'animation':
      return `Do not use "${unit}" by itself, add timing and easing`
    case 'border':
      return `Do not use "${unit}", instead use "0" as the value`
    case 'letter-spacing':
      return `Do not use "${unit}" units, use "em" or "px" units`
    case 'line-height':
      return `Do not use "${unit}" units, instead use "%" or decimal values`
  }

  return 'Error'
}

module.exports = {
  // Disallow duplicate properties within declaration blocks
  'declaration-block-no-duplicate-properties': true,
  // Disallow longhand properties that can be combined into one shorthand property
  'declaration-block-no-redundant-longhand-properties': [
    true, {
      ignoreShorthands: ['/^grid.*/'],
    },
  ],
  // Disallow shorthand properties that override related longhand properties within declaration blocks
  'declaration-block-no-shorthand-property-overrides': true,
  // Limit the number of declaration within single line declaration blocks
  'declaration-block-single-line-max-declarations': 2,
  //  Require or disallow an empty line before declarations
  'declaration-empty-line-before': 'never',
  // Disallow !important within declarations
  'declaration-no-important': true,
  // Specify a list of disallowed property and unit pairs within declarations
  'declaration-property-unit-disallowed-list': [
    {
      'letter-spacing': ['rem'],
      'line-height': ['px', 'rem'],
    },
    { message },
  ],
  // Specify a list of allowed property and unit pairs within declarations
  'declaration-property-unit-allowed-list': null,
  // Specify a list of disallowed property and value pairs within declarations
  'declaration-property-value-disallowed-list': [
    {
      animation: ['linear'],
      '/^border$/': ['none'],
    },
    { message },
  ],
  // Specify a list of allowed property and value pairs within declarations
  'declaration-property-value-allowed-list': null,
  // Disallow unknown values for properties within declarations, currently buggy
  'declaration-property-value-no-unknown': null,
}
