/* eslint-disable max-len */

const message = (rule) => {
  switch (rule) {
    case 'hsl':
    case 'hsla':
      return `Do not use "${rule}", instead use "rgb" or "rgba"`
    case 'rotate':
    case 'scale':
    case 'translate':
      return `Do not use the "${rule}" function with "transform", instead use its individual property`
  }

  return 'Error'
}

module.exports = {
  // Specify a list of disallowed functions
  'function-disallowed-list': [
    ['hsl', 'hsla', 'rotate', 'scale', 'translate'],
    { message },
  ],
  // Disallow an unspaced operator within calc functions
  'function-calc-no-unspaced-operator': true,
  // Disallow direction values in linear-gradient() calls that are not valid according to the standard syntax
  'function-linear-gradient-no-nonstandard-direction': true,
  // Limit the number of adjacent empty lines within functions
  'function-max-empty-lines': 0,
  // Specify lowercase or uppercase for function names
  'function-name-case': 'lower',
  // Disallow scheme-relative urls
  'function-url-no-scheme-relative': true,
  // Require or disallow quotes for urls
  'function-url-quotes': 'always',
  // Specify a list of disallowed url schemes
  'function-url-scheme-disallowed-list': null,
  // Specify a list of allowed url schemes
  'function-url-scheme-allowed-list': ['http', 'https', 'data'],
  // Specify a list of only allowed functions
  'function-allowed-list': null,
}
