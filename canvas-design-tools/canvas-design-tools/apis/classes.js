/**
 * API: Classes
 * -----------------------------------------------------------------------------
 * Functions to convert tokens into classes and build.
 *
 */
const getDesignConfig = require('../helpers/get-design-config')
const config = getDesignConfig()
const convertCamelCaseToTitleCase = require('../helpers/convert-camelcase-to-title-case')
const convertStringToHandle = require('../helpers/convert-string-to-handle')
const isExcludedAndNotIncluded = require('../helpers/is-excluded-not-included')

/**
 * Find tokens by key and push formatted class object into object.
 * @param {Array} tokens - tokens.json file.
 * @param {Object} variables - Converted variables object.
 * @returns {Object}
 */
function findTokens(tokens, variables) {
  const classes = {}

  /**
   * Go through classes in config.
   */
  config.classes.forEach((type) => {

    /**
     * Create array in classes object for type.
     */
    if (!classes[type]) {
      classes[type] = []
    }

    /**
     * Iterate over type object to create array of formatted objects.
     */
    iterateObject({
      classes,
      object: tokens,
      type,
      variables,
    })
  })

  /**
   * Sort typography into sorting order.
   */
  if (classes.typography && config.sorting.typography) {
    classes.typography = sortTypography(classes.typography)
  }

  /**
   * Return object.
   */
  return classes
}

/**
 * Iterate over object to find entries of a certain type.
 * @param {Array} classes - Formatted classes array.
 * @param {Object} object - Object to iterate over.
 * @param {String} [parent] - If object is nested, its parent's key.
 * @param {String} type - Type to find.
 * @param {Object} variables - Converted variables object.
 */
function iterateObject({ classes, object, parent, type, variables }) {
  Object.entries(object).forEach(([name, value]) => {
    if (!value.type) {
      const newParent = parent ? `${parent}${config.delimiter}${name}` : name

      iterateObject({
        classes,
        object: value,
        parent: newParent,
        type,
        variables,
      })

      return
    }

    if (value.type !== type) {
      return
    }

    classes[type].push(formatClass({
      name,
      parent,
      type,
      value,
      variables,
    }))
  })
}

/**
 * Format token into class object.
 * - Use existing variables for properties where possible.
 * @param {String} name - Object key (e.g. 'xs').
 * @param {Object} value - Object values.
 * @param {String} [parent] - If object is nested, its parent's key.
 * @param {String} type - Type of class.
 * @param {Object} variables - Converted variables object.
 * @returns {Object}
 */
function formatClass({
  name: className,
  parent = false,
  type,
  value: valueObject,
  variables,
}) {
  let properties = formatProperties(valueObject.value, variables)
  properties = properties.sort((a, b) => a.property.localeCompare(b.property))

  return {
    className: convertStringToClassName(className, parent, type),
    description: valueObject.description,
    properties,
  }
}

/**
 * Format class declaration properties.
 * @param {Object} value - Token properties.
 * @param {Object} variables - Converted variables object.
 * @returns {Array}
 */
function formatProperties(value, variables) {

  /**
   * OriginalProperty: fontFamily, textCase etc.
   * Alias: {font-family.sans}, {text-case.none} etc.
   */
  return Object.entries(value).map(([originalProperty, alias]) => {
    const formattedAlias = alias
      .replace(/[{}]/g, '')
      .replace('$', '')
      .split('.')

    const [type, name] = formattedAlias

    /**
     * Exclude if variable isn't in variable configs.
     * - To do this we must first find what it was originally called.
     */
    let nonRenamedType = type

    Object.entries(config.renameVariable).forEach(([originalType, renamedType]) => {
      if (renamedType !== type) {
        return
      }

      nonRenamedType = originalType
    })

    if (
      !config.variablesByName.includes(nonRenamedType) &&
      !config.variablesByType.includes(nonRenamedType)
    ) {
      return false
    }

    const property = config.renameVariable[originalProperty]
      ? config.renameVariable[originalProperty]
      : convertStringToHandle(originalProperty, config)

    /**
     * Find variables object.
     */
    const variableObject = variables[property]?.find((object) => {
      return object.name === name
    })

    if (!variableObject) {
      return false
    }

    /**
     * Use value of CSS variable instead of variable itself if set in config.
     * - Otherwise use CSS variable.
     * - `text-transform: none` is automatically ignored
     */
    const cssValue = config.replaceVariableWithValue.includes(property)
      ? variableObject.value
      : `var(${variableObject.variable})`

    /**
     * Don't return if config excludes property of certain value.
     */
    if (config.excludedPropertyValues?.includes(`${property}: ${cssValue}`)) {
      return false
    }

    return {
      property,
      value: cssValue,
      variable: variableObject,
    }
  }).filter(Boolean)
}

