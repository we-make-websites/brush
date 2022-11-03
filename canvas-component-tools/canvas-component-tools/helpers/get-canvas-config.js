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
  if (
    process.env.CANVAS !== 'true' ||
    !fs.existsSync(Paths.config)
  ) {
    return false
  }

  const config = require(Paths.config)

  if (!config) {
    return false
  }

  return config
}
