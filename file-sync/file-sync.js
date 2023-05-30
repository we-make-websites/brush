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
 * @param {String} folder - Path of folder to look in.
 * @param {Array} filetypes - Filetypes to filter.
 * @param {Object|Boolean} config - Config object, if boolean then it sets the
 * value of config.filenames.
 * @param {Boolean} config.filenames - Return only the filename and extension.
 * @returns {Array}
 */
function *walkSync(folder, filetypes = [], config = {}) {
  const files = fs.readdirSync(folder, { withFileTypes: true })
  let localConfig = {}

  if (typeof config === 'boolean') {
    localConfig.filenames = config
  } else {
    localConfig = config
  }

  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(folder, file.name), filetypes, localConfig)
      continue
    }

    const matchesFilter = filetypes?.some((filetype) => {
      return file.name.includes(`.${filetype}`)
    })

    if (filetypes.length && !matchesFilter) {
      continue
    }

    if (localConfig.filenames) {
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
 * @param {Object|Boolean} config - Config object, if boolean then it sets the
 * value of config.filenames.
 * @returns {Array}
 */
module.exports = (folder, filetypes, config) => {
  return walkSync(folder, filetypes, config)
}
