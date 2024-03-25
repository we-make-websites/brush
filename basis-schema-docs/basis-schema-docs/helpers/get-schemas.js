/**
 * Helper: Get component schemas.
 * -----------------------------------------------------------------------------
 * Get all schema files in component folders.
 *
 */
const fileSync = require('@we-make-websites/file-sync')

const Paths = require('../helpers/paths')

/**
 * Export.
 * @returns {Promise}
 */
function getSchemas() {
  return new Promise((resolve, reject) => {
    try {
      const componentSchemas = fileSync(Paths.components.root, {
        array: true,
        filter: ['.schema.js'],
      })

      const sectionSchemas = fileSync(Paths.schemas.root, {
        array: true,
        filter: ['.js'],
      })

      const schemas = [
        ...componentSchemas,
        ...sectionSchemas,
      ]

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
