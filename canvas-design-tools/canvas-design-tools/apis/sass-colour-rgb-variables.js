/**
 * API: SASS Colour RGB variables
 * -----------------------------------------------------------------------------
 * Functions to output SASS colour RGB variables.
 *
 */
const getDesignConfig = require('../helpers/get-design-config')
const hexRgb = require('../helpers/hex-rgb')

/**
 * Set variables.
 */
const config = getDesignConfig()

/**
 * Get variable value.
 * - Handles replacing RGB values with SASS variables.
 * @param {Object} original - Original value before conversion.
 * @param {String} value - Value of variable.
 * @param {String} variable - Variable name.
 * @returns {String}
 */
function getCssVariableValue({ original, value, variable }) {
  let outputValue = value
  const valueToMatch = original?.value ? original.value : value
  const matches = valueToMatch.match(/#[\w\d]{6}/g)
  const uniqueSassVariables = []

  if (!matches) {
    return value
  }

  /**
   * Match first six letters of hexadecimal value so we can replace RGB values
   * inside colours with opacity.
   * - If value has multiple hex colours then ensure each match is unique,
   *   otherwise use previously assigned SASS variable.
   */
  matches.forEach((match, matchIndex) => {
    const matchingSassVariable = uniqueSassVariables.find((object) => {
      return object.match === match
    })

    const sassVariable = getSassVariable({
      index: matchIndex,
      matches,
      matchingSassVariable,
      variable,
    })

    outputValue = outputValue.replace(getRgbValues(match), `#{${sassVariable}}`)

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
    const valueToMatch = original?.value ? original.value : value
    const matches = valueToMatch.match(/#[\w\d]{6}/g)
    const uniqueSassVariables = []

    if (!matches) {
      return
    }

    /**
     * Go through each hex match and output RGB values.
     * - Ensure SASS RGB variables are created for each unique hex colour in
     *   values with multiple hex colours (e.g. gradients).
     */
    matches.forEach((match, matchIndex) => {
      const matchingSassVariable = uniqueSassVariables.find((object) => {
        return object.match === match
      })

      if (matchingSassVariable) {
        return
      }

      const sassVariable = getSassVariable({
        index: matchIndex,
        matches,
        variable,
      })

      content += `${sassVariable}: '${getRgbValues(match)}'; // ${match}\n`

      uniqueSassVariables.push({
        match,
        sassVariable,
      })
    })
  })

  return `${content}\n`
}

/**
 * Get SASS variable name.
 * @param {Number} index - Current match index.
 * @param {Array} matches - Matches array.
 * @param {Object} [matchingSassVariable] - Matching existing variable.
 * @param {String} variable - CSS colour variable.
 * @returns {String}
 */
function getSassVariable({ index, matches, matchingSassVariable, variable }) {
  let sassVariable = variable.replace(config.cssPrefix, '$')

  if (matchingSassVariable) {
    sassVariable = matchingSassVariable.sassVariable
  } else if (matches.length > 1) {
    sassVariable += `-${index}`
  }

  if (!matchingSassVariable) {
    sassVariable = `${sassVariable}-rgb`
  }

  return sassVariable
}

/**
 * Get RGB values.
 * @param {String} match - Matching hexadecimal colour.
 * @returns {String}
 */
function getRgbValues(match) {
  return hexRgb(match)
    .replace('rgb', '')
    .replace('(', '')
    .replace(')', '')
}

/**
 * Export API.
 */
module.exports = {
  getCssVariableValue,
  getSassTemplate,
}
