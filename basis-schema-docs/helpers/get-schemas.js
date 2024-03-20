/**
 * Helper: Get component schemas.
 * -----------------------------------------------------------------------------
 * Get all schema files in component folders.
 *
 */
const fileSync = require('@we-make-websites/file-sync')

const Paths = require('./paths')

/**
 * Export.
 * @returns {Promise}
 */
function getSchemas() {
  return new Promise((resolve, reject) => {
    try {
      const schemas = fileSync([
        Paths.components,
        Paths.schemas,
      ], {
        array: true,
        filter: ['.block.js', '.section.js', 'settings_schema.js'],
      })

      resolve(schemas)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export helpers.
 */
module.exports = () => {
  return getSchemas()
}
