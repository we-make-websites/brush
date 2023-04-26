/**
 * Helper: Get component schemas.
 * -----------------------------------------------------------------------------
 * Get all schema files in component folders.
 *
 */
const getFilesInFolder = require('../helpers/get-files-in-folder')
const Paths = require('../helpers/paths')

/**
 * Export.
 * @returns {Promise}
 */
function getSchemas() {
  return new Promise((resolve, reject) => {
    try {
      const componentSchemas = getFilesInFolder(Paths.components.root, ['schema.js'])
      const sectionSchemas = getFilesInFolder(Paths.schemas.root, ['js'])

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
