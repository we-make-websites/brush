/**
 * API: Liquid
 * -----------------------------------------------------------------------------
 * Functions to build Liquid from AST data.
 *
 */
const convertToSnakeCase = require('../helpers/convert')
const getValidHtmlTag = require('../helpers/get-valid-html-tag')

/**
 * Set variables.
 */
const globalLiquidAssign = []
const globalLiquidCapture = []

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
      buildGlobalLiquid(template)
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

      value = buildPropValue({
        liquidOutput: false,
        prop,
        propName: name,
        snippet,
        tag: element.tag,
      })
    }

    /**
     * Handle v-if, v-else, and v-else-if.
     */
    if (prop.name === 'if') {
      // TODO: Handle other conditions
      data.liquid = {
        end: '{% endif %}',
        start: buildPropValue({
          condition: 'if',
          liquidOutput: true,
          prop,
          propName: name,
          snippet,
          tag: element.tag,
        }),
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
      value = buildPropValue({
        liquidOutput: true,
        prop,
        propName: name,
        snippet,
        tag: element.tag,
      })

      data[name] = value
      continue
    }

    data.props[name] = value
  }

  return data
}

/**
 * Build prop value.
 * @param {String} [condition] - v-if, v-else, or v-else-if condition.
 * @param {Boolean} [liquidOutput] - Output Liquid tags.
 * @param {Object} prop - Prop object from AST data.
 * @param {String} propName - Standard name of prop.
 * @param {Boolean} [snippet] - Prop of Liquid render snippet.
 * @param {String} tag - Element tag.
 * @returns {String}
 */
function buildPropValue({
  condition,
  liquidOutput = false,
  prop,
  propName,
  snippet = false,
  tag,
} = {}) {
  let value = prop.exp.content
    // Optional chaining
    .replaceAll('?.', '.')
    // Conditions
    .replaceAll('||', 'or')
    .replaceAll('&&', 'and')
    .replaceAll('===', '==')
    // Template literals
    .replaceAll('`', '')
    .replaceAll(/\${(?<value>.+?)}/g, (_, $1) => $1)
    // $variable()
    .replaceAll(/\$variable\((?<value>.+?)\)/g, (_, $1) => handleVariable($1, snippet))

  // TODO: Handle $string in template literal
  if (value.includes('$string')) {
    return handleString(value, snippet)
  }

  /**
   * Convert values to snake_case, ignoring strings and maths.
   */
  value = value.replace(/(?<value>['a-z_A-Z0-9]+)/g, (_, $1) => {
    if ($1.includes('\'')) {
      return $1
    }

    return convertToSnakeCase($1)
  })

  if (condition) {
    return `{% ${condition} ${value} %}`
  }

  /**
   * Build global Liquid variable for $variable() and $string().
   */
  if (prop.exp.content.includes('$variable') && snippet) {
    const variable = `${tag}_${propName}_variable`

    globalLiquidCapture.push(`{%- capture ${variable} -%}`)
    globalLiquidCapture.push(`  ${value}`)
    globalLiquidCapture.push('{%- endcapture -%}\n')
    return variable
  }

  return liquidOutput ? `{{ ${value} }}` : value
}

/**
 * Handle $string value.
 * @param {String} value - Prop value.
 * @param {Boolean} snippet - Prop of Liquid render snippet.
 * @returns {String}
 */
function handleString(value, snippet) {
  const localePath = value
    .match(/'[a-z0-9._]+'[),]/g)[0]
    .replace(/[,)]/g, '')

  const translate = []

  /**
   * Go through pluralise and replace and convert to translate filters.
   */
  if (value.includes('pluralise:')) {
    const pluralise = value.matchAll(/pluralise: (?<value>.[a-z0-9._]+)/gs)
    let pluraliseValue = false

    for (const match of pluralise) {
      pluraliseValue = match.groups.value
    }

    translate.push(`count: ${pluraliseValue}`)
  }

  if (value.includes('replace:')) {
    const replace = value.matchAll(/replace: {(?<value>.[a-z0-9._:\s]+)}/gs)
    let replaceValue = false

    for (const match of replace) {
      replaceValue = match.groups.value
    }

    replaceValue.split(',').forEach((property) => {
      const key = property.split(':')[0].trim()
      const propertyValue = property.split(':')[1].trim()

      translate.push(`${key}: ${propertyValue}`)
    })
  }

  /**
   * Make unique.
   */
  const uniqueTranslate = []

  if (translate.length) {
    translate.forEach((item) => {
      if (uniqueTranslate.includes(item)) {
        return
      }

      uniqueTranslate.push(item)
    })
  }

  const liquidObject = uniqueTranslate.length
    ? `${localePath} | t: ${uniqueTranslate.join(', ')}`
    : `${localePath} | t`

  /**
   * If Liquid snippet add variable to global Liquid.
   */
  if (snippet) {
    const variable = `${convertToSnakeCase(localePath)}_string`
    globalLiquidAssign.push(`assign ${variable} = ${liquidObject}`)
    return variable
  }

  return `{{ ${liquidObject} }}`
}

/**
 * Handle $variable value.
 * @param {String} value - Prop value.
 * @returns {String}
 */
function handleVariable(value) {
  return `{{ ${value.replaceAll('\'', '')} }}`
}

/**
 * Build global Liquid assign and capture.
 * @param {Array} template - Template array to push into.
 */
function buildGlobalLiquid(template) {
  if (!globalLiquidAssign.length) {
    return
  }

  template.push('{%- liquid')

  globalLiquidAssign.forEach((entry) => {
    template.push(`  ${entry}`)
  })

  template.push('-%}\n')

  globalLiquidCapture.forEach((entry) => {
    template.push(entry)
  })
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

      if (
        !(previousElementSingleProp && !previousElement.children.length) ||
        previousElement.content
      ) {
        template.push('')
      }
    }

    /**
     * Push template to array.
    */
    const parts = getElementTemplateParts(element, level)

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
 * Get parts of each element template.
 * @param {Object} element - Element Liquid AST data.
 * @param {Number} level - Level of indent.
 * @returns {Object}
 */
function getElementTemplateParts(element, level) {
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
