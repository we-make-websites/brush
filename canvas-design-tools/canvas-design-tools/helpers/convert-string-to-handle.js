/**
 * Helper: Convert string to handle
 * -----------------------------------------------------------------------------
 * Converts provided string to handle (kebab-case).
 *
 * @param {String} string - String to convert.
 * @param {Object} config - Design config.
 * @param {Boolean} isClass - Is a class conversion.
 * @param {String|Boolean} [parent] - String parent to combine.
 * @returns {String}
 */
module.exports = (string, config, isClass, parent = false) => {
  let handle = string && string.replaceAll('+', 'Plus')

  if (handle.match(/^\d*(?:XS|S|M|L|XL)$/gi)) {
    handle = handle.toLowerCase()
  }

  if (isClass) {
    const newHandle = handle
      .match(/[A-Z0-9]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z0-9]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((part) => part.toLowerCase())
      .join(config.delimiter)

    if (!parent) {
      return handle
    }

    const parentHandle = parent
      .match(/[A-Z0-9]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z0-9]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((part) => part.toLowerCase())
      .join(config.delimiter)

    return `${parentHandle}${config.delimiter}${newHandle}`
  }

  return handle
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z0-9]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((part) => part.toLowerCase())
    .join(config.delimiter)
}
