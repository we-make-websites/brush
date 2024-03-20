/**
 * Helper: Paths
 * -----------------------------------------------------------------------------
 * Single source of truth for path locations for use in Library.
 *
 */
const path = require('path')
const { hideBin } = require('yargs/helpers')
const yargs = require('yargs/yargs')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv
const rootFolder = '../../../'

module.exports = {
  canvasFolder: path.resolve(rootFolder, 'canvas'),
  library: path.resolve(rootFolder, 'library'),
  libraryJson: path.resolve(rootFolder, 'canvas', 'library.json'),
  libraryLog: path.resolve(rootFolder, 'library.log'),
  module: {
    localeJson: path.resolve(rootFolder, 'node_modules', '@we-make-websites', argv.name, 'locales.json'),
    packageJson: path.resolve(rootFolder, 'node_modules', '@we-make-websites', argv.name, 'package.json'),
    src: path.resolve(rootFolder, 'node_modules', '@we-make-websites', argv.name, 'src'),
  },
  src: {
    canvasConfig: path.resolve(rootFolder, 'canvas.config.js'),
    canvasImports: path.resolve(rootFolder, 'src', 'scripts', 'core', 'canvas-imports.js'),
    components: {
      async: path.resolve(rootFolder, 'src', 'components', 'async'),
      global: path.resolve(rootFolder, 'src', 'components', 'global'),
    },
    locales: path.resolve(rootFolder, 'src', 'shopify', 'locales'),
    root: path.resolve(rootFolder, 'src'),
    themeStyles: path.resolve(rootFolder, 'src', 'styles', 'layout', 'theme.scss'),
  },
}
