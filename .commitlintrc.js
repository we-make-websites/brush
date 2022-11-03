module.exports = {
  rules: {
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'subject-min-length': [2, 'always', 5],
    'type-case': [2, 'always', 'upper-case'],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always',
      [
        'BUILD', // A code change not covered by one of the below
        'CI', // A change to the continuous integration
        'FEATURE', // A new feature
        'FIX', // A bug fix
        'MERGE', // A branch merge (use MERGE when syncing master branch, e.g. `MERGE: Syncing master`)
        'REFACTOR', // Update to existing code (including removal and adding documentation)
        'RELEASE', // A specific version release
        'REVERT', // A git commit revert
        'SYNC', // A live sync from Shopify theme
        'TEST' // A change to the automated testing
      ]
    ]
  },
}
