/**
 * API: Liquid
 * -----------------------------------------------------------------------------
 * Functions to build Liquid from AST data.
 *
 */
const convertToSnakeCase = require('../helpers/convert')
const config = require('../helpers/config')

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

      resolve(`${template.join('\n')}\n`)

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

  const snippet = !config.validHtmlTags.includes(element.tag)

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

    if (config.noRenderProps.includes(name)) {
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
     * Handle conditional and list rendering.
     */
    if (config.vConditionals.includes(prop.name)) {
      const condition = prop.name === 'show'
        ? 'if'
        : prop.name

      data.liquid = {
        condition,
        end: config.vElseConditionals.includes(condition)
          ? '{% endif %}'
          : `{% end${condition} %}`,
        start: condition === 'else'
          ? '{% else %}'
          : buildPropValue({
            condition,
            liquidOutput: true,
            prop,
            propName: name,
            snippet,
            tag: element.tag,
          }),
      }

      continue
    }

    /**
     * Handle v-text and v-html props.
     */
    if (config.VContent.includes(prop.name)) {
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
    .replaceAll(/\$variable\((?<value>.+?)\)/g, (_, $1) => handleVariable($1, condition))

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

  /**
   * Handle conditional and list rendering.
   */
  if (condition) {
    // TODO: Handle (item, index) of ...
    if (condition === 'for') {
      const conditionString = value
        .replace(/[()]/g, '')
        .replace(' of ', ' in ')

      return `{% for ${conditionString} %}`
    }

    const formattedCondition = condition.replace('else-if', 'elsif')
    let formattedValue = value.replace(/(?:{{\s|\s}})/g, '')

    // Handle negative conditions
    if (formattedValue.startsWith('!')) {
      formattedValue = formattedValue.replaceAll(/(?<value>![^\s]+)/g, (_, $1) => {
        return `${$1.replace('!', '')} == false`
      })
    }

    return `{% ${formattedCondition} ${formattedValue} %}`
  }

  /**
   * Build global Liquid variable for $variable().
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
 * @param {Boolean|String} condition - Conditional tag.
 * @returns {String}
 */
function handleVariable(value, condition) {
  const formattedValue = value.replaceAll('\'', '')

  return condition
    ? formattedValue
    : `{{ ${formattedValue} }}`
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
      // Remove last endif if continuing conditional render
      if (
        config.vElseConditionals.includes(element.liquid.condition) &&
        template[template.length - 2].includes('{% endif %}')
      ) {
        template.splice(template.length - 2, 1)
      }

      template.push(parts.liquid.start)
    }

    // Don't output no render tags tags
    if (!config.noRenderTags.includes(element.tag)) {
      if (parts.openTagEnd) {
        template.push(`${parts.openTagStart}${parts.attributes}${parts.openTagEnd}`)
      } else {
        // Handle no prop elements
        template.push(parts.openTagStart)
      }
    }

    if (element.content) {
      template.push(parts.content)
    }

    if (element.children) {
      let newLevel = element.liquid ? level + 2 : level + 1

      // As no render tags are not rendered the indent isn't increased
      if (config.noRenderTags.includes(element.tag)) {
        newLevel = element.liquid ? level + 1 : level
      }

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
  let singleLine = Object.keys(element.props).length === 1
  const noProps = !Object.keys(element.props).length

  /**
   * Determine current and total indent.
   * - Current indent isn't increased until after Liquid tags are rendered.
   * - Total indent is increased before so we can calculate attribute line
   *   length correctly.
   */
  let currentIndent = Array.from(Array(level * 2)).fill(' ').join('')
  let totalIdent = currentIndent

  if (element.liquid) {
    totalIdent += '  '
  }

  /**
   * Build attributes HTML.
   */
  const attributes = Object.entries(element.props).map(([key, value]) => {
    const indent = singleLine ? '' : '  '

    if (!value) {
      return `${indent}${key}`
    }

    const attribute = element.snippet
      ? `${indent}${key}: ${value}`
      : `${indent}${key}="${value}"`

    /**
     * Determine length of line.
     * - If single line then include HTML tag.
     */
    let length = totalIdent.length + attribute.length

    if (singleLine) {
      length += `<${element.tag} >`.length
    }

    /**
     * Break HTML class onto multiple lines if too long.
     */
    if (key === 'class' && !element.snippet && length > 80) {
      singleLine = false
      return `  ${key}="\n    ${value.replaceAll(' ', '\n    ')}\n  "`
    }

    return attribute
  })

  /**
   * Create data objects.
   */
  if (singleLine) {
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
        ? `${attributes.join(',\n')},\n`
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

  if (noProps) {
    data.openTagEnd = false

    data.openTagStart = element.snippet
      ? `{% render '${element.tag}' %}`
      : `<${element.tag}>`
  }

  /**
   * Add Liquid.
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
        indentedData[key] = singleLine
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
