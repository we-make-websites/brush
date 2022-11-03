/**
 * Helper: Get files in folder
 * -----------------------------------------------------------------------------
 * 'glob-fs' has become unreliable on Windows machines, replaces functionality.
 *
 */
const fs = require('fs-extra')
const path = require('path')

/**
 * Walk through files in folders.
 * @param {String} folder - Path of folder to look in.
 * @param {Array} filetypes - Filetypes to filter.
 * @returns {Array}
 */
function *walkSync(folder, filetypes) {
  const files = fs.readdirSync(folder, { withFileTypes: true })

  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(folder, file.name), filetypes)
      continue
    }

    const matchesFilter = filetypes.some((filetype) => {
      return file.name.includes(`.${filetype}`)
    })

    if (!matchesFilter) {
      continue
    }

    yield path.join(folder, file.name)
  }
}

/**
 * Export.
 */
module.exports = (folder, filetypes) => {
  if (!fs.existsSync(folder)) {
    return []
  }

  return walkSync(folder, filetypes)
}
