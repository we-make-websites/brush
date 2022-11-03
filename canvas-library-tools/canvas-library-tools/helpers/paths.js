/**
 * Helper: Paths
 * -----------------------------------------------------------------------------
 * Single source of truth for path locations for use in Canvas Library Tools.
 *
 */
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv

let rootFolder = path.resolve(path.dirname('./'))
let packageFolder = path.resolve(rootFolder, 'node_modules', '@we-make-websites', 'canvas-library-tools', 'canvas-library-tools')

/**
 * Debug mode constants.
 */
if (argv.debug) {
  rootFolder = path.resolve('../', 'canvas')
  packageFolder = path.resolve(path.dirname('./'), 'canvas-library-tools')
}

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  credentials: {
    privatekey: path.resolve(packageFolder, 'credentials', 'id_rsa'),
    publickey: path.resolve(packageFolder, 'credentials', 'id_rsa.pub'),
  },
  library: path.resolve(rootFolder, '../', 'canvas-library'),
  libraryJson: path.resolve(rootFolder, 'canvas', 'library.json'),
  src: {
    components: {
      global: path.resolve(rootFolder, 'src', 'components', 'global'),
    },
    locales: path.resolve(rootFolder, 'src', 'shopify', 'locales'),
    root: path.resolve(rootFolder, 'src'),
    scripts: {
      core: {
        import: path.resolve(rootFolder, 'src', 'scripts', 'core', 'canvas-imports.js'),
      },
    },
    styles: {
      layout: {
        theme: path.resolve(rootFolder, 'src', 'styles', 'layout', 'theme.scss'),
      },
    },
  },
  srcFolders: [
    'components',
    'icons',
    'schemas',
    'scripts',
    'shopify',
    'stores',
    'styles',
  ],
  packageJson: path.resolve(rootFolder, 'package.json'),
  temp: {
    locales: path.resolve(rootFolder, 'temp', 'COMPONENT', 'locales.json'),
    root: path.resolve(rootFolder, 'temp'),
  },
}
