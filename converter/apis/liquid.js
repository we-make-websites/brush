/**
 * API: Liquid
 * -----------------------------------------------------------------------------
 * Functions to build Liquid from AST data.
 *
 */

/**
 * Build Liquid template from AST data.
 * @param {Object} astData - AST data.
 * @returns {Promise}
 */
function buildTemplate(astData) {
  return new Promise((resolve, reject) => {
    try {
      const template = templateSync(astData.template.children)
      resolve(template)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Walk through template children.
 * @param {Array} children - AST data children.
 */
function *templateSync(children) {
  for (const child of children) {
    yield child

    if (!child.children?.length) {
      continue
    }

    yield* templateSync(child.children)
  }
}

/**
 * Export API.
 */
module.exports = {
  buildTemplate,
}
