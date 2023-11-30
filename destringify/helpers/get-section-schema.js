/**
 * Helper: Get section schema.
 * -----------------------------------------------------------------------------
 * Get section settings in section file in JSON format.
 *
 * @param {String} sectionPath - Path to section file.
 * @return {Promise}
 */
const fs = require('fs-extra')

module.exports = (sectionPath) => {
  return new Promise(async(resolve) => {
    const contents = await fs.readFile(sectionPath, 'utf-8')
    const regex = new RegExp('{% schema %}(?<schema>.+?){% endschema %}', 'gs')
    const schema = regex.exec(contents)

    if (!schema) {
      resolve(false)
      return
    }

    resolve(JSON.parse(schema?.groups?.schema))
  })
}
