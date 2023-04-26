/**
 * Helper: Format alias.
 * -----------------------------------------------------------------------------
 * Removes alias characters.
 * - If property is in format 'key.name' then remove key.
 *
 * @param {String} alias - Original alias.
 * @param {Object} config - Design config.
 * @returns {String}
 */
module.exports = (alias, config) => {
  let formattedAlias = alias.value.replace(/[{$}]/g, '')

  if (formattedAlias.includes('.')) {
    formattedAlias = formattedAlias.replaceAll('.', config.delimiter)
  }

  return formattedAlias
}
