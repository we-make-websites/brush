/**
 * Helper: Excluded and not included.
 * -----------------------------------------------------------------------------
 * Checks if key is excluded and not included.
 * - Can target specific values, e.g. 'text.text-body-m'.
 * - Used to determine if current key shouldn't be rendered.
 * - Returns true if key is excluded or is not included.
 * - If class is a default class then it cannot be excluded.
 * @param {String} key - Type of class, e.g. 'text'. If testing value then pass
 * in format `[key].[className]`, e.g. 'text.text-body-m'.
 * @param {Object} stylesheet - Stylesheet object.
 * @param {Object} config - Design config.
 * @returns {Boolean}
 */
module.exports = (key, stylesheet, config) => {
  if (config) {
    const defaultClass = Object.values(config.defaults).some((value) => {
      return `typography.${value}` === key
    })

    if (defaultClass || key === 'typography.html, body') {
      return false
    }
  }

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

  /**
   * If critical stylesheet and matches default class name or html, body then
   * include in stylesheet render.
   * - Only check when in format `[key].[className]`.
   */
  if (key.includes('.') && stylesheet.handle === 'classes-critical') {
    const included = Object.entries(config.defaults).some(([defaultName, defaultClassName]) => {
      if (defaultName === 'button') {
        return false
      }

      return (
        `${config.defaultsType}.${config.special.htmlBody}` === key ||
        `${config.defaultsType}.${defaultClassName}` === key
      )
    })

    return !included
  }

  return false
}
