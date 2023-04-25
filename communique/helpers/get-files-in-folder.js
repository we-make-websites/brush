/**
 * Helper: Get files in folder
 * -----------------------------------------------------------------------------
 * Get all files in a folder.
 * - Includes in sub-folders.
 * - Can filter by filetype.
 * - Or return only filename instead of of full path.
 *
 */
const fs = require('fs-extra')
const path = require('path')

/**
 * Walk through files in folders.
 * @param {String} folder - Path of folder to look in.
 * @param {Array} filetypes - Filetypes to filter.
 * @param {Boolean} namesOnly - Return only the filename, not the full path.
 * @returns {Array}
 */
function *walkSync(folder, filetypes = [], namesOnly = false) {
  const files = fs.readdirSync(folder, { withFileTypes: true })

  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(folder, file.name), filetypes, namesOnly)
      continue
    }

    const matchesFilter = filetypes?.some((filetype) => {
      return file.name.includes(`.${filetype}`)
    })

    if (filetypes.length && !matchesFilter) {
      continue
    }

    if (namesOnly) {
      yield file.name
      continue
    }

    yield path.join(folder, file.name)
  }
}

/**
 * Export.
 * @param {String} folder - Path of folder to look in.
 * @param {Array} filetypes - Filetypes to filter.
 * @param {Boolean} namesOnly - Return only the filename, not the full path.
 * @returns {Array}
 */
module.exports = (folder, filetypes, namesOnly) => {
  return walkSync(folder, filetypes, namesOnly)
}
