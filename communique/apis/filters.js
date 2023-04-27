/**
 * API: Filters
 * -----------------------------------------------------------------------------
 * Register custom filters with Liquid JS engine.
 *
 */
/* eslint-disable camelcase */

/**
 * Format address filter.
 * @param {String} value - Value.
 * @returns {String}
 */
function format_address(value) {
  return value.replaceAll('\n', '<br />')
}

/**
 * Format image URL.
 * @param {Object} value - Value.
 * @param {String} parameter - Parameter.
 * @returns {String}
 */
function img_url(value, parameter) {
  return formatImageUrl(value.image, parameter)
}

/**
 * Money filter.
 * @param {Number|String} cents - Value in cents or dollar amount e.g. 300
 * cents or 3.00 dollars.
 * @param {String} [format] - shop money_format setting
 * @returns {String}
 */
function money(cents, format) {
  if (!cents) {
    return ''
  }

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
 * Helpers.
 * -----------------------------------------------------------------------------
 * Helper functions to achieve filters.
 *
 */

/**
 * Format Shopify image URL.
 * @param {String} src - Image URL, can include existing parameters.
 * @param {Object|String} options - Image options object, or image size string.
 * @param {String} options.crop - Crop image positioning when height and width
 * are set.
 * @param {Number} options.height - Height of image in pixels.
 * @param {String} options.pad_color - Background colour to pad image when image
 * cannot be cropped.
 * @param {Number} options.width - Width of image in pixels.
 * @returns {String}
 */
function formatImageUrl(src, options) {
  if (!src.includes('cdn.shopify.com')) {
    return src
  }

  const filetype = src.split('.').reverse()[0]?.split('?')[0]
  let version = src.match(/(?!\?|&)(?<version>v=\d+)/gi)

  if (!filetype || !version) {
    return src
  }

  version = version[0]
  const parameters = []

  /**
   * Clean up image URL.
   * - Remove URL parameters.
   * - Standardise protocol.
   * - Remove progressive filetype prefix.
   * - Remove filetype.
   * - Remove sizing, crop, and scale.
   */
  let url = src
    .split('?')[0]
    .split('//')[1]
    .replace('.progressive.', '.')
    .replace(`.${filetype}`, '.')
    .replace(/(?<size>(?:\d+)?x(?:\d+)?)?(?<crop>_crop_(?:top|center|bottom|left|right))?(?<scale>@(?:2|3)x)?\./g, '.')
    .replace('_compact_cropped', '')

  url = `//${url}${filetype}?${version}`

  /**
   * If no options provided then return URL.
   */
  if (!options) {
    return url
  }

  /**
   * Get parameters from options object.
   */
  if (typeof options === 'object') {
    Object.entries(options).forEach(([key, value]) => {
      if (!value || key === 'format') {
        return
      }

      let formattedValue = value

      if (key === 'pad_color') {
        formattedValue = value.replace('#', '')
      }

      parameters.push(`${key}=${formattedValue}`)
    })
  }

  /**
   * Get width and height parameters from options string.
   */
  if (typeof options === 'string') {
    const sizes = options.split('x')

    if (sizes[0]) {
      parameters.push(`width=${sizes[0]}`)
    }

    if (sizes[1]) {
      parameters.push(`height=${sizes[1]}`)
    }

    if (sizes[0] && sizes[1]) {
      parameters.push('crop=center')
    }
  }

  return parameters.length
    ? `${url}&${parameters.join('&')}`
    : url
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

/**
 * Export API.
 */
module.exports = {
  format_address,
  img_url,
  money,
  money_with_currency: money,
}
