/* eslint-disable max-len */

module.exports = {
  // Disallow empty blocks
  'block-no-empty': true,
  // Disallow !important within keyframe declarations
  'keyframe-declaration-no-important': true,
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
  // Minimum time in milliseconds
  'time-min-milliseconds': 100,
  // Specify lowercase or uppercase for keywords values
  'value-keyword-case': 'lower',
  // Disallow vendor prefixes for values
  'value-no-vendor-prefix': true,
}
