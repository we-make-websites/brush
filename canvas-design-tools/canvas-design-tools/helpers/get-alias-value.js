/**
 * Helper: Get alias value.
 * -----------------------------------------------------------------------------
 * Returns alias value.
 *
 * @param {Object} config - Design config.
 * @param {String} value - Token value that includes alias.
 * @param {Object} variables - Converted variables object.
 * @returns {Object}
 */
const convertStringToHandle = require('../helpers/convert-string-to-handle')

module.exports = ({ config, value, variables } = {}) => {
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

  if (
    !config.variablesByName.includes(convertStringToHandle(nonRenamedType, config)) &&
    !config.variablesByType.includes(nonRenamedType)
  ) {
    return false
  }

  const property = config.renameVariable[type]
    ? config.renameVariable[type]
    : convertStringToHandle(type, config)

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
}
