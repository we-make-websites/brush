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
  // Specify a list of allowed at-rules
  'at-rule-allowed-list': null,
  // Specify a list of disallowed at-rules
  'at-rule-disallowed-list': [['debug', 'error', 'warn'], { message }],
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
}
