/**
 * API: Liquid
 * -----------------------------------------------------------------------------
 * Functions to build Liquid from AST data.
 *
 */
const convertToSnakeCase = require('../helpers/convert')

/**
 * Build Liquid template from AST data.
 * @param {Object} astData - AST data.
 * @returns {Promise}
 */
function buildTemplate(astData) {
  return new Promise((resolve, reject) => {
    try {
      const liquidAst = templateSync(astData.template.children)
      const template = buildLiquidTemplate(liquidAst)
      resolve(template)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Walk through template children recursively.
 * @param {Array} children - AST data children.
 */
function *templateSync(children) {
  for (const child of children) {
    yield convertToLiquidAst(child)

    if (!child.children?.length) {
      continue
    }

    yield* templateSync(child.children)
  }
}

/**
 * Convert AST data to Liquid arrays.
 * @param {Object} element - Element to build.
 * @returns {Array}
 */
function convertToLiquidAst(element) {
  if (!element.tag) {
    return ''
  }

  // TODO: Expand to all standard HTML elements
  const snippet = !['div', 'span', 'p', 'a', 'h1', 'h2'].includes(element.tag)

  const data = {
    props: {},
    snippet,
    tag: element.tag,
  }

  for (const prop of element.props) {
    let name = prop.name === 'bind'
      ? prop.arg.content
      : prop.name

    if (prop.name === 'on') {
      continue
    }

    let value = snippet
      ? `'${prop.value?.content}'`
      : prop.value?.content

    /**
     * Handle v-bind/:bind props.
     */
    if (prop.name === 'bind') {
      if (name === 'class') {
        continue
      }

      if (snippet) {
        name = convertToSnakeCase(name)
      }

      value = buildPropValue(prop, false)
    }

    /**
     * Handle v-text and v-html props.
     */
    if (prop.name === 'text' || prop.name === 'html') {
      name = 'content'
      value = buildPropValue(prop, true)

      data[name] = value
      continue
    }

    data.props[name] = value
  }

  return data
}

/**
 * Build prop value.
 * @param {Object} prop - Prop object from AST data.
 * @param {Boolean} liquid - If it's a Liquid snippet.
 * @returns {String}
 */
function buildPropValue(prop, liquid) {
  let value = prop.exp.content.replaceAll('?.', '.')

  if (value.includes('===')) {
    return true
  }

  if (value.includes('||')) {
    value = value
      .split('||')[0]
      .trim()
  }

  value = value
    .split('.')
    .map((part) => convertToSnakeCase(part))
    .join('.')

  if (liquid) {
    value = `{{ ${value} }}`
  }

  return value
}

/**
 * Build Liquid template.
 * @param {Array} elements - Liquid AST elements data.
 */
function buildLiquidTemplate(elements) {
  let template = ''

  for (const element of elements) {

    if (!element) {
      template += '\n'
      continue
    }

    const singleProp = Object.keys(element.props).length === 1
    const innerNewline = singleProp ? '' : '\n'
    const innerIndent = singleProp ? ' ' : '  '

    const renderStart = (tag) => {
      return element.snippet
        ? `{% render '${tag}' with${innerNewline}`
        : `<${tag}${innerNewline}`
    }

    const propEquals = element.snippet ? ': ' : '="'
    let propLineEnd = element.snippet ? ',\n' : `"\n`

    if (singleProp) {
      propLineEnd = element.snippet ? ' ' : '"'
    }

    const renderEnd = element.snippet ? '%}\n' : '>\n'

    const renderProps = (props) => {
      let propTemplate = ''

      Object.entries(props).forEach(([key, value]) => {
        if (!value) {
          propTemplate += `${innerIndent}${key}\n`
          return
        }

        propTemplate += `${innerIndent}${key}${propEquals}${value}${propLineEnd}`
      })

      return propTemplate
    }

    template += renderStart(element.tag)
    template += renderProps(element.props)
    template += renderEnd

    if (element.content) {
      template += `  ${element.content}`
    }
  }

  return template
}

/**
 * Export API.
 */
module.exports = {
  buildTemplate,
}
