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
const packageFolder = path.resolve(rootFolder, 'node_modules', '@we-make-websites', 'canvas-design-tools', 'canvas-design-tools')

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  config: {
    internal: path.resolve(packageFolder, 'design.config.js'),
    project: {
      // Order is important
      root: path.resolve(rootFolder, 'design.config.js'),
      canvas: path.resolve(rootFolder, 'canvas', 'design-config.js'),
      helpers: path.resolve(rootFolder, 'canvas', 'helpers', 'design-config.js'),
    },
  },
  icons: path.resolve(rootFolder, 'src', 'icons'),
  scripts: {
    config: path.resolve(rootFolder, 'src', 'scripts', 'config'),
  },
  styles: {
    base: path.resolve(rootFolder, 'src', 'styles', 'base'),
    config: path.resolve(rootFolder, 'src', 'styles', 'config'),
    helpers: path.resolve(rootFolder, 'src', 'styles', 'helpers'),
  },
  storybook: {
    assets: path.resolve(rootFolder, '.storybook', 'assets'),
    stories: path.resolve(rootFolder, '.storybook', 'stories'),
  },
  templates: {
    internal: path.resolve(packageFolder, 'templates'),
    project: path.resolve(rootFolder, 'canvas', 'templates', 'design'),
  },
  tokens: path.resolve(rootFolder, 'tokens.json'),
}
