/**
 * API: Handler
 * -----------------------------------------------------------------------------
 * Functions to handle prop values.
 *
 */
const config = require('../helpers/config')
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

      if (part.includes('.size')) {
        return `${part} > 0`
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
 * @param {Array} forloopVariables- Array of variables scoped from forloop on
 * current or parent element.
 * @param {Array} globalLiquidAssign - Liquid header array.
 * @param {Boolean} snippet - Prop of Liquid render snippet.
 * @param {String} value - Prop value.
 * @returns {String}
 */
function formatMoney({
  forloopVariables,
  globalLiquidAssign,
  snippet,
  value,
}) {
  let money = value
    .split('(')[1]
    .replace(')', '')
    .trim()

  if (
    !config.validLiquidObjects.includes(money.split('.')[0]) &&
    !forloopVariables.includes(money.split('.')[0])
  ) {
    money = convertToSnakeCase(money)
  }

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
 * Handle valid Liquid objects.
 * @param {String} condition - v-if, v-else, or v-else-if condition.
 * @param {Array} forloopVariables- Array of variables scoped from forloop on
 * current or parent element.
 * @param {Array} globalLiquidAssign - Liquid header array.
 * @param {String} part - Test part.
 * @param {String} value - Original full value.
 * @param
 */
function validLiquid({
  condition,
  forloopVariables,
  globalLiquidAssign,
  part,
  value,
}) {
  if (
    config.validLiquidObjects.includes(part.split('.')[0]) ||
    forloopVariables.includes(part.split('.')[0]) ||
    part.includes(' and ') ||
    part.includes(' or ')
  ) {
    if (condition === 'for') {
      return `${value.split(' of ')[0]} of ${part}`
    }

    return part
  }

  const snakeCaseVariable = convertToSnakeCase(part)
  let updatedPart = snakeCaseVariable

  if (condition === 'for') {
    updatedPart = `${value.split(' of ')[0]} of ${snakeCaseVariable}`
  }

  const existingAssign = globalLiquidAssign.some((item) => {
    return item.includes(`assign ${snakeCaseVariable} =`)
  })

  if (!existingAssign) {
    globalLiquidAssign.push(`assign ${snakeCaseVariable} = 'TODO'`)
  }

  return updatedPart
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
  validLiquid,
  variable,
}