/**
 * Sort typography classes.
 * @param {Array} typography - Typography classes to sort.
 * @returns {Array}
 */
function sortTypography(typography) {
  const groupSorting = Object.keys(config.sorting.typography)

  return typography.sort((a, b) => {
    const aGroup = a.className.replace('text-', '').split('-')[0]
    const bGroup = b.className.replace('text-', '').split('-')[0]

    const aSize = a.className.replace('text-', '').split('-')[1]
    const bSize = b.className.replace('text-', '').split('-')[1]

    const groupSort = groupSorting.indexOf(aGroup) - groupSorting.indexOf(bGroup)

    /**
     * If groups are equal then sort by size.
     */
    if (groupSort === 0 && config.sorting.typography[aGroup]) {
      const sizeSorting = config.sorting.typography[aGroup]
      const aSizeSort = sizeSorting.indexOf(aSize)
      const bSizeSort = sizeSorting.indexOf(bSize)

      /**
       * If either don't exist in sizeSorting then sort alphabetically.
       */
      if (aSizeSort < 0 && bSizeSort < 0) {
        return aSize.localeCompare(bSize)
      }

      return sizeSorting.indexOf(aSize) - sizeSorting.indexOf(bSize)
    }

    /**
     * Sort group.
     */
    return groupSort
  })
}

/**
 * Build classes stylesheet content.
 * @param {Object} classes - Converted classes object.yarn
 * @param {Object} variables - Converted variables object.
 * @param {Object} stylesheet - Stylesheet object.
 * @returns {String}
 */
function buildStyles(classes, variables, stylesheet) {
  let content = '/**\n * Base: Classes\n * -----------------------------------------------------------------------------\n * Automatically generated by `design` command, do not edit.\n *\n */\n'
  content += '// stylelint-disable\n\n'

  /**
   * Add html, body to classes based on config.
   */
  if (
    classes[config.defaultsType] &&
    classes[config.defaultsType][0]?.className !== config.special.htmlBody
  ) {
    const bodyObject = classes[config.defaultsType].find((object) => {
      return hasDefaultClass(object.className, config.defaults.body)
    })

    if (bodyObject) {

      /**
       * Find base scale variable.
       */
      const baseScale = variables[config.special.baseScale.split('.')?.[0]]?.[0]

      /**
       * Replace font size property with base scale variable.
       */
      const fontSize = bodyObject.properties.find((property) => {
        return property.property === config.special.fontSize
      })

      const fontSizeCopy = { ...fontSize }
      fontSizeCopy.value = `var(${baseScale?.variable})`
      fontSizeCopy.variable = baseScale

      /**
       * Update properties array with new font size object.
       */
      const properties = bodyObject.properties.map((property) => {
        if (property.property === config.special.fontSize) {
          return fontSizeCopy
        }

        return property
      })

      /**
       * Add html, body class.
       */
      classes[config.defaultsType].unshift({
        className: config.special.htmlBody,
        description: bodyObject.description,
        properties,
      })
    }
  }

  /**
   * Build CSS declarations.
   */
  Object.entries(classes).forEach(([key, value], index) => {
    if (isExcludedAndNotIncluded(key, stylesheet, config)) {
      return
    }

    content += buildCssDeclarations({ key, stylesheet, value })

    if (index !== (Object.entries(classes).length - 1)) {
      content += '\n'
    }
  })

  /**
   * Add brand colour classes.
   */
  if (stylesheet.handle === 'classes' && config.brandColours) {
    content += buildBrandColours(variables)
  }

  /**
   * Return CSS content.
   */
  return content
}

/**
 * Build CSS declaration objects.
 * - Go through each value, e.g. 'text-body-m' and its properties.
 * @param {String} key - Type of class, e.g. 'text'.
 * @param {Object} stylesheet - Stylesheet object.
 * @param {Array} value - Array of objects containing class, properties etc.
 * @returns {String}
 */
function buildCssDeclarations({ key, stylesheet, value }) {
  let content = `// ${convertCamelCaseToTitleCase(key)}\n`

  value.forEach(({ className, properties }, valueIndex) => {
    if (isExcludedAndNotIncluded(`${key}.${className}`, stylesheet, config)) {
      return
    }

    /**
     * Add extra line to space declarations if not first.
     */
    if (valueIndex !== 0) {
      content += '\n'
    }

    /**
     * Output based on stylesheet handle.
     */
    switch (stylesheet.handle) {
      case 'classes-critical':
        content += buildCriticalStyles({ className, properties })
        break

      case 'classes-mixins':
        content += buildMixinStyles({ className, properties })
        break

      default:
        content += buildDefaultStyles({ className, properties })
        break
    }
  })

  /**
   * Return stylesheet.
   */
  return content
}

