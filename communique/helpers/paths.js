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

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  context: {
    index: path.resolve(rootFolder, 'emails', 'context', 'index.js'),
    root: path.resolve(rootFolder, 'emails', 'context'),
  },
  dist: path.resolve(rootFolder, 'emails', 'dist'),
  templates: path.resolve(rootFolder, 'emails', 'templates'),
}
