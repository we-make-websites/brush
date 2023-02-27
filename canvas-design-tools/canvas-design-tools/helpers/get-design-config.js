/**
 * Helper: Get design config
 * -----------------------------------------------------------------------------
 * Returns design.config.js file if it exists, or canvas/design-config.js, or
 * canvas/helpers/design-config.js.
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