/**
 * Build critical stylesheet styles.
 * @param {String} className - Class name of declaration.
 * @param {Array} properties - Array of CSS properties and values.
 * @returns {String}
 */
function buildCriticalStyles({ className, properties }) {
  let content = ''

  let formattedClassName = className.includes(',')
    ? className
    : `.${className}`

  /**
   * Build html, body declaration.
   */
  if (formattedClassName === config.special.htmlBody) {
    content += buildCriticalDefaultDeclaration({
      defaultName: 'body',
      formattedClassName,
      properties,
    })

    return content
  }

  /**
   * Build critical styles that don't have a default class.
   */
  const defaultObject = Object.values(config.defaults).find((defaultClassname) => {
    return hasDefaultClass(className, defaultClassname)
  })

  if (!defaultObject) {
    content += `${formattedClassName} {\n`

    if (className.includes(',')) {
      content += buildCssDeclarationBlock(properties)
    } else {
      content += `  @include ${className};\n}\n`
    }

    return content
  }

  /**
   * Keep track of which defaults have been rendered.
   */
  const defaults = []

  /**
   * Go through each default and see if it's in the class.
   * - Output each default if it exists.
   */
  Object.entries(config.defaults).forEach(([defaultName, defaultClassName]) => {
    if (
      !hasDefaultClass(className, defaultClassName) ||
      defaults.includes(defaultClassName)
    ) {
      return
    }

    if (hasDefaultClass(className, config.defaults.link)) {
      formattedClassName = `a, ${formattedClassName}`
      defaults.push(config.defaults.link)
    }

    if (hasDefaultClass(className, config.defaults.body)) {
      formattedClassName = `p, ${formattedClassName}`
      defaults.push(config.defaults.body)
    }

    content += buildCriticalDefaultDeclaration({
      defaultName,
      formattedClassName,
      properties,
    })
  })

  return content
}

/**
 * Build critical stylesheet default declarations.
 * @param {String} defaultName - Default class name.
 * @param {String} formattedClassName - Declaration class name.
 * @param {Array} properties - Array of CSS properties and values.
 * @returns {String}
 */
function buildCriticalDefaultDeclaration({ defaultName, formattedClassName, properties }) {
  let content = ''

  /**
   * If setting html, body styles then override default mixin's font-size to
   * use --scale-base variable.
   * - This CSS variable is in pixels as we need to set the base font size so
   *   that the REM units have the right scale.
   */
  let htmlBodyFontSize = false

  if (formattedClassName === config.special.htmlBody) {
    const fontSizeProperty = properties.find((object) => {
      return object.property === config.special.fontSize
    })

    htmlBodyFontSize = `  font-size: ${fontSizeProperty?.value};\n`
  }

  content += `${formattedClassName} {\n`
  content += `  @include defaults-${defaultName};\n`

  if (htmlBodyFontSize) {
    content += htmlBodyFontSize
  }

  content += '}\n'

  return content
}

/**
 * Build mixins stylesheet styles.
 * @param {String} className - Class name of declaration.
 * @param {Array} properties - Array of CSS properties and values.
 * @returns {String}
 */
function buildMixinStyles({ className, properties }) {
  let content = ''

  if (className.includes(',')) {
    return content
  }

  content += `@mixin ${className} {\n`
  content += buildCssDeclarationBlock(properties)

  /**
   * Re-use mixin as default mixin based on class names.
   * - Don't render defaults-link mixin if it's the same as defaults-body.
   */
  Object.entries(config.defaults).forEach(([defaultName, defaultClassName]) => {
    if (
      !hasDefaultClass(className, defaultClassName) ||
      (
        config.defaults.body === config.defaults.link &&
        defaultName === 'link'
      )
    ) {
      return
    }

    content += `\n@mixin defaults-${defaultName} {\n`
    content += `  @include ${className};\n`
    content += `}\n`
  })

  return content
}

/**
 * Build default stylesheet styles.
 * @param {String} className - Class name of declaration.
 * @param {Array} properties - Array of CSS properties and values.
 * @returns {String}
 */
