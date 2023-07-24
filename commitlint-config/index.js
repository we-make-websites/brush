/**
 * Commitlint Config
 * -----------------------------------------------------------------------------
 * We Make Websites commitlint configuration.
 *
 */
/* eslint-disable */

module.exports = {
  rules: {
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never'],
    'subject-min-length': [2, 'always', 5],
    'type-case': [2, 'always',
      [
        'lower-case',
        'upper-case',
      ],
    ],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always',
      [
        'BUILD', // A code change not covered by one of the below
        'CHORE', // Dependency update
        'CI', // A change to the continuous integration (e.g. Buddy.yml)
        'DOCS', // Update to documentation
        'FEAT', // Adds a new feature to store/application
        'FEATURE', // Adds a new feature to store/application
        'FIX', // Patches a bug in your codebase
        'MERGE', // A branch merge (use MERGE when syncing master branch, e.g. `MERGE: Syncing master`)
        'REFACTOR', // Update to existing code (including removal)
        'RELEASE', // A specific version release
        'REVERT', // A git commit revert
        'PERF', // Performance improvement
        'STYLE', // Stylistic code change with no impact on functionality
        'SYNC', // A live sync from Shopify theme
        'TEST' // A change to the automated testing
      ]
    ]
  },
}
