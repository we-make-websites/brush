/* eslint-disable max-len */

module.exports = {
  // Disallow empty blocks
  'block-no-empty': true,
  // Disallow !important within keyframe declarations
  'keyframe-declaration-no-important': true,
  // Specify a pattern for keyframe names
  'keyframes-name-pattern': [
    '^[a-z][a-z0-9-]+$',
    {
      message: () => `Expected keyframe name to be kebab-case`,
    },
  ],
  // Enforce percentage keyframes, unless all keywords
  'keyframe-selector-notation': 'percentage-unless-within-keyword-only-block',
  // Disallow units for zero lengths
  'length-zero-no-unit': true,
  // Limit the depth of nesting
  'max-nesting-depth': 3,
  // Disallow selectors of lower specificity from coming after overriding selectors of higher specificity
  'no-descending-specificity': null,
  // Disallow duplicate selectors
  'no-duplicate-selectors': true,
  // Disallow empty sources
  'no-empty-source': true,
  // Disallow invalid position @import rules
  'no-invalid-position-at-import-rule': null,
  // Disallow animation names that do not correspond to a @keyframes declaration
  'no-unknown-animations': null,
  // Limit the number of decimal places allowed in numbers
  'number-max-precision': 3,
  // Require or disallow an empty line before rules
  'rule-empty-line-before': [
    'always', {
      except: ['first-nested'],
      ignore: ['after-comment'],
    },
  ],
  // Disallow (unescaped) newlines in strings
  'string-no-newline': true,
  // Limit the minimum number of milliseconds for time values
  'time-min-milliseconds': 100,
  // Specify lowercase or uppercase for keywords values
  'value-keyword-case': 'lower',
  // Disallow vendor prefixes for values
  'value-no-vendor-prefix': true,
}