function buildDefaultStyles({ className, properties }) {
  let content = ''

  /**
   * Set class names.
   * - Adds element if class name has been specified in config.
   */
  let formattedClassName = className.includes(',')
    ? className
    : `.${className}`

  /**
   * Find if class contains default class.
   */
  const defaultObject = Object.values(config.defaults).find((defaultClassName) => {
    return hasDefaultClass(className, defaultClassName)
  })

  /**
   * Update class name if default object, and not html, body.
   */
  if (formattedClassName !== config.special.htmlBody) {
    if (hasDefaultClass(defaultObject, config.defaults.link)) {
      formattedClassName = `a, ${formattedClassName}`
    }

    if (hasDefaultClass(defaultObject, config.defaults.body)) {
      formattedClassName = `p, ${formattedClassName}`
    }
  }

  /**
   * Output no responsive styles if it contains a comma in class name.
   */
  if (className.includes(',')) {
    content += `${formattedClassName} {\n`
    content += buildCssDeclarationBlock(properties)
    return content
  }

  /**
   * Use mixins.
   */
  content += `${formattedClassName} {\n`
  content += `  @include ${className};\n\n`

  if (config.textTabletBreakpoint) {
    content += `  @include mq($from: ${config.breakpoint.tablet}, $until: ${config.breakpoint.desktop}) {\n`
    content += `    &-tablet.${className}-tablet {\n`
    content += `      @include ${className};\n`
    content += `    }\n`
    content += `  }\n\n`
  }

  content += `  @include mq($from: ${config.breakpoint.desktop}) {\n`
  content += `    &-desktop.${className}-desktop {\n`
  content += `      @include ${className};\n`
  content += `    }\n`
  content += `  }\n`
  content += `}\n`

  return content
}

/**
 * Build individual declaration block for each class/mixin.
 * @param {Array} properties - Array of CSS properties and values.
 * @returns {String}
 */
function buildCssDeclarationBlock(properties) {
  let content = ''

  properties.forEach(({ property: cssProperty, value: cssValue }) => {
    content += `  ${cssProperty}: ${cssValue};\n`
  })

  content += '}\n'

  return content
}

/**
 * Build brand colour classes.
 * @param {Object} variables - Converted variables object.
 * @returns {String}
 */
function buildBrandColours(variables) {
  let content = '\n// Brand colors\n'
  content += outputBrandColours('background', variables)
  content += '\n'
  content += outputBrandColours('text', variables)
  return content
}

/**
 * Outputs the classes.
 * @param {String} type - `background` or `text`.
 * @param {Object} variables - Converted variables object.
 * @returns {String}
 */
function outputBrandColours(type, variables) {
  const property = type === 'background' ? 'background-color' : 'color'

  let content = ''

  content += `.${type}-color {\n`

  variables.color.forEach(({ variable }, index) => {
    const string = variable.replace(config.cssPrefix, '')

    const excluded = config.brandExcludedColours.find((excludedColours) => {
      return string.includes(excludedColours)
    })

    if (excluded) {
      return
    }

    if (index !== 0) {
      content += '\n'
    }

    content += `  &#{&}--${string.replace('color-', '')} {\n`
    content += `    ${property}: var(${variable});\n`
    content += '  }\n'
  })

  content += '}\n'

  return content
}

/**
 * Utils
 * -----------------------------------------------------------------------------
 * Utility functions.
 *
 */

/**
 * Convert string into a class name.
 * - Converts to kebab-case.
 * - Updates ordinal.
 * - Adds prefix.
 * @param {String} string - String to convert.
 * @param {String|Boolean} [parent] - String parent to combine.
 * @param {String} type - Type of class.
 * @returns {String}
 */
function convertStringToClassName(string, parent = false, type) {
  let className = convertStringToHandle(convertOrdinal(string), config, true, parent)
  const parts = className.split(config.delimiter)

  if (type === config.defaultsType && parts.length) {
    const prefix = 'text'

    if (parts[0] !== prefix) {
      className = `${prefix}${config.delimiter}${className}`
    }
  }

  return className
}

/**
 * Convert ordinal to correct naming convention.
 * - E.g. XXXL -> 3XL.
 * - Matches existing casing.
 * @param {String} string - Original string.
 * @returns {String}
 */
function convertOrdinal(string) {
  const match = string?.match(/x+/giu)

  if (!string || !match || match[0]?.length < 2) {
    return string
  }

  const length = match[0].length
  const xCharacter = match[0].slice(0, 1)

  return string.replace(match[0], `${length}${xCharacter}`)
}

/**
 * Tests if class matches a default class.
 * @param {String} className - Token class name.
 * @param {String} defaultClassName - Default class to check.
 * @returns {Boolean}
 */
function hasDefaultClass(className, defaultClassName) {
  return className === defaultClassName
}

/**
 * Export API.
 */
module.exports = {
  buildStyles,
  findTokens,
}
