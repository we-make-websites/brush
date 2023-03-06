/**
 * API: Variables
 * -----------------------------------------------------------------------------
 * Functions to convert properties into variables and build.
 *
 */
const fs = require('fs-extra')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const convertCamelCaseToTitleCase = require('../helpers/convert-camelcase-to-title-case')
const convertStringToHandle = require('../helpers/convert-string-to-handle')
const formatAlias = require('../helpers/format-alias')
const getDesignConfig = require('../helpers/get-design-config')
const hexRgb = require('../helpers/hex-rgb')
const isExcludedAndNotIncluded = require('../helpers/is-excluded-not-included')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv
const config = getDesignConfig()
let baseScale = 16

/**
 * Find variables and push formatted variable object into object.
 * @param {Array} tokens - tokens.json file.
 * @returns {Object}
 */
function findVariables(tokens) {
  let variables = {}

  /**
   * Set base scale for rem conversion based on config.
   */
  if (config.special.baseScale && config.special.baseScale.includes('.')) {
    const parts = config.special.baseScale.split('.')
    baseScale = Number(tokens[parts[0]][parts[1]].value)
  } else if (config.special.baseScale) {
    baseScale = Number(tokens[config.special.baseScale].value)
  }

  /**
   * Add baseline line height if it doesn't exist in line height object.
   */
  if (
    config.special.lineHeight &&
    tokens[config.special.lineHeight] &&
    !tokens[config.special.lineHeight].baseline
  ) {
    tokens[config.special.lineHeight].baseline = {
      value: '100%',
      type: 'lineHeights',
    }
  }

  /**
   * Find variables by name and type.
   */
  config.variablesByName.forEach((name) => findVariableByName(name, tokens, variables))
  config.variablesByType.forEach((type) => findVariableByType(type, tokens, variables))

  /**
   * Sort variable objects in array.
   */
  const presortingVariables = variables
  const sortedKeys = Object.keys(presortingVariables).sort()
  variables = {}

  sortedKeys.forEach((key) => {
    variables[key] = presortingVariables[key]
  })

  /**
   * Sort variables to match sorting config.
   * - If in sorting config then sort alphabetically by default.
   * - If type has an array then match the sorting of that.
   */
  Object.entries(config.sorting).forEach(([name, value]) => {
    if (!variables[name]) {
      return
    }

    variables[name] = variables[name].sort((a, b) => {
      if (Array.isArray(value)) {
        return value.indexOf(a.name) - value.indexOf(b.name)
      }

      return a.variable.localeCompare(b.variable)
    })
  })

  /**
   * Go through variables object to replace aliases with values.
   */
  Object.entries(variables).forEach(([key, values]) => {
    values.forEach((variable, index) => {
      replaceAlias({ key, index, values, variable, variables })
    })
  })

  /**
   * Return object.
   */
  return variables
}

/**
 * Find variable by name.
 * @param {String} name - Name of object to find.
 * @param {Array} tokens - tokens.json file.
 * @param {Object} variables - Formatted variables.
 */
function findVariableByName(name, tokens, variables) {
  let formattedName = name

  const matchingKey = Object.keys(tokens).find((key) => {
    return convertStringToHandle(key, config) === formattedName
  })

  const objectToSearch = tokens[matchingKey]

  /**
   * If variable doesn't exist then ignore.
   */
  if (!objectToSearch) {
    return
  }

  formattedName = renameVariable(formattedName)

  /**
   * Create array in variables object for type.
   */
  if (!variables[formattedName]) {
    variables[formattedName] = []
  }

  /**
   * Iterate over type object to create array of formatted objects.
   */
  Object.entries(objectToSearch).forEach(([key, value]) => {
    variables[formattedName].push(
      formatVariable({ name: key, type: formattedName, value }),
    )
  })
}

/**
 * Find variable by type.
 * @param {String} type - Type of object to find.
 * @param {Array} tokens - tokens.json file.
 * @param {Object} variables - Formatted variables.
 */
function findVariableByType(type, tokens, variables) {
  let formattedType = type
  const objects = []

  Object.entries(tokens).forEach(([name, object]) => {
    if (object.type === formattedType) {
      objects.push({
        group: false,
        name,
        ...object,
      })
    }

    Object.entries(object).forEach(([subName, subObject]) => {
      if (subObject.type !== formattedType) {
        return
      }

      objects.push({
        group: name,
        name: subName,
        ...subObject,
      })
    })
  })

  /**
   * If type doesn't much any objects then ignore.
   */
  if (!objects.length) {
    return
  }

  formattedType = renameVariable(formattedType)

  /**
   * Create array in variables object for type.
   */
  if (!variables[formattedType]) {
    variables[formattedType] = []
  }

  /**
   * Iterate over objects and format variable.
   */
  objects.forEach((object) => {
    variables[formattedType].push(
      formatVariable({ name: object.name, type: formattedType, value: object }),
    )
  })
}

