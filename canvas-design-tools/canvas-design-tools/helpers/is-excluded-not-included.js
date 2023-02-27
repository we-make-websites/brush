/**
 * Helper: Excluded and not included.
 * -----------------------------------------------------------------------------
 * Checks if key is excluded and not included.
 * - Can target specific values, e.g. 'text.text-body-m'.
 * - Used to determine if current key shouldn't be rendered.
 * - Returns true if key is excluded or is not included.
 * @param {String} key - Type of class, e.g. 'text'. If testing value then pass
 * in format `[key].[className]`, e.g. 'text.text-body-m'.
 * @param {Object} stylesheet - Stylesheet object.
 * @returns {Boolean}
 */
module.exports = (key, stylesheet) => {
  if (stylesheet.include.length) {
    const included = stylesheet.include.some((item) => {
      const test = item.includes('.') && !key.includes('.')
        ? item.split('.')[0]
        : item

      return test === key
    })

    return !included
  }

  if (stylesheet.exclude.length) {
    const excluded = stylesheet.exclude.some((item) => {
      const test = item.includes('.') && !key.includes('.')
        ? item.split('.')[0]
        : item

      return test === key
    })

    return excluded
  }

  return false
}
