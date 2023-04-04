/**
 * Helper: Convert camelcase to title case.
 * -----------------------------------------------------------------------------
 * Converts a camelCase to Title Case.
 *
 * @param {String} string - String to convert.
 * @return {String}
 */
module.exports = (string) => {
  let titleCase = string
    .trim()
    .replace(/(?<capitals>[A-Z])/g, ' $<capitals>')

  titleCase = titleCase.charAt(0).toUpperCase() + titleCase.slice(1)

  return titleCase.trim()
}
