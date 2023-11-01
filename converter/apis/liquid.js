/**
 * API: Liquid
 * -----------------------------------------------------------------------------
 * Functions to build Liquid from AST data.
 *
 */
const handlerApi = require('../apis/handler')

const convertToSnakeCase = require('../helpers/convert')
const config = require('../helpers/config')

/**
 * Set variables.
 */
let globalLiquidAssigns = []
let globalLiquidCaptures = []
let globalLiquidConditionals = []

/**
 * Build Liquid template from AST data.
 * @param {Object} astData - AST data.
 * @param {String} filepath - Path to Vue file.
 * @returns {Promise}
 */
function buildTemplate(astData, filepath) {
  return new Promise((resolve, reject) => {
    try {
      // Clear arrays
      globalLiquidAssigns = []
      globalLiquidCaptures = []
      globalLiquidConditionals = []

      const liquidAst = []
      convertAstToLiquidAst(astData.template.children, liquidAst)
      const template = []
      buildGlobalLiquid(template)
      buildLiquidTemplate(liquidAst, template)

      resolve(`${template.join('\n')}\n`)

    } catch (error) {
      const errorMessage = {
        api: 'liquid',
        error,
        filepath,
      }

      reject(errorMessage)
    }
  })
}

/**
 * Walk through template children recursively and build Liquid AST data.
 * @param {Array} children - AST data children.
 * @param {Array} [array] - Array to push into.
 * @param {Object} parent - Parent element data.
 * @returns {Object}
 */
function convertAstToLiquidAst(children, array, parent) {
  children.forEach((child, index) => {
    array.push(convertToLiquidAst(child, parent))

    if (!child.children?.length || child.tag === 'teleport') {
      return
    }

    convertAstToLiquidAst(child.children, array[index].children, array[index])
  })
}

/**
 * Convert AST data to Liquid arrays.
 * - Don't render any content of a <teleport> as it won't exist in the Liquid.
 * @param {Object} element - Element to build.
 * @param {Object} parent - Parent element data.
 * @returns {Array}
 */
function convertToLiquidAst(element, parent) {
  if (!element.tag || element.tag === 'teleport') {
    return false
  }

  const snippet = !config.validHtmlTags.includes(element.tag)

  const data = {
    // Child elements (each contains the same data object)
    children: [],
    // <component> element
    componentTag: false,
    // Forloop variable of current level or parent
    forloopVariables: parent?.forloopVariables.length
      ? parent.forloopVariables
      : [],
    // Liquid tags to enclose element in
    liquid: false,
    // Props/attributes
    props: {},
    // Non-valid HTML so use {% render %}
    snippet,
    // HTML element (or snippet name)
    tag: element.tag,
  }

  /**
   * Build element props.
   */
  for (const prop of element.props) {
    let name = prop.name === 'bind' && prop.arg?.content
      ? prop.arg.content
      : prop.name

    if (config.noRenderProps.includes(name)) {
      continue
    }

    let value = snippet
      ? `'${prop.value?.content}'`
      : prop.value?.content

    if (!prop.value?.content) {
      value = true
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
            forloopVariables: data.forloopVariables,
            liquidOutput: true,
            prop,
            propName: name,
            snippet,
            tag: element.tag,
          }),
      }

      if (condition === 'for') {
        // TODO: Handle destructured objects
        const scopedVariable = data.liquid.start
          .split(' in ')[0]
          .replace('{% for ', '')
          .trim()

        data.forloopVariables.push(scopedVariable)

        if (data.liquid.start.includes('assign index')) {
          data.forloopVariables.push('index')
        }
      }

      continue
    }

    /**
     * Handle v-bind/:bind props.
     */
    if (prop.name === 'bind') {
      // TODO: Create assign variable for dynamic classes
      // Ignore dynamic classes and styles
      if (config.noRenderBoundProps.includes(name)) {
        continue
      }

      if (snippet) {
        name = convertToSnakeCase(name)
      }

      value = buildPropValue({
        forloopVariables: data.forloopVariables,
        liquidOutput: data.componentTag || !snippet,
        prop,
        propName: name,
        snippet,
        tag: element.tag,
      })
    }

    /**
     * Handle v-text and v-html props.
     */
    if (config.vContent.includes(prop.name)) {
      name = 'content'
      value = buildPropValue({
        forloopVariables: data.forloopVariables,
        liquidOutput: true,
        prop,
        propName: name,
        snippet,
        tag: element.tag,
      })

      data[name] = value
      continue
    }

    /**
     * Add <slot> name prop to Liquid assigns.
     */
    if (element.tag === 'slot' && name === 'name') {
      const snakeCaseName = convertToSnakeCase(value)
      globalLiquidAssigns.push(`assign ${snakeCaseName} = 'TODO'`)
    }

    data.props[name] = value
  }

  /**
   * Handle <component>.
   */
  if (element.tag === 'component') {
    let name = 'component_element'

    if (data.props.class) {
      let firstClass = data.props.class.split(' ')[0]

      if (firstClass) {
        firstClass = convertToSnakeCase(firstClass)
        name = `${firstClass}_element`
      }
    }

    data.componentTag = true
    data.tag = `{{ ${name} }}`

    // Use :is value if it contains a ternary operator
    if (data.props?.is?.includes(' ? ')) {
      const liquidVariable = name

      handlerApi.ternaryOperators({
        forloopVariables: data.forloopVariables,
        globalLiquidAssigns,
        globalLiquidConditionals,
        liquidVariable,
        snippet: true,
        value: data.props.is,
      })

    // Otherwise use defaults
    } else {
      globalLiquidAssigns.push(`assign ${name} = 'div'`)

      const conditionals = [
        'if CONDITION != blank',
        `  assign ${name} = 'TODO'`,
        'endif',
      ]

      globalLiquidConditionals.push(conditionals)
    }

    // Delete is prop after use
    if (data.props?.is) {
      delete data.props.is
    }
  }

  return data
}

