module.exports = {
  'array-callback-return': 'error',
  // Frequently use async promises
  'no-async-promise-executor': 'off',
  'no-await-in-loop': 'warn',
  'no-constant-binary-expression': 'error',
  'no-constructor-return': 'error',
  'no-duplicate-imports': 'error',
  'no-promise-executor-return': 'error',
  'no-self-compare': 'error',
  'no-template-curly-in-string': 'error',
  'no-unmodified-loop-condition': 'error',
  'no-unreachable-loop': 'error',
  'no-unused-vars': 'error',
  'no-unused-private-class-members': 'error',
  'no-use-before-define': [
    'error', {
      allowNamedExports: false,
      classes: true,
      functions: false,
      variables: true,
    },
  ],
  // Don't fully understand this rule
  'require-atomic-updates': 'off',
}
