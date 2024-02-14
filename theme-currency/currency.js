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
 * @param  {String} [format] - Shop money_format setting.
 * @param {Boolean} [removeZeros] - Remove trailing zeros from price.
 * @returns {String}
 */
export function formatMoney(cents, format, removeZeros) {
  // eslint-disable-next-line no-template-curly-in-string
  const formatString = format || '${{amount}}'
  let formattedCents = cents

  if (typeof formattedCents === 'string') {
    formattedCents = formattedCents.replace('.', '')
  }

  // eslint-disable-next-line prefer-named-capture-group
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/

  const options = {
    decimal: '.',
    precision: 2,
    removeZeros,
    thousands: ',',
  }

  const moneyFormat = formatString.match(placeholderRegex)[1]

  /**
   * Determine format based on store setting.
   * - https://help.shopify.com/en/manual/payments/currency-formatting
   */
  switch (moneyFormat) {
    case 'amount_with_comma_separator':
    case 'amount_no_decimals_with_comma_separator':
      options.decimal = ','
      options.thousands = '.'
      break

    case 'amount_with_apostrophe_separator':
    case 'amount_no_decimals_with_apostrophe_separator':
      options.thousands = '\''
      break

    case 'amount_with_space_separator':
    case 'amount_no_decimals_with_space_separator':
      options.thousands = ' '
      break
  }

  if (moneyFormat.includes('_no_decimals')) {
    options.precision = 0
  }

  const value = formatWithDelimiters(cents, options)

  return formatString.replace(placeholderRegex, value)
}

/**
 * Format delimiters.
 * @param {Number} number - Number to format.
 * @param {Object} [options] - Options object
 * @param {Number} [precision] - Decimal places.
 * @param {String} [thousands] - Thousands separator.
 * @param {String} [decimal] - Decimal separator.
 * @param {Boolean} [zeros] - Display zeroes
 * @returns {String}
 */
function formatWithDelimiters(number, { decimal, precision, removeZeros, thousands }) {
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

  let centsAmount = parts[1] ? `${decimal}${parts[1]}` : ''

  if (parts[1] === '00' && removeZeros) {
    centsAmount = ''
  }

  return `${dollarsAmount}${centsAmount}`
}
