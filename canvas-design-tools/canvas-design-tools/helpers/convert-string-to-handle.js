/**
 * Helper: Convert string to handle
 * -----------------------------------------------------------------------------
 * Converts provided string to handle (kebab-case).
 *
 * @param {Object} data - Data object.
 * @param {Object} data.config - Design config.
 * @param {Boolean} [data.isClass] - Is a class conversion.
 * @param {String|Boolean} [data.parent] - String parent to combine.
 * @param {String} data.string - String to convert.
 * @returns {String}
 */
module.exports = ({ config, isClass, parent = false, string } = {}) => {
  let handle = string.replaceAll('+', 'Plus')

  /**
   * Lowercase ordinals.
   * - This is done as capital letters are used to add the delimiter.
   */
  if (handle.match(/^\d*(?:(?:X+S)|S|M|L|(?:X+L))$/gi)) {
    handle = handle.toLowerCase()
  }

  if (isClass) {
    handle = handle
      .match(/[A-Z0-9]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z0-9]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((part) => part.toLowerCase())
      .join(config.delimiter)

    if (parent) {
      const parentHandle = parent
        .match(/[A-Z0-9]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z0-9]+[0-9]*|[A-Z]|[0-9]+/g)
        .map((part) => part.toLowerCase())
        .join(config.delimiter)

      handle = `${parentHandle}${config.delimiter}${handle}`
    }

  } else {
    handle = handle
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z0-9]+[0-9]*|[A-Z]|[0-9]+/g)
      .map((part) => part.toLowerCase())
      .join(config.delimiter)
  }

  /**
   * Convert ordinals to correct naming convention.
   */
  handle = convertOrdinal(handle)

  /**
   * Return formatted handle.
   */
  return handle
}

/**
 * Convert ordinal to correct naming convention.
 * - E.g. XXXL -> 3XL.
 * - Matches existing casing.
 * @param {String} string - Original string.
 * @returns {String}
 */
function convertOrdinal(string) {
  const match = string?.match(/x+/gi)

  if (!string || !match || match[0]?.length < 2) {
    return string
  }

  const length = match[0].length
  const xCharacter = match[0].slice(0, 1)

  return string.replace(match[0], `${length}${xCharacter}`)
}
