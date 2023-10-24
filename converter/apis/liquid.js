/**
 * API: Liquid
 * -----------------------------------------------------------------------------
 * Functions to build Liquid from AST data.
 *
 */
const convertToSnakeCase = require('../helpers/convert')
const getValidHtmlTag = require('../helpers/get-valid-html-tag')

/**
 * Build Liquid template from AST data.
 * @param {Object} astData - AST data.
 * @returns {Promise}
 */
function buildTemplate(astData) {
  return new Promise((resolve, reject) => {
    try {
      const liquidAst = []
      templateSync(astData.template.children, liquidAst)
      const template = []
      buildLiquidTemplate(liquidAst, template)

      resolve(template.join('\n'))

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Walk through template children recursively.
 * @param {Array} children - AST data children.
 * @param {Array} [array] - Array to push into.
 * @returns {Object}
 */
function templateSync(children, array) {
  children.forEach((child, index) => {
    array.push(convertToLiquidAst(child))

    if (!child.children?.length) {
      return
    }

    templateSync(child.children, array[index].children)
  })
}

/**
 * Convert AST data to Liquid arrays.
 * @param {Object} element - Element to build.
 * @returns {Array}
 */
function convertToLiquidAst(element) {
  if (!element.tag) {
    return false
  }

  const snippet = !getValidHtmlTag(element.tag)

  const data = {
    children: [],
    liquid: false,
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
     * Handle v-if, v-else, and v-else-if.
     */
    if (prop.name === 'if') {
      // TODO: Handle other conditions
      data.liquid = {
        end: '{% endif %}',
        start: buildPropValue(prop, true, 'if'),
      }

      continue
    }

    // TODO: Handle <template> element
    // TODO: Handle v-for

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
 * @param {String} [condition] - v-if, v-else, or v-else-if condition.
 * @returns {String}
 */
function buildPropValue(prop, liquid, condition) {
  // TODO: Get $variable and $string values
  // TODO: Handle maths symbols (e.g. >)
  let value = prop.exp.content.replaceAll('?.', '.')

  if (value.includes('||')) {
    value = value
      .split('||')[0]
      .trim()
  }

  if (value.includes('===')) {
    return true
  }

  value = value
    .split('.')
    .map((part) => convertToSnakeCase(part))
    .join('.')

  if (condition) {
    return `{% ${condition} ${value} %}`
  }

  if (liquid) {
    return `{{ ${value} }}`
  }

  return value
}

/**
 * Build Liquid template.
 * @param {Array} elements - Liquid AST elements data.
 * @param {Array} template - Template array to push into.
 * @param {Number} level - Level of indent.
 */
function buildLiquidTemplate(elements, template, level = 0) {
  let previousElement = false

  for (const element of elements) {
    if (!element) {
      continue
    }

    /**
     * Add newline to separate multi-line previous element.
     */
    if (previousElement) {
      const previousElementSingleProp = Object.keys(previousElement.props).length === 1

      if (!(previousElementSingleProp && !previousElement.children.length)) {
        template.push('')
      }
    }

    /**
     * Push template to array.
    */
    const parts = getParts(element, level)

    if (element.liquid) {
      template.push(parts.liquid.start)
    }

    template.push(`${parts.openTagStart}${parts.attributes}${parts.openTagEnd}`)

    if (element.content) {
      template.push(parts.content)
    }

    if (element.children) {
      const newLevel = element.liquid ? level + 2 : level + 1
      buildLiquidTemplate(element.children, template, newLevel)
    }

    previousElement = element

    if (!element.snippet) {
      template.push(parts.closeTag)
    }

    if (element.liquid) {
      template.push(parts.liquid.end)
    }
  }

  return template
}

/**
 * Get parts of each element.
 * @param {Object} element - Element Liquid AST data.
 * @param {Number} level - Level of indent.
 * @returns {Object}
 */
function getParts(element, level) {
  let data = {}
  const singleProp = Object.keys(element.props).length === 1

  /**
   * Build attributes HTML.
   */
  const attributes = Object.entries(element.props).map(([key, value]) => {
    const indent = singleProp ? '' : '  '

    if (!value) {
      return `${indent}${key}`
    }

    return element.snippet
      ? `${indent}${key}: ${value}`
      : `${indent}${key}="${value}"`
  })

  /**
   * Create data objects.
   */
  if (singleProp) {
    data = {
      attributes: attributes.join(''),
      closeTag: `</${element.tag}>`,
      content: `  ${element.content}`,
      liquid: false,
      openTagEnd: element.snippet
        ? ' %}'
        : '>',
      openTagStart: element.snippet
        ? `{% render '${element.tag}' with `
        : `<${element.tag} `,
    }

  } else {
    data = {
      attributes: element.snippet
        ? `${attributes.join(',\n')}\n`
        : `${attributes.join('\n')}\n`,
      closeTag: `</${element.tag}>`,
      content: `  ${element.content}`,
      liquid: false,
      openTagEnd: element.snippet
        ? '%}'
        : '>',
      openTagStart: element.snippet
        ? `{% render '${element.tag}' with\n`
        : `<${element.tag}\n`,
    }
  }

  let currentIndent = Array.from(Array(level * 2)).fill(' ').join('')

  /**
   * Add Liquid.
   * - Increase indent to account for it.
   */
  if (element.liquid) {
    data.liquid = {
      end: `${currentIndent}${element.liquid.end}`,
      start: `${currentIndent}${element.liquid.start}`,
    }

    currentIndent += '  '
  }

  /**
   * Add current indent to data.
   */
  const indentedData = {}

  Object.entries(data).forEach(([key, value]) => {
    switch (key) {
      case 'attributes':
        indentedData[key] = singleProp
          ? value
          : `${currentIndent}${value.replaceAll('\n', `\n${currentIndent}`)}`

        return

      case 'liquid':
        indentedData[key] = value
        return

      case 'openTagEnd':
        indentedData[key] = value
        return

      default:
        indentedData[key] = `${currentIndent}${value}`
    }
  })

  /**
   * Return data.
   */
  return indentedData
}

/**
 * Export API.
 */
module.exports = {
  buildTemplate,
}
