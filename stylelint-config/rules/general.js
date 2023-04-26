/* eslint-disable max-len */

module.exports = {
  // Specify indentation
  indentation: 2,
  // Disallow !important within keyframe declarations
  'keyframe-declaration-no-important': true,
  // Enforce percentage keyframes, unless all keywords
  'keyframe-selector-notation': 'percentage-unless-within-keyword-only-block',
  // Disallow units for zero lengths
  'length-zero-no-unit': true,
  // Specify unix or windows linebreak
  linebreaks: null,
  // Disallow more than a specified number of adjacent empty lines
  'max-empty-lines': 1,
  // Limit the length of a line
  'max-line-length': null,
  // Limit the depth of nesting
  'max-nesting-depth': 3,
  // Disallow selectors of lower specificity from coming after overriding selectors of higher specificity
  'no-descending-specificity': null,
  // Disallow duplicate selectors
  'no-duplicate-selectors': true,
  // Disallow empty sources
  'no-empty-source': true,
  // Disallow end-of-line whitespace
  'no-eol-whitespace': true,
  // Disallow extra semicolons
  'no-extra-semicolons': true,
  // Disallow missing end-of-file newline
  'no-missing-end-of-source-newline': true,
  // Disallow animation names that do not correspond to a @keyframes declaration
  'no-unknown-animations': null,
  // Require or disallow an empty line before rules
  'rule-empty-line-before': [
    'always', {
      except: ['first-nested'],
      ignore: ['after-comment'],
    },
  ],
  // Disallow (unescaped) newlines in strings
  'string-no-newline': true,
  // Specify single or double quotes around strings
  'string-quotes': 'single',
  // Minimum time in milliseconds
  'time-min-milliseconds': 100,
}
