/* eslint-disable max-len */

module.exports = {
  // Specify a list of disallowed functions.
  'function-disallowed-list': [
    ['hsl', 'hsla'],
    { message: 'Use only rgb or hex values' },
  ],
  // Disallow an unspaced operator within calc functions.
  'function-calc-no-unspaced-operator': true,
  // Require a newline or disallow whitespace after the commas of functions.
  'function-comma-newline-after': 'never-multi-line',
  // Require a newline or disallow whitespace before the commas of functions.
  'function-comma-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the commas of functions.
  'function-comma-space-after': 'always',
  // Require a single space or disallow whitespace before the commas of functions.
  'function-comma-space-before': 'never',
  // Disallow direction values in linear-gradient() calls that are not valid according to the standard syntax.
  'function-linear-gradient-no-nonstandard-direction': true,
  // Limit the number of adjacent empty lines within functions.
  'function-max-empty-lines': 0,
  // Specify lowercase or uppercase for function names.
  'function-name-case': 'lower',
  // Require a newline or disallow whitespace on the inside of the parentheses of functions.
  'function-parentheses-newline-inside': 'never-multi-line',
  // Require a single space or disallow whitespace on the inside of the parentheses of functions.
  'function-parentheses-space-inside': 'never',
  // Disallow scheme-relative urls.
  'function-url-no-scheme-relative': true,
  // Require or disallow quotes for urls.
  'function-url-quotes': 'always',
  // Specify a list of disallowed url schemes.
  'function-url-scheme-disallowed-list': null,
  // Specify a list of allowed url schemes.
  'function-url-scheme-allowed-list': ['http', 'https', 'data'],
  // Specify a list of only allowed functions.
  'function-allowed-list': null,
  // Require a single space or disallow whitespace after functions.
  'function-whitespace-after': 'always',
}
