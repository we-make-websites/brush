/**
 * API: Messages
 * -----------------------------------------------------------------------------
 * Functions to update the terminal.
 *
 */
import fs from 'fs-extra'
import path from 'path'
import Tny from '@we-make-websites/tannoy'

/**
 * Outputs banner.
 */
function logBanner() {
  Tny.message([
    Tny.colour('bgCyan', `Communique v${getPackageVersion()})`),
    Tny.colour('bgCyan', 'Preview command'),
  ], { empty: true })
}

/**
 * Get design tools package version.
 * @returns {String}
 */
function getPackageVersion() {
  const packagePath = path.resolve('node_modules', '@we-make-websites/canvas-component-tools/package.json')

  if (!fs.existsSync(packagePath)) {
    return '{{canvas version}}'
  }

  const toolPackage = require(packagePath)
  return toolPackage.version
}

/**
 * Export API.
 */
module.exports = {
  logBanner,
}