/**
 * API: Convert
 * -----------------------------------------------------------------------------
 * Functions to convert schema strings.
 *
 */
let locales = {}

/**
 * Convert JSON schema.
 * @param {Object} schema - Section JSON schema.
 * @param {Object} projectLocales - Locales JSON object.
 * @returns {Promise}
 */
function convertSchema(schema, projectLocales) {
  return new Promise((resolve) => {
    locales = projectLocales

    const formattedSchema = formatObject(schema)
    resolve(formattedSchema)
  })
}

/**
 * Go through objects/arrays/strings and format.
 * @param {Object} object - Current object to format its values.
 * @returns {Object}
 */
function formatObject(object) {
  const formattedObject = object

  Object.entries(object).forEach(([key, value]) => {
    if (['boolean', 'number'].includes(typeof value)) {
      return
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        formattedObject[key] = value.map((arrayObject) => {
          return formatObject(arrayObject)
        })

        return
      }

      formattedObject[key] = formatObject(value)
      return
    }

    if (!value.startsWith('t:')) {
      return
    }

    formattedObject[key] = replaceString(value)
  })

  return formattedObject
}

/**
 * Replace locale string with actual string.
 * @param {String} string - String to replace.
 */
function replaceString(string) {
  const parts = string.replace('t:', '').split('.')
  let localeString = locales

  for (const part of parts) {
    if (!localeString[part]) {
      break
    }

    localeString = localeString[part] ? localeString[part] : false
  }

  return localeString || string
}

/**
 * Export API.
 */
module.exports = {
  convertSchema,
}
