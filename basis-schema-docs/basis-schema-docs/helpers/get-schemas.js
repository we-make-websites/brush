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
      const asyncSchemas = getFilesInFolder(Paths.components.async, ['schema.js'])
      const globalSchemas = getFilesInFolder(Paths.components.global, ['schema.js'])
      const sectionSchemas = getFilesInFolder(Paths.schemas.root, ['js'])

      const schemas = [
        ...asyncSchemas,
        ...globalSchemas,
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
