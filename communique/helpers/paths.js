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
  config: path.resolve(rootFolder, 'emails', 'email.config.js'),
  context: {
    index: path.resolve(rootFolder, 'emails', 'src', 'context', 'index.json'),
    root: path.resolve(rootFolder, 'emails', 'src', 'context'),
  },
  dist: path.resolve(rootFolder, 'emails', 'dist'),
  index: path.resolve(packageFolder, 'templates', 'index.ejs'),
  snippets: path.resolve(rootFolder, 'emails', 'src', 'snippets'),
  styles: {
    index: path.resolve(rootFolder, 'emails', 'src', 'styles', 'index.css'),
    root: path.resolve(rootFolder, 'emails', 'src', 'styles'),
  },
  templates: path.resolve(rootFolder, 'emails', 'src', 'templates'),
}
