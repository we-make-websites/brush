/**
 * Branch naming check: Get current branch name.
 * -----------------------------------------------------------------------------
 * Get the current branch name to test.
 *
 */
const fs = require('fs-extra')

/**
 * Read current branch name.
 * @returns {Promise}
 */
function readCurrentBranchName() {
  return new Promise(async(resolve) => {
    const data = await fs.readFile(gitHeadPath(), 'utf-8')
    const branchName = parseBranchName(data)
    resolve(branchName)
  })
}

/**
 * Get .git HEAD filepath.
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
 * @param {String} branch - Branch path data.
 * @returns {String}
 */
function parseBranchName(branch) {
  const match = (/ref: refs\/heads\/(?<branch>[^\n]+)/g).exec(branch)
  return match ? match[1] : null
}

module.exports = {
  readCurrentBranchName,
}
