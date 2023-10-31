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
const packageFolder = path.resolve(rootFolder, 'node_modules', '@we-make-websites', 'canvas-component-tools', 'canvas-component-tools')

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  canvasConfig: path.resolve(rootFolder, 'canvas.config.js'),
  components: {
    async: path.resolve(rootFolder, 'src', 'components', 'async'),
    global: path.resolve(rootFolder, 'src', 'components', 'global'),
  },
  config: path.resolve(rootFolder, 'canvas.config.js'),
  scripts: {
    imports: path.resolve(rootFolder, 'src', 'scripts', 'core', 'canvas-imports.js'),
  },
  styles: {
    theme: path.resolve(rootFolder, 'src', 'styles', 'layout', 'theme.scss'),
  },
  templates: {
    internal: path.resolve(packageFolder, 'templates'),
    project: path.resolve(rootFolder, 'canvas', 'templates', 'component'),
  },
}
