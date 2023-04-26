const message = (rule) => {
  switch (rule) {
    case 'debug':
    case 'error':
    case 'warn':
      return 'Do not use debugging at-rules in SCSS'
  }

  return 'Error'
}

module.exports = {
  // Specify a list of disallowed at-rules
  'at-rule-disallowed-list': [['debug', 'error', 'warn'], { message }],
  // Require or disallow an empty line before @rules
  'at-rule-empty-line-before': [
    'always',
    {
      except: ['first-nested'],
      ignore: ['after-comment', 'blockless-after-same-name-blockless'],
      ignoreAtRules: ['else', 'include', 'extend'],
    },
  ],
  // Specify lowercase or uppercase for at-rules names
  'at-rule-name-case': 'lower',
  // Require a newline after at-rule names
  'at-rule-name-newline-after': 'always-multi-line',
  // Require a single space after at-rule names
  'at-rule-name-space-after': 'always-single-line',
  // Disallow unknown at-rules
  'at-rule-no-unknown': [
    true, {
      ignoreAtRules: [
        'at-root',
        'content',
        'debug',
        'each',
        'else',
        'error',
        'extend',
        'for',
        'function',
        'if',
        'include',
        'mixin',
        'return',
        'use',
        'warn',
        'while',
      ],
    },
  ],
  // Disallow vendor prefixes for @rules
  'at-rule-no-vendor-prefix': true,
  // Require a newline after the semicolon of at-rules
  'at-rule-semicolon-newline-after': 'always',
  // Specify a list of allowed at-rules
  'at-rule-allowed-list': null,
  // Disallow whitespace before the semicolons of at-rules
  'at-rule-semicolon-space-before': 'never',
}
