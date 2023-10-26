/**
 * API: Handler
 * -----------------------------------------------------------------------------
 * Functions to handle prop values.
 *
 */
const convertToSnakeCase = require('../helpers/convert')

/**
 * Handle conditions.
 * @param {String} split - 'or' or 'and'.
 * @param {String} currentConditions - Current conditions.
 * @returns {String}
 */
function conditions(split, currentConditions) {
  return currentConditions
    .split(` ${split} `)
    .map((part) => {
      if (
        part.includes('==') ||
        part.includes('!=') ||
        part.includes('>') ||
        part.includes('<')
      ) {
        return part
      }

      if (part.startsWith('!')) {
        return `${part.replace('!', '')} == false`
      }

      return `${part} != blank`
    })
    .join(` ${split} `)
}

/**
 * Handle $formatMoney() helper function.
 * @param {String} value - Prop value.
 * @param {Boolean} snippet - Prop of Liquid render snippet.
 * @param {Array} globalLiquidAssign - Liquid header array.
 * @returns {String}
 */
function formatMoney(value, snippet, globalLiquidAssign) {
  const money = value
    .split('(')[1]
    .replace(')', '')
    .trim()

  const liquid = `${money} | money`

  /**
   * If Liquid snippet add variable to global Liquid.
   */
  if (snippet) {
    const liquidVariable = `${convertToSnakeCase(money)}_string`
    globalLiquidAssign.push(`assign ${liquidVariable} = ${liquid}`)
    return money
  }

  return `{{ ${liquid} }}`
}

/**
 * Handle $string() helper function.
 * @param {String} value - Prop value.
 * @param {Boolean} snippet - Prop of Liquid render snippet.
 * @param {Array} globalLiquidAssign - Liquid header array.
 * @returns {String}
 */
function string(value, snippet, globalLiquidAssign) {
  const locale = value
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

  const liquid = uniqueTranslate.length
    ? `${locale} | t: ${uniqueTranslate.join(', ')}`
    : `${locale} | t`

  /**
   * If Liquid snippet add variable to global Liquid.
   */
  if (snippet) {
    const liquidVariable = `${convertToSnakeCase(locale)}_string`
    globalLiquidAssign.push(`assign ${liquidVariable} = ${liquid}`)
    return liquidVariable
  }

  return `{{ ${liquid} }}`
}

/**
 * Handle $variable() helper function.
 * @param {String} value - Prop value.
 * @param {Boolean|String} condition - Conditional tag.
 * @returns {String}
 */
function variable(value, condition) {
  const formattedValue = value.replaceAll('\'', '')

  return condition
    ? formattedValue
    : `{{ ${formattedValue} }}`
}

/**
 * Export API.
 */
module.exports = {
  conditions,
  formatMoney,
  string,
  variable,
}
