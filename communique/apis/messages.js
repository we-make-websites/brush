/**
 * API: Messages
 * -----------------------------------------------------------------------------
 * Functions to update the terminal.
 *
 */
const fs = require('fs-extra')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')

/**
 * Outputs banner.
 * @param {Boolean} mode - Compile mode, `development` or `production`.
 */
function logBanner(mode) {
  const type = mode === 'production' ? 'Build' : 'Preview'

  Tny.message([
    Tny.colour('bgCyan', `Communique v${getPackageVersion()}`),
    Tny.colour('bgCyan', `${type} command`),
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
 * Outputs build banner.
 * @param {Number} data.count - Number of templates compiled.
 * @param {Number} data.start - Build start time.
 * @param {Boolean} [data.watch] - Function is being run from watch.
 */
function logBuild({ count, start, watch }) {
  const end = performance.now()
  const plural = count === 1 ? '' : 's'

  Tny.message([
    Tny.colour('green', `📨 ${count} email template${plural} ${watch ? 'updated' : 'created'}`),
    Tny.time(start, end),
  ])
}

/**
 * Export API.
 */
module.exports = {
  logBanner,
  logBuild,
}
