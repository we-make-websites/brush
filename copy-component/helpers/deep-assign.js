/**
 * Helper: Deep assign
 * -----------------------------------------------------------------------------
 * Combine objects, used for locales and package JSON.
 *
 */

/**
 * Deep merge two objects together.
 * - Changed from original function.
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com.
 * @param {Object} source - Original object to merge into.
 * @param {Object} extra - New object to merge in.
 * @returns {Object}
 */
function deepAssign(source, extra) {
  for (const key in extra) {
    if (
      Object.prototype.toString.call(extra[key]) ===
      '[object Object]'
    ) {
      source[key] = deepAssign(
        source[key] || {},
        extra[key],
      )
      continue
    }

    source[key] = extra[key]
  }

  return source
}

/**
 * Export helpers.
 * @returns {Object}
 */
module.exports = (source, extra) => {
  return deepAssign(source, extra)
}
