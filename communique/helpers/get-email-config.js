/**
 * Helper: Get Email config
 * -----------------------------------------------------------------------------
 * Returns email.config.js file if it exists.
 *
 */
const fs = require('fs-extra')

const Paths = require('../helpers/paths')

/**
 * Export.
 * @returns {Object|Boolean}
 */
module.exports = () => {
  if (!fs.existsSync(Paths.config)) {
    return false
  }

  const config = require(Paths.config)

  if (!config) {
    return false
  }

  return config
}
