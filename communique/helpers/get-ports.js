/**
 * Helper: Get ports
 * -----------------------------------------------------------------------------
 * Get port to run Browsersync on.
 *
 */
const portscanner = require('portscanner')

/**
 * Export.
 * @returns {Promise}
 */
module.exports = () => {
  return new Promise(async(resolve, reject) => {
    try {
      const browsersync = await portscanner.findAPortNotInUse(3000, 4000)
      const ui = await portscanner.findAPortNotInUse(browsersync + 1, 4000)
      resolve({ browsersync, ui })

    } catch (error) {
      reject(error)
    }
  })
}
