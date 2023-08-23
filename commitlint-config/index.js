/**
 * Commitlint Config
 * -----------------------------------------------------------------------------
 * We Make Websites commitlint configuration.
 *
 */
module.exports = {
  rules: {
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never'],
    'subject-min-length': [2, 'always', 5],
    'type-case': [
      2,
      'always',
      [
        'lower-case',
        'upper-case',
      ],
    ],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      [
        'BUILD',
        'CHORE',
        'CI',
        'DOCS',
        'FEAT',
        'FEATURE',
        'FIX',
        'MERGE',
        'REFACTOR',
        'RELEASE',
        'REVERT',
        'PERF',
        'STYLE',
        'SYNC',
        'TEST',
      ],
    ],
  },
}
