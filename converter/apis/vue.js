/**
 * API: Convert
 * -----------------------------------------------------------------------------
 * Extra functions for convert command.
 *
 */
const fs = require('fs-extra')
const { parse } = require('@vue/compiler-sfc')

/**
 * Open Vue template from path.
 * - Converts children and props into AST data.
 * @param {String} filepath - Path to Vue file.
 * @returns {Promise}
 */
function convertTemplate(filepath) {
  return new Promise(async(resolve, reject) => {
    try {
      const file = await fs.readFile(filepath, 'utf-8')
      const astData = parse(file)

      const templateData = astData.descriptor.template.ast
      delete templateData.loc

      const children = templateData.children.filter((child) => {
        return !child.content
      })

      const data = {
        template: {
          children,
          props: templateData.props,
          tag: templateData.tag,
        },
      }

      // Convert <script> tag data using Acorn
      // https://astexplorer.net/

      resolve(data)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export API.
 */
module.exports = {
  convertTemplate,
}
