/**
 * Helper: Paths
 * -----------------------------------------------------------------------------
 * Single source of truth for path locations for use in Canvas Library Tools.
 *
 */
const path = require('path')

/**
 * Set variables.
 */
const rootFolder = path.resolve(path.dirname('./'))
const packageFolder = path.resolve(rootFolder, 'node_modules', '@we-make-websites', 'communique')

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  context: path.resolve(rootFolder, 'emails', 'context.js'),
  dist: path.resolve(rootFolder, 'emails', 'dist'),
  emails: {
    root: path.resolve(rootFolder, 'emails'),
    templates: path.resolve(rootFolder, 'emails', 'templates'),
  },
  templates: {
    internal: path.resolve(packageFolder, 'templates'),
  },
}
