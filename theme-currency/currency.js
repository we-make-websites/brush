/**
 * Theme Currency: Currency
 * -----------------------------------------------------------------------------
 * Formats money based on store money formatting settings.
 *
 */

/**
 * Format money values based on your shop currency settings.
 * @param  {Number|String} cents - Value in cents or dollar amount e.g. 300
 * cents or 3.00 dollars.
 * @param  {String} [format] - shop money_format setting
 * @returns {String}
 */
export function formatMoney(cents, format) {
  // eslint-disable-next-line no-template-curly-in-string
  const formatString = format || '${{amount}}'
  let formattedCents = cents

  if (typeof formattedCents === 'string') {
    formattedCents = formattedCents.replace('.', '')
  }

  // eslint-disable-next-line prefer-named-capture-group
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/
  let value = ''

  /**
   * Determine format based on store setting.
   * - https://help.shopify.com/en/manual/payments/currency-formatting
   */
  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2)
      break

    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0)
      break

    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',')
      break

    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',')
      break

    case 'amount_with_apostrophe_separator':
      value = formatWithDelimiters(cents, 2, '\'', '.')
      break

    default:
      value = formatWithDelimiters(cents, 2)
      break
  }

  return formatString.replace(placeholderRegex, value)
}

/**
 * Format delimiters.
 * @param {Number} number - Number to format.
 * @param {Number} [precision] - Decimal places.
 * @param {String} [thousands] - Thousands separator.
 * @param {String} [decimal] - Decimal separator.
 * @returns {String}
 */
function formatWithDelimiters(number, precision = 2, thousands = ',', decimal = '.') {
  if (isNaN(number) || number === null) {
    return 0
  }

  let formattedNumber = number
  formattedNumber = (formattedNumber / 100.0).toFixed(precision)

  const parts = formattedNumber.split('.')

  const dollarsAmount = parts[0].replace(
    // eslint-disable-next-line prefer-named-capture-group
    /(\d)(?=(\d\d\d)+(?!\d))/g,
    `$1${thousands}`,
  )

  const centsAmount = parts[1] ? decimal + parts[1] : ''

  return dollarsAmount + centsAmount
}
