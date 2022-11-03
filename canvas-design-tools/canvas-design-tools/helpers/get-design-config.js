/**
 * Helper: Get Canvas config
 * -----------------------------------------------------------------------------
 * Returns canvas.config.js file if it exists, and is a Canvas project.
 *
 */
const fs = require('fs-extra')

const Paths = require('./paths')

/**
 * Export.
 * @returns {Object|Boolean}
 */
module.exports = () => {
  const configPath = fs.existsSync(Paths.config.project)
    ? Paths.config.project
    : Paths.config.internal

  if (!fs.existsSync(configPath)) {
    return false
  }

  const config = require(configPath)

  if (!config) {
    return false
  }

  return config
}