/**
 * Rename type if in rename variables config.
 * @param {String} type - Type (or name) to rename.
 * @returns {String}
 */
function renameVariable(type) {
  return config.renameVariable[type] ? config.renameVariable[type] : type
}

/**
 * Replaces aliases with actual colour value.
 * @param {String} key - Variable's group key.
 * @param {Number} index - Index of variable in variable's group.
 * @param {Object} [previousMatch] - Previous variable match if alias.
 * @param {Array} values - Array of other values in variable's group.
 * @param {Object} variable - Variable object.
 * @param {Array} variables - Formatted variables object.
 */
function replaceAlias({
  key,
  index,
  previousMatch = false,
  values,
  variable,
  variables,
} = {}) {
  const object = previousMatch || variable

  if (
    typeof object.value !== 'string' ||
    !object.value.includes('{')
  ) {
    return
  }

  /**
   * Find matching value in same values object.
   */
  const match = values.find((valueObject) => {
    let name = valueObject.name

    if (valueObject.group) {
      name = `${valueObject.group}${config.delimiter}${valueObject.name}`
    }

    return name === formatAlias(object, config)
  })

  if (!match) {
    return
  }

  /**
   * If match is an alias itself then find original value using current match as
   * the starting point.
   */
  if (match.value.includes('{')) {
    replaceAlias({
      key,
      index,
      previousMatch: match,
      values,
      variable,
      variables,
    })

    return
  }

  /**
   * Update variable.
   * - Use original alias name for alias field.
   */
  variables[key][index] = {
    ...variable,
    alias: formatAlias(variable, config),
    original: match.original,
    unit: match.unit,
    value: match.value,
  }
}

/**
 * Format property into variable object.
 * - Convert pixel value to rem where applicable.
 * @param {String} name - Object name/key (e.g. 'xs').
 * @param {String} type - Type of property (e.g. 'breakpoint').
 * @param {Object} value - Object values.
 */
function formatVariable({ name, type, value: valueObject }) {
  let unit = ''
  let { original, value } = convertValue(valueObject, type)

  /**
   * If property has associated unit, add it.
   * - If value is string and contains '%' then don't set unit.
   * - If value is a string with 'px' then convert to number.
   * - Convert AUTO to auto for line heights.
   */
  if (typeof value === 'string') {
    if (value.includes('%')) {
      unit = ''
    } else if (value.includes('px')) {
      value = Number(value.replaceAll('px', ''))
    } else if (value === 'AUTO') {
      value = value.toLowerCase()
    }
  }

  /**
   * Set unit for colours.
   */
  if (config.units[type] && config.units[type] !== 'rgb') {
    unit = config.units[type]
  }

  /**
   * Create variable name.
   */
  const variable = convertPropertyNameToVariable({ group: valueObject.group, name, type })

  /**
   * Special behaviours.
   */
  let fontStack = ''

  switch (type) {
    case config.special.fontFamily:
      value = `'${value.replace(/'/g, '')}'`
      fontStack = valueObject.description || config.fontStacks[variable.replace('--', '')]
      value = fontStack ? `${value}, ${fontStack}` : `${value}`
      break

    case config.special.fontWeight:
      if (typeof value === 'string') {
        value = config.fontWeights[value.toLowerCase().replaceAll('\'', '')]
      }
      break
  }

  return {
    description: valueObject.description,
    group: valueObject.group,
    name: name.toLowerCase(),
    original,
    unit,
    value,
    variable,
  }
}

/**
 * Convert values based on config.
 * @param {Object} valueObject - Object containing value.
 * @param {String} type - Type of property (e.g. 'breakpoint').
 * @return {Object}
 */
