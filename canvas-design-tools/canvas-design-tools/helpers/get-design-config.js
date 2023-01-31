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
  const projectPath = Object.values(Paths.config.project).find((configPath) => {
    return fs.existsSync(configPath)
  })

  const configPath = projectPath
    ? projectPath
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
