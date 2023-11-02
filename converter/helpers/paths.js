/**
 * Helper: Paths
 * -----------------------------------------------------------------------------
 * Single source of truth for path locations for use in Converter.
 *
 */
const path = require('path')

/**
 * Set variables.
 */
const rootFolder = path.resolve(path.dirname('./'))
const packageFolder = path.resolve(rootFolder, 'node_modules', '@we-make-websites', 'converter')

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  components: {
    async: path.resolve(rootFolder, 'src', 'components', 'async'),
    global: path.resolve(rootFolder, 'src', 'components', 'global'),
    root: path.resolve(rootFolder, 'src', 'components'),
  },
  debug: path.resolve(packageFolder, 'debug'),
}
