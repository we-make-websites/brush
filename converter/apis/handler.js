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
 * Handle equals checks (condition == '').
 * @param {Array} [globalLiquidAssigns] - Liquid assign header array.
 * @param {Array} [globalLiquidConditionals] - Liquid conditional header array.
 * @param {String} liquidVariable - Liquid assign variable name.
 * @param {String} value - Current prop value.
 * @returns {Object}
 */
function equals({
  globalLiquidAssigns = false,
  globalLiquidConditionals = false,
  liquidVariable,
  value,
}) {
  const condition = value.includes(' == ') ? ' == ' : ' != '
  const equalParts = value.split(condition)
  const conditionVariable = equalParts[0].split(' ')[0]
  const conditionValue = equalParts[1]
  let formattedValue = value

  if (globalLiquidAssigns && globalLiquidConditionals) {
    globalLiquidAssigns.push(`assign ${liquidVariable} = false`)

    if (!config.validLiquidObjects.includes(conditionVariable)) {
      globalLiquidAssigns.push(`assign ${conditionVariable} = 'TODO'`)
    }

    const conditionals = [
      `if ${conditionVariable}${condition}${conditionValue}`,
      `  assign ${liquidVariable} = true`,
      `endif`,
    ]

    globalLiquidConditionals.push(conditionals)

  } else {
    formattedValue = `{% if ${conditionVariable}${condition}${conditionValue} %}true{% else %}false{% endif %}`
  }

  return formattedValue
}

/**
 * Handle $formatMoney() helper function.
 * @param {Array} forloopVariables- Array of variables scoped from forloop on
 * current or parent element.
 * @param {Array} globalLiquidAssigns - Liquid header array.
 * @param {Boolean} snippet - Prop of Liquid render snippet.
 * @param {String} value - Prop value.
 * @returns {String}
 */
function formatMoney({
  forloopVariables,
  globalLiquidAssigns,
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
    globalLiquidAssigns.push(`assign ${liquidVariable} = ${liquid}`)
    return money
  }

  return `{{ ${liquid} }}`
}

/**
 * Handle $string() helper function.
 * @param {String} value - Prop value.
 * @param {Boolean} snippet - Prop of Liquid render snippet.
 * @param {Array} globalLiquidAssigns - Liquid header array.
 * @returns {String}
 */
function string(value, snippet, globalLiquidAssigns) {
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
    globalLiquidAssigns.push(`assign ${liquidVariable} = ${liquid}`)
    return liquidVariable
  }

  return `{{ ${liquid} }}`
}

/**
 * Handle ternary operators.
 * @param {Array} [globalLiquidAssigns] - Liquid assign header array.
 * @param {Array} [globalLiquidConditionals] - Liquid conditional header array.
 * @param {String} liquidVariable - Liquid assign variable name.
 * @param {String} value - Current prop value.
 * @returns {String}
 */
function ternaryOperators({
  globalLiquidAssigns = false,
  globalLiquidConditionals = false,
  liquidVariable,
  value,
}) {
  const ternaryParts = value.split(/ (?:\?|:) /g)
  const conditionVariable = ternaryParts[0].split(' ')[1]
  const ifCondition = ternaryParts[1]
  const elseCondition = ternaryParts[2]
  let conditionValue = ' != blank'
  let formattedValue = value

  if (conditionVariable.includes('.size')) {
    if (conditionVariable.includes('<') || conditionVariable.includes('>')) {
      conditionValue = ''
    } else {
      conditionValue = ' > 0'
    }
  }

  if (globalLiquidAssigns && globalLiquidConditionals) {
    globalLiquidAssigns.push(`assign ${liquidVariable} = ${elseCondition.replace('null', false)}`)

    if (!config.validLiquidObjects.includes(conditionVariable)) {
      globalLiquidAssigns.push(`assign ${conditionVariable} = 'TODO'`)
    }

    const conditionals = [
      `if ${conditionVariable}${conditionValue}`,
      `  assign ${liquidVariable} = ${ifCondition.replace('null', false)}`,
      `endif`,
    ]

    globalLiquidConditionals.push(conditionals)

  } else {
    formattedValue = `{% if ${conditionVariable}${conditionValue} %}${ifCondition.replaceAll(`'`, '')}{% else %}${elseCondition.replaceAll(`'`, '')}{% endif %}`
  }

  return formattedValue
}

/**
 * Handle valid Liquid objects.
 * @param {String} condition - v-if, v-else, or v-else-if condition.
 * @param {Array} forloopVariables- Array of variables scoped from forloop on
 * current or parent element.
 * @param {Array} globalLiquidAssigns - Liquid header array.
 * @param {String} part - Test part.
 * @param {String} value - Original full value.
 * @param
 */
function validLiquid({
  condition,
  forloopVariables,
  globalLiquidAssigns,
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

  globalLiquidAssigns.push(`assign ${snakeCaseVariable} = 'TODO'`)

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
  equals,
  formatMoney,
  string,
  ternaryOperators,
  validLiquid,
  variable,
}