function convertValue(valueObject, type) {
  let original = false
  let value = valueObject.value

  /**
   * If value has spaces then wrap in quotations.
   * - Unless it's a color or easing type variable.
   */
  if (
    typeof value === 'string' &&
    value.includes(' ') &&
    type !== config.special.color &&
    type !== config.special.easing
  ) {
    value = `'${value}'`
  }

  /**
   * Convert arrays/objects to combined value.
   */
  if (typeof value === 'object') {
    if (!Array.isArray(value)) {
      value = [value]
    }

    let combinedValue = []
    let originalCombinedValue = []

    value.forEach((object) => {
      const blur = object.blur > 0 ? `${object.blur}px` : object.blur
      const colour = config.units[type] === 'rgb' ? hexRgb(object.color) : object.color
      const hOffset = object.x > 0 ? `${object.x}px` : object.x
      const spread = object.spread > 0 ? `${object.spread}px` : object.spread
      const vOffset = object.y > 0 ? `${object.y}px` : object.y

      combinedValue.push(`${hOffset} ${vOffset} ${blur} ${spread} ${colour}`)
      originalCombinedValue.push(`${hOffset} ${vOffset} ${blur} ${spread} ${object.color}`)
    })

    combinedValue = combinedValue.join(', ')
    originalCombinedValue = originalCombinedValue.join(', ')

    if (combinedValue !== originalCombinedValue) {
      original = {
        unit: '',
        value: originalCombinedValue,
      }
    }

    value = combinedValue
  }

  /**
   * Convert pixel numbers to rem values.
   */
  if (!isNaN(value)) {
    value = Number(value)

    if (config.units[type] === 'rem') {
      original = {
        unit: 'px',
        value,
      }

      if (value !== 0) {
        value /= baseScale
      }
    }
  }

  /**
   * Convert hexadecimal to rgba.
   */
  if (
    typeof value === 'string' &&
    value.match(/#[abcdef0-9]{3,8}/gi) &&
    config.units[type] === 'rgb'
  ) {
    original = {
      unit: '',
      value: value.toLowerCase(),
    }

    value = value.replace(
      /(?<colour>#[abcdef0-9]{3,8})/gi,
      (_, $1) => {
        return hexRgb($1)
      },
    )
  }

  /**
   * Return values.
   */
  return {
    original,
    value,
  }
}

/**
 * Convert property name to variable.
 * @param {String} group - Containing object name (e.g. 'brand').
 * @param {String} name - Object name/key (e.g. 'xs').
 * @param {String} type - Type of property (e.g. 'breakpoint').
 * @returns {String}
 */
function convertPropertyNameToVariable({ group = false, name, type } = {}) {
  let nameHandle = convertStringToHandle(name, config)
  const typeHandle = convertStringToHandle(type, config)

  if (group) {
    const renamedGroup = config.renameVariable[group]
      ? config.renameVariable[group]
      : group

    nameHandle = `${convertStringToHandle(renamedGroup, config)}${config.delimiter}${nameHandle}`
  }

  /**
   * Ensure repeated words are not next to each other in variable name.
   * - E.g. 'color-color-#` or `font-family-font-family-body`.
   */
  let variable = `${typeHandle}${config.delimiter}${nameHandle}`

  if (
    typeHandle === nameHandle ||
    nameHandle.includes(`${typeHandle}${config.delimiter}`)
  ) {
    variable = nameHandle
  }

  /**
   * Return variable name.
   */
  return `${config.cssPrefix}${variable}`
}

/**
 * Build variables stylesheet content.
 * @param {Object} variables - Converted variables object.
 * @param {Object} stylesheet - Stylesheet object.
 * @returns {String}
 */
function buildStyles(variables, stylesheet) {
  let folder = stylesheet.path
    .split(path.sep)
    .reverse()[0]

  folder = `${folder.slice(0, 1).toUpperCase()}${folder.slice(1)}`
  folder = folder.slice(-1) === 's' ? folder.slice(0, -1) : folder

  let content = `/**\n * ${folder}: ${stylesheet.name}\n * -----------------------------------------------------------------------------\n * Automatically generated by \`design\` command, do not edit.\n *\n */\n`
  content += '// stylelint-disable\n\n'
  content += getStylesTemplate(variables, stylesheet)

  return content
}

/**
 * Generates :root declaration containing CSS variables.
 * @param {Object} variables - Converted variables object.
 * @param {Object} stylesheet - Stylesheet object.
 * @returns {String}
 */
function getStylesTemplate(variables, stylesheet) {
  const sassStylesheet = stylesheet.type === 'sass'
  const outputSpacing = sassStylesheet ? '' : '  '
  let content = ''
  let count = 0

  if (!sassStylesheet) {
    content += ':root {\n\n'
  }

  /**
   * Iterate through all variables.
   */
  Object.entries(variables).forEach(([key, value], index) => {
    if (
      config.replaceVariableWithValue.includes(key) ||
      isExcludedAndNotIncluded(key, stylesheet)
    ) {
      return
    }

    count++
    content += `${outputSpacing}// ${convertCamelCaseToTitleCase(key)}\n`

    /**
     * Output special $mq-breakpoints object for breakpoints.
     */
    if (sassStylesheet && key === config.special.breakpoint) {
      content += getBreakpointStylesTemplate(value)
    }

    /**
     * Output each variable's values.
     */
    value.forEach(({ original, unit, value: singleValue, variable }) => {
      const outputUnit = singleValue === 0 ? '' : unit

      /**
       * Output SASS variable for SASS stylesheet.
       */
      const outputVariable = sassStylesheet
        ? variable.replace(config.cssPrefix, '$')
        : variable

      content += `${outputSpacing}${outputVariable}: ${singleValue}${outputUnit};`

      /**
       * Add original value as comment if it exists.
       */
      if (original) {
        content += ` // ${original.value}${original.unit}`
      }

      content += '\n'
    })

    /**
     * Early return to prevent excess newlines.
     */
    if (
      index === (Object.entries(variables).length - 1) ||
      (stylesheet.include.length && count === stylesheet.include.length)
    ) {
      return
    }

    content += '\n'
  })

  /**
   * Add extra values for critical stylesheet.
   */
  if (stylesheet.handle === 'variables-critical') {
    content += `\n${outputSpacing}// Default\n`
    content += `${outputSpacing}--menu-drawer-height: calc(var(--viewport-height) - var(--header-visible-height));\n`
    content += `${outputSpacing}--viewport-height: 100vh;\n`
  }

  if (!sassStylesheet) {
    content += '}\n'
  }

  return content
}

/**
 * Generates $mq-breakpoints and imports 'sass-mq'.
 * @param {Array} breakpoints - Array of breakpoint properties.
 * @returns {String}
 */
function getBreakpointStylesTemplate(breakpoints) {
  let content = '@import \'sass-mq\';\n\n'

  content += '$mq-breakpoints: (\n'

  breakpoints.forEach(({ name, original, unit, value }, index) => {
    const comma = index === (breakpoints.length - 1) ? '' : ','
    const outputUnit = original ? original.unit : unit
    let sanitisedName = name

    /**
     * If name starts with number then wrap in quotations.
     */
    if (name.slice(0, 1).match(/\d/g)) {
      sanitisedName = `'${name}'`
    }

    content += original
      ? `  ${sanitisedName}: ${original.value}${outputUnit}${comma}\n`
      : `  ${sanitisedName}: ${value}${outputUnit}${comma}\n`
  })

  content += ');\n\n'

  return content
}

/**
 * Build variables script files from templates.
 * @param {Object} variables - Converted variables object.
 * @returns {Promise}
 */
async function buildScripts(variables) {
  const templatesQueue = []

  config.scripts.forEach((script) => {
    templatesQueue.push(getScriptTemplate(script.property, variables))
  })

  const templates = await Promise.all(templatesQueue)
  const fileQueue = []

  templates.forEach((template, index) => {
    const script = config.scripts[index]

    const filepath = argv.path
      ? path.resolve(argv.path, `${script.filename}.js`)
      : path.resolve(Paths.scripts.config, `${script.filename}.js`)

    fileQueue.push(fs.writeFile(filepath, template, 'utf-8'))
  })

  await Promise.all(fileQueue)

  return new Promise((resolve) => {
    resolve()
  })
}

/**
 * Loads templates and updates with variables.
 * @param {String} type - Type of property and template to use.
 * @param {Object} variables - Converted variables object.
 * @returns {Promise}
 */
function getScriptTemplate(type, variables) {
  return new Promise(async(resolve, reject) => {
    try {
      const internalFilepath = path.join(Paths.templates.internal, `${type}.ejs`)
      const projectFilepath = path.join(Paths.templates.project, `${type}.ejs`)

      const templatePath = fs.existsSync(projectFilepath)
        ? projectFilepath
        : internalFilepath

      let template = await fs.readFile(templatePath, 'utf-8')

      if (!variables[type]) {
        resolve(template)
        return
      }

      template = template
        .replace(
          'WarningMessage',
          'Automatically generated by `design` command, do not edit',
        )
        .replace(
          /<%= repeat %>(?<group>.*)/g,
          (_, $1) => {
            const items = variables[type].length
            const array = Array(...Array(items))

            const output = array.map((__, index) => {
              const object = variables[type][index]

              let dotNotation = `.${object.name}`
              let name = object.name
              let unit = object.unit
              let value = object.value

              /**
               * Include original value and unit if converted.
               */
              if (object.original) {
                unit = object.original.unit
                value = object.original.value
              }

              /**
               * If name starts with number then wrap in quotations.
               */
              if (name.slice(0, 1).match(/\d/g)) {
                dotNotation = `['${object.name}']`
                name = `'${object.name}'`
              }

              /**
               * Convert template string.
               */
              const string = $1
                .replaceAll('<%= dotNotation %>', dotNotation)
                .replaceAll('<%= name %>', name)
                .replaceAll('<%= unit %>', unit)
                .replaceAll('<%= value %>', value)

              return index ? `  ${string}` : string
            })

            return output.join('\n')
          },
        )

      resolve(template)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export API.
 */
module.exports = {
  buildScripts,
  buildStyles,
  convertPropertyNameToVariable,
  findVariables,
}
