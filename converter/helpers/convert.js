/**
 * Helper: Convert
 * -----------------------------------------------------------------------------
 * Convert strings into different cases.
 *
 */

/**
 * Convert string to snake_case.
 * @param {String} string - String to convert.
 * @returns {String}
 */
function convertToSnakeCase(string) {
  if (!string) {
    return ''
  }

  return string && string
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((part) => part.toLowerCase())
    .join('_')
}

/**
 * Export helper.
 */
module.exports = (string) => {
  return convertToSnakeCase(string)
}
