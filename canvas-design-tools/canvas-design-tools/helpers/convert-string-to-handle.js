/**
 * Helper: Convert string to handle
 * -----------------------------------------------------------------------------
 * Converts provided string to handle (kebab-case).
 *
 * @param {String} string - String to convert.
 * @param {Object} config - Design config.
 * @returns {String}
 */
module.exports = (string, config) => {
  const handle = string && string.replaceAll('+', 'Plus')

  return handle
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z0-9]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((part) => part.toLowerCase())
    .join(config.delimiter)
}
