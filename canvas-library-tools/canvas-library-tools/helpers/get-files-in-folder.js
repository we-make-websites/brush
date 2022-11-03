/**
 * Helper: Get files (and folders) in folder
 * -----------------------------------------------------------------------------
 * 'glob-fs' has become unreliable on Windows machines, replaces functionality.
 * - See Basis for instance with filter by filetype.
 *
 */
const fs = require('fs-extra')
const path = require('path')

/**
 * Walk through files in folders.
 * @param {String} folder - Path of folder to look in.
 * @param {Boolean} includeFolders - Include folders in output if no files are
 * found inside it.
 * @returns {Array}
 */
function *walkSync(folder, includeFolders) {
  if (!fs.existsSync(folder)) {
    return
  }

  const files = fs.readdirSync(folder, { withFileTypes: true })

  if (!files.length && includeFolders) {
    yield path.join(folder)
  }

  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(folder, file.name), includeFolders)
      continue
    }

    yield path.join(folder, file.name)
  }
}

/**
 * Export.
 * @returns {Array}
 */
module.exports = (folder, includeFolders) => {
  return walkSync(folder, includeFolders)
}
