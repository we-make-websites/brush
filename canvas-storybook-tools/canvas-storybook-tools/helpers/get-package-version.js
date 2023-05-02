/**
 * Helper: Get variables updated
 * -----------------------------------------------------------------------------
 * Checks to see if Storybook variables have been updated by comparing
 * credentials with first config.yml environment.
 *
 */
const fs = require('fs-extra')
const path = require('path')

/**
 * Export.
 * @returns {Promise}
 */
module.exports = () => {
  const packagePath = path.resolve('node_modules', '@we-make-websites/canvas-storybook-tools/package.json')

  if (!fs.existsSync(packagePath)) {
    return '{{canvas version}}'
  }

  const toolPackage = require(packagePath)
  return toolPackage.version
}
