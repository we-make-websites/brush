/**
 * Helper: Get Canvas config
 * -----------------------------------------------------------------------------
 * Returns canvas.config.js file if it exists, and is a Canvas project.
 *
 */
const fs = require('fs-extra')
const path = require('path')

/**
 * Export.
 * @returns {Object|Boolean}
 */
module.exports = () => {
  const rootFolder = path.resolve(path.dirname('src'))
  const basisConfig = path.resolve(rootFolder, 'adapter.config.js')
  const canvasConfig = path.resolve(rootFolder, 'canvas.config.js')

  if (
    !fs.existsSync(basisConfig) &&
    !fs.existsSync(canvasConfig)
  ) {
    return false
  }

  let config = false

  if (fs.existsSync(canvasConfig)) {
    config = require(canvasConfig)
  } else if (fs.existsSync(basisConfig)) {
    config = require(basisConfig)
  }

  if (!config) {
    return false
  }

  return config
}
