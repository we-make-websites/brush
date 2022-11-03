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
  const configPath = path.resolve(rootFolder, 'canvas.config.js')

  if (!fs.existsSync(configPath)) {
    return false
  }

  const config = require(configPath)

  if (!config) {
    return false
  }

  return config
}
