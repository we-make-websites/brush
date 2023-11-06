/**
 * Helper: Get section schema.
 * -----------------------------------------------------------------------------
 * Get section settings in section file in JSON format.
 *
 * @param {String} sectionPath - Path to section file.
 * @return {Promise}
 */
const fs = require('fs-extra')
const Tny = require('@we-make-websites/tannoy')

module.exports = (sectionPath) => {
  return new Promise(async(resolve) => {
    const contents = await fs.readFile(sectionPath, 'utf-8')
    const regex = new RegExp('{% schema %}(?<schema>.+?){% endschema %}', 'gs')
    const schema = regex.exec(contents)

    if (!schema) {
      Tny.message(Tny.colour('red', '❌ No {% schema %} found'))
      process.exit()
    }

    resolve(JSON.parse(schema.groups.schema))
  })
}
