/**
 * Helper: Paths
 * -----------------------------------------------------------------------------
 * Single source of truth for path locations for use in Destringify.
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
  output: path.resolve(rootFolder, 'dist'),
  locales: path.resolve(rootFolder, 'locales'),
  root: path.resolve(rootFolder),
}
