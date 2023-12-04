/**
 * API: SASS Colour RGB variables
 * -----------------------------------------------------------------------------
 * Functions to output SASS colour RGB variables.
 *
 */
const getDesignConfig = require('../helpers/get-design-config')

/**
 * Set variables.
 */
const config = getDesignConfig()

/**
 * Get variable value.
 * - Handles replacing RGB values with SASS variables.
 * @param {String} value - Value of variable.
 * @param {String} variable - Variable name.
 * @returns {String}
 */
function getCssVariableValue({ value, variable }) {
  let outputValue = value
  const matches = value.match(/rgb\(\d+ \d+ \d+\)/g)
  const uniqueSassVariables = []

  if (!matches) {
    return value
  }

  /**
   * Go through each rgb() color function and replace values with SASS variable
   * of the same name.
   * - If value has multiple rgb() functions then ensure each match is unique,
   *   otherwise use previously assigned SASS variable.
   */
  matches.forEach((match, matchIndex) => {
    const matchingSassVariable = uniqueSassVariables.find((object) => {
      return object.match === match
    })

    let sassVariable = variable.replace(config.cssPrefix, '$')

    if (matchingSassVariable) {
      sassVariable = matchingSassVariable.sassVariable
    } else if (matches.length > 1) {
      sassVariable += `-${matchIndex}`
    }

    outputValue = outputValue.replace(match, `rgb(${sassVariable})`)

    uniqueSassVariables.push({
      match,
      sassVariable,
    })
  })

  return outputValue
}

/**
 * Generates SASS RGB variables.
 * @param {String} outputSpacing - Indentation for stylesheet.
 * @param {Object} variables - Converted variables object.
 * @returns {String}
 */
function getSassTemplate({ outputSpacing, variables }) {
  let content = `${outputSpacing}// Color RGB\n`

  variables[config.special.color].forEach(({ original, value, variable }) => {
    const matches = value.match(/rgb\(\d+ \d+ \d+\)/g)
    const uniqueSassVariables = []

    if (!matches) {
      return
    }

    matches.forEach((match, matchIndex) => {
      const matchingSassVariable = uniqueSassVariables.find((object) => {
        return object.match === match
      })

      if (matchingSassVariable) {
        return
      }

      let sassVariable = variable.replace(config.cssPrefix, '$')

      if (matches.length > 1) {
        sassVariable += `-${matchIndex}`
      }

      const rgbValue = match.replace('rgb', '').replace('(', '').replace(')', '')

      content += `${sassVariable}: '${rgbValue}'; // ${original.value}${original.unit}\n`

      uniqueSassVariables.push({
        match,
        sassVariable,
      })
    })
  })

  return `${content}\n`
}

/**
 * Export API.
 */
module.exports = {
  getCssVariableValue,
  getSassTemplate,
}
