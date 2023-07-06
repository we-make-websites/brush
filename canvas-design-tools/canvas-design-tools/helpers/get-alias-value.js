/**
 * Helper: Get alias value.
 * -----------------------------------------------------------------------------
 * Returns alias value.
 *
 * @param {Object} config - Design config.
 * @param {String} key - Token key (e.g. 'breakpoint').
 * @param {String} value - Token value that includes alias.
 * @param {Object} variables - Converted variables object.
 * @returns {Object}
 */
const convertStringToHandle = require('../helpers/convert-string-to-handle')

function getAliasValue({ config, key, value, variables } = {}) {
  const formattedAlias = value
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

  /**
   * Exclude if both the type and its original key are not found in config.
   */
  if (
    !config.variablesByName.includes(convertStringToHandle({
      config,
      string: nonRenamedType,
    })) &&
    !config.variablesByName.includes(key) &&
    !config.variablesByType.includes(nonRenamedType) &&
    !config.variablesByType.includes(key)
  ) {
    return false
  }

  let property = config.renameVariable[type]
    ? config.renameVariable[type]
    : convertStringToHandle({
      config,
      string: type,
    })

  if (key === config.special.color) {
    property = key
  }

  /**
   * Find variables object.
   */
  const variableObject = variables[property]?.find((object) => {
    return object.name.toLowerCase() === name.toLowerCase()
  })

  if (!variableObject) {
    return false
  }

  /**
   * If variable value is an alias itself then replace.
   */
  let alias = false

  if (
    typeof variableObject.value === 'string' &&
    variableObject.value?.includes('{')
  ) {
    alias = getAliasValue({
      config,
      key,
      value: variableObject.value,
      variables,
    })

    alias = alias.variable
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
    variable: alias ? alias : variableObject,
  }
}

module.exports = (data) => {
  return getAliasValue(data)
}
