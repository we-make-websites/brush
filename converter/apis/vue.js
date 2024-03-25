/**
 * API: Vue
 * -----------------------------------------------------------------------------
 * Functions to convert Vue template.
 *
 */
const fs = require('fs-extra')
const { parse } = require('@vue/compiler-sfc')

/**
 * Convert Vue template into AST data.
 * @param {String} filepath - Path to Vue file.
 * @returns {Promise}
 */
function convertTemplate(filepath) {
  return new Promise(async(resolve, reject) => {
    try {
      const file = await fs.readFile(filepath, 'utf-8')
      const astData = parse(file)

      if (!astData.descriptor.template) {
        resolve(false)
        return
      }

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

      resolve(data)

    } catch (error) {
      const errorMessage = {
        api: 'vue',
        error,
        filepath,
      }

      reject(errorMessage)
    }
  })
}

/**
 * Export API.
 */
module.exports = {
  convertTemplate,
}
