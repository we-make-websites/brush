/**
 * Helper: Get templates
 * -----------------------------------------------------------------------------
 * Get templates of chosen style.
 *
 */
const fs = require('fs-extra')
const path = require('path')
const fileSync = require('@we-make-websites/file-sync')

/**
 * Export.
 * @param {String} templatePath - Path to templates folder.
 * @param {String} templateFolder - Template sub-folder to use.
 * @returns {Promise}
 */
function getTemplates(templatePath, templateFolder) {
  return new Promise(async(resolve, reject) => {
    try {
      const styleFolder = path.join(templatePath, templateFolder)
      const files = fileSync(styleFolder, { filter: ['.ejs'] })

      const templates = {}

      for (const filepath of files) {
        const name = filepath
          .split(/[\\/]{1,2}/g)
          .reverse()[0]
          .replace('.ejs', '')
          .replace(/-\w/g, ($1) => $1.toUpperCase())
          .replaceAll('-', '')

        // eslint-disable-next-line no-await-in-loop
        const template = await fs.readFile(filepath, 'utf-8')
        templates[name] = template
      }

      resolve(templates)

    } catch (error) {
      reject(error)
    }
  })
}

/**
  * Export helpers.
  */
module.exports = (templatePath, style) => {
  return getTemplates(templatePath, style)
}
