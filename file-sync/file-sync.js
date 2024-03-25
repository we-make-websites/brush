/**
 * File Sync
 * -----------------------------------------------------------------------------
 * Finds all files in folder and sub-folders with support for filtering.
 *
 */
const fs = require('fs-extra')
const path = require('path')

/**
 * Walk through files in folders.
 * @param {Array|String} folderPaths - Paths of folders to look in.
 * @param {Object} [options] - Options object.
 * @param {Array} options.filter - Only return these files or types.
 * @param {Array} options.ignore - Filepaths to ignore.
 * @param {String} options.return - How to return data, either `path`, `name`,
 * or `parse` to use path.parse.
 * @returns {Array}
 */
function *walkSync(folderPaths, options) {
  const localFolderPaths = typeof folderPaths === 'string'
    ? [folderPaths]
    : folderPaths

  const files = []

  /**
   * Find files/folders in provided folders.
   */
  for (const folderPath of localFolderPaths) {
    if (!fs.existsSync(folderPath)) {
      continue
    }

    const folderFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    files.push(...folderFiles)
  }

  /**
   * Go through each file and output, or recursively run function if folder.
   */
  for (const file of files) {
    if (!file.path) {
      continue
    }

    const combinedPath = path.join(file.path, file.name)

    if (file.isDirectory()) {
      yield* walkSync(combinedPath, options)
      continue
    }

    /**
     * Determine if file should be returned based on filter/ignore options.
     */
    const matchesFilter = options.filter?.some((value) => {
      const formattedValue = value.replaceAll('/', path.sep)
      return file.name.includes(formattedValue)
    })

    const matchesIgnore = options.ignore?.some((value) => {
      const formattedValue = value.replaceAll('/', path.sep)
      return combinedPath.includes(formattedValue)
    })

    let returnFile = true

    if (options.filter?.length && !matchesFilter) {
      returnFile = false
    }

    if (options.ignore?.length && matchesIgnore) {
      returnFile = false
    }

    if (!returnFile) {
      continue
    }

    /**
     * Return in correct format.
     */
    if (options.return === 'name') {
      yield file.name
      continue
    }

    if (options.return === 'parse') {
      const parsedPath = path.parse(combinedPath)

      yield {
        ...parsedPath,
        path: combinedPath,
      }

      continue
    }

    yield combinedPath
  }
}

/**
 * Export.
 * @param {Array|String} folderPath - Paths of folders to look in.
 * @param {Object} [options] - Options object.
 * @param {Boolean} options.array - Return data as an array instead of a
 * generator.
 * @returns {Array}
 */
module.exports = (folderPaths, options = { return: 'path' }) => {
  const filepaths = walkSync(folderPaths, options)

  return options.array
    ? [...filepaths]
    : filepaths
}
