/**
 * Branch naming check: Get current branch name.
 * -----------------------------------------------------------------------------
 * Get the current branch name to test.
 *
 */
const fs = require('fs')
const util = require('util')

const readFile = util.promisify(fs.readFile)

/**
 * Read current branch name.
 * @returns {Boolean}
 */
function currentBranchName() {
  return readFile(gitHeadPath()).then(data => parseBranchName(data))
}

/**
 * Load .git HEAD file.
 * @returns {String}
 */
function gitHeadPath() {
  const headPath = '.git/HEAD'

  if (!fs.existsSync(headPath)) {
    throw new Error('.git/HEAD does not exist')
  }

  return headPath
}

/**
 * Parse branch name.
 * @param {*} data - Branch data.
 * @returns {Boolean}
 */
function parseBranchName(data) {
  const match = (/ref: refs\/heads\/(?:[^\n]+)/).exec(data.toString())
  return match ? match[1] : null
}

module.exports = {
  currentBranchName,
}
