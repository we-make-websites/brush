/**
 * Helper: Paths
 * -----------------------------------------------------------------------------
 * Single source of truth for path locations for use in Basis Schema Docs.
 *
 */
const path = require('path')

const rootFolder = path.resolve(path.dirname('./'))
const packageFolder = path.resolve(rootFolder, 'node_modules', '@we-make-websites', 'basis-schema-docs')

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  components: path.resolve(rootFolder, 'src', 'components'),
  documentation: path.resolve(rootFolder, 'documentation'),
  schemas: path.resolve(rootFolder, 'src', 'schemas'),
  src: path.resolve(rootFolder, 'src'),
  templates: {
    internal: path.resolve(packageFolder, 'templates'),
    project: path.resolve(rootFolder, 'canvas', 'templates', 'docs'),
  },
}