/**
 * Build prop value.
 * @param {String} [condition] - v-if, v-else, or v-else-if condition.
 * @param {Array} [forloopVariables] - Array of variables scoped from forloop on
 * current or parent element.
 * @param {Boolean} [liquidOutput] - Output value in Liquid object tags.
 * @param {Object} prop - Prop object from AST data.
 * @param {String} propName - Standard name of prop.
 * @param {Boolean} [snippet] - Prop of Liquid render snippet, used to determine
 * the template of the attribute.
 * @param {String} tag - Element tag.
 * @returns {String}
 */
function buildPropValue({
  condition,
  forloopVariables = [],
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
    .replaceAll('|| null', '')
    .replaceAll('|| undefined', '')
    .replaceAll('||', 'or')
    .replaceAll('&&', 'and')
    .replaceAll('===', '==')
    .replaceAll('!==', '!=')
    // Template literals
    .replaceAll('`', '')
    .replaceAll(/\${(?<value>.+?)}/g, (_, $1) => $1)
    // Length is called size in Liquid
    .replaceAll('.length', '.size')
    // $variable()
    .replaceAll(/\$variable\((?<value>.+?)\)/g, (_, $1) => {
      return handlerApi.variable($1, condition)
    })
    // Slots
    .replaceAll('$slots.', '')
    // Clean up
    .trim()

  /**
   * Handle other helpers by themselves as we don't expect anything else in the
   * prop value.
   */
  if (value.includes('$string')) {
    return handlerApi.string(value, snippet, globalLiquidAssigns)
  }

  if (value.includes('$formatMoney')) {
    return handlerApi.formatMoney({
      forloopVariables,
      globalLiquidAssigns,
      snippet,
      value,
    })
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

  if (propName === 'is') {
    return value
  }

  /**
   * Handle ternary operators and equal conditions.
   * - Ignore inside v- conditions.
   */
  if (!config.vIfConditionals.includes(condition)) {
    if (value?.includes(' ? ')) {
      if (snippet) {
        const liquidVariable = `${propName}_conditional`

        handlerApi.ternaryOperators({
          forloopVariables,
          globalLiquidAssigns,
          globalLiquidConditionals,
          liquidVariable,
          snippet,
          value,
        })

        value = liquidVariable

      } else {
        value = handlerApi.ternaryOperators({
          forloopVariables,
          globalLiquidAssigns,
          globalLiquidConditionals,
          value,
        })
      }

    } else if (value?.includes('==') || value?.includes('!=')) {
      if (snippet) {
        const liquidVariable = `${propName}_conditional`

        handlerApi.equals({
          globalLiquidAssigns,
          globalLiquidConditionals,
          liquidVariable,
          value,
        })

        value = liquidVariable

      } else {
        value = handlerApi.equals({ value })
      }
    }
  }

  /**
   * Handle and/or condition for snippet props and Liquid output.
   * - Ignore inside v-if conditions.
   */
  if (
    !config.vIfConditionals.includes(condition) &&
    (value.includes(' or ') || value.includes(' and '))
  ) {
    if (liquidOutput) {
      value = value.split(' or ')[0]
      value = value.replaceAll(' and ', ' | append: ')

    } else if (snippet) {
      value = value.split(/ (?:and|or) /g)[0]
    }
  }

  /**
   * Add variable to Liquid assign if it's not a valid Liquid object.
   * - And the variable hasn't been set in a forloop.
   */
  if (
    !value.includes('{{ ') &&
    !value.includes('{% ') &&
    value !== '{}'
  ) {
    let variableToTest = value

    if (condition === 'for') {
      // TODO: Handle destructured objects
      variableToTest = value.split(' of ')[1]
    }

    value = variableToTest.split(' or ').map((variablePart) => {
      return handlerApi.validLiquid({
        condition,
        forloopVariables,
        globalLiquidAssigns,
        part: variablePart,
        value,
      })
    }).join(' or ')

    if (condition === 'for') {
      variableToTest = value.split(' of ')[1]
    } else {
      variableToTest = value
    }

    value = variableToTest.split(' and ').map((variablePart) => {
      return handlerApi.validLiquid({
        condition,
        forloopVariables,
        globalLiquidAssigns,
        part: variablePart,
        value,
      })
    }).join(' and ')
  }

  /**
   * Handle conditional and list rendering.
   */
  if (condition) {
    if (condition === 'for') {
      // TODO: Handle destructured objects
      // line-item
      let conditionString = value
        .replace(/[()]/g, '')
        .replace(' of ', ' in ')

      let assign = ''

      if (conditionString.includes('index')) {
        conditionString = conditionString.replace(', index', '')

        assign = `{% assign index = forloop.index0 %}\n`
      }

      return `{% for ${conditionString} %}${assign}`
    }

    const formattedCondition = condition.replace('else-if', 'elsif')
    let formattedValue = value.replace(/(?:{{\s|\s}})/g, '')

    /**
     * Update condition for Liquid.
     */
    formattedValue = handlerApi.conditions('or', formattedValue)
    formattedValue = handlerApi.conditions('and', formattedValue)

    // TODO: Handle index + 1 != .size (replace with forloop.last)
    return `{% ${formattedCondition} ${formattedValue} %}`
  }

  /**
   * Build global Liquid variable for $variable().
   */
  if (prop.exp.content.includes('$variable') && snippet) {
    const variable = `${tag}_${propName}_variable`

    const capture = [
      `{%- capture ${variable} -%}`,
      `  ${value}`,
      '{%- endcapture -%}\n',
    ]

    globalLiquidCaptures.push(capture)
    return variable
  }

  /**
   * Wrap Liquid output in Liquid object tags.
   */
  if (
    liquidOutput &&
    !value.includes('{{ ') &&
    !value.includes('{% ')
  ) {
    value = `{{ ${value} }}`
  }

  return value
}

/**
 * Build global Liquid assign and capture.
 * @param {Array} template - Template array to push into.
 */
function buildGlobalLiquid(template) {
  if (globalLiquidAssigns.length || globalLiquidConditionals.length) {
    template.push('{%- liquid')
  }

  /**
   * Liquid assigns.
   */
  const assign = sanitiseGlobalLiquid(globalLiquidAssigns, true)

  assign.forEach((entry) => {
    template.push(`  ${entry}`)
  })

  /**
   * Liquid conditionals (array of arrays).
   */
  const conditionals = sanitiseGlobalLiquid(globalLiquidConditionals)

  conditionals.forEach((condition) => {
    template.push('')

    condition.forEach((line) => {
      template.push(`  ${line}`)
    })
  })

  if (globalLiquidAssigns.length || globalLiquidConditionals.length) {
    template.push('-%}\n')
  }

  /**
   * Liquid captures.
   */
  const captures = sanitiseGlobalLiquid(globalLiquidCaptures)

  captures.forEach((capture) => {
    template.push('')

    capture.forEach((line) => {
      template.push(`  ${line}`)
    })
  })
}

/**
 * Sanitise global Liquid arrays.
 * - Checks that entries are unique and sorts.
 * @param {Array} array - Array to sanitise.
 * @param {Boolean} [sort] - Sort array.
 */
function sanitiseGlobalLiquid(array, sort) {
  const unique = []

  const sanitisedArray = array.filter((entry) => {
    const formattedEntry = typeof entry === 'object'
      ? JSON.stringify(entry)
      : entry.split(' = ')[0].replace('assign', '').trim()

    if (unique.includes(formattedEntry)) {
      return false
    }

    unique.push(formattedEntry)
    return true
  })

  if (sort) {
    sanitisedArray.sort()
  }

  return sanitisedArray
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

    // Output name as variable for <slot> tags
    if (element.tag === 'slot') {
      template.push(parts.slotTag)

    // Don't output no render tags
    } else if (!config.noRenderTags.includes(element.tag)) {
      if (parts.openTagEnd) {
        template.push(`${parts.openTagStart}${parts.attributes}${parts.openTagEnd}`)
      } else {
        // Handle no prop elements
        template.push(parts.openTagStart)
      }
    }

    if (element.content && element.tag !== 'slot') {
      template.push(parts.content)
    }

    if (element.children && element.tag !== 'slot') {
      let newLevel = element.liquid ? level + 2 : level + 1

      // As no render tags are not rendered the indent isn't increased
      // Same for <slot> tags
      if (
        config.noRenderTags.includes(element.tag) ||
        element.tag === 'slot'
      ) {
        newLevel = element.liquid ? level + 1 : level
      }

      buildLiquidTemplate(element.children, template, newLevel)
    }

    previousElement = element

    if (!element.snippet && !config.selfClosingTags.includes(element.tag)) {
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

  if (element.tag === 'slot') {
    data.slotTag = `{{ ${convertToSnakeCase(element.props.name)} }}`
  }

  /**
   * Add Liquid.
   */
  if (element.liquid) {
    data.liquid = {
      end: `${currentIndent}${element.liquid.end}`,
      // Handle forloop index which has the assign on the same line
      start: `${currentIndent}${element.liquid.start.replace('%}{%', `%}\n${currentIndent}  {%`)}`,
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
