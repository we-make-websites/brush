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
 * @param {Boolean} namesOnly - Return only the filename, not the full path.
 * @returns {Array}
 */
export function *walkSync(folder, filetypes = [], namesOnly = false) {
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
