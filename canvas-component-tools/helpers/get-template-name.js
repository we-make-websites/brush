/**
 * Helper: Get template names
 * -----------------------------------------------------------------------------
 * Determine template name for component settings.
 * - Initially creates verbose template name from relevant component settings.
 * - Then uses reference table to minimise number of templates required.
 *
 */

/**
 * Export.
 * @param {String} filetype - Type of file to determine template name for.
 * @param {Object} component - Create component settings.
 * @returns {String}
 */
module.exports = (filetype, component) => {
  switch (filetype) {
    case 'js':
      return js(component)
    case 'liquid':
      return liquid(component)
    case 'schema':
      return schema(component)
    case 'story':
      return story(component)
    case 'stylesheet':
      return stylesheet(component)
    default:
      return false
  }
}

/**
 * JS template name.
 * @param {Object} component - Create component settings.
 * @returns {String}
 */
function js(component) {
  let templateName = `js-${component.type}-${component.interactivity}-${component.liquid}`

  if (component.type === 'web') {
    templateName = `js-${component.type}-${component.interactivity}-${component.liquid}-${component.webTemplate}`
  } else if (component.load === 'trigger') {
    templateName = `js-${component.type}-${component.interactivity}-${component.liquid}-trigger`
  }

  return templateName
}

/**
 * Liquid template name.
 * @param {Object} component - Create component settings.
 * @returns {String}
 */
function liquid(component) {
  const templateName = component.load === 'trigger'
    ? `liquid-${component.type}-${component.interactivity}-${component.liquid}-trigger`
    : `liquid-${component.type}-${component.interactivity}-${component.liquid}`

  return referenceLookup(templateName)
}

/**
 * Schema template name.
 * @param {Object} component - Create component settings.
 * @returns {String}
 */
function schema(component) {
  const templateName = ['section', 'block'].includes(component.liquid)
    ? `schema-${component.type}`
    : false

  return referenceLookup(templateName)
}

/**
 * Story template name.
 * @param {Object} component - Create component settings.
 * @returns {String}
 */
function story(component) {
  const templateName = component.interactivity === 'dynamic'
    ? `story-${component.type}`
    : false

  return referenceLookup(templateName)
}

/**
 * Stylesheet template name.
 * @param {Object} component - Create component settings.
 * @returns {String}
 */
function stylesheet(component) {
  const templateName = `stylesheet-${component.liquid}`

  return referenceLookup(templateName)
}

/**
 * Look up template name in reference to see if a shorten name exists.
 * - Provides all possible combinations.
 * @param {String} templateName - Template name.
 * @returns {String}
 */
function referenceLookup(templateName) {
  const reference = {
    // JS - Vue
    'js-async-dynamic-section': 'js-async-section',
    'js-async-dynamic-section-trigger': 'js-async-section-trigger',
    'js-async-dynamic-snippet': 'js-async-snippet',
    'js-global-dynamic-section': 'js-global-section',
    'js-global-dynamic-snippet': 'js-global-snippet',
    // JS - Web components
    'js-web-dynamic-block-vanilla': 'js-web-vanilla',
    'js-web-dynamic-block-vue': 'js-web-vue',
    'js-web-dynamic-section-vanilla': 'js-web-vanilla',
    'js-web-dynamic-section-vue': 'js-web-vue',
    'js-web-dynamic-snippet-vanilla': 'js-web-vanilla',
    'js-web-dynamic-snippet-vue': 'js-web-vue',
    'js-web-limited-block-vanilla': 'js-web-vanilla',
    'js-web-limited-block-vue': 'js-web-vue',
    'js-web-limited-section-vanilla': 'js-web-vanilla',
    'js-web-limited-section-vue': 'js-web-vue',
    'js-web-limited-snippet-vanilla': 'js-web-vanilla',
    'js-web-limited-snippet-vue': 'js-web-vue',
    'js-web-static-block-vanilla': 'js-web-static',
    'js-web-static-block-vue': 'js-web-static',
    'js-web-static-section-vanilla': 'js-web-static',
    'js-web-static-section-vue': 'js-web-static',
    'js-web-static-snippet-vanilla': 'js-web-static',
    'js-web-static-snippet-vue': 'js-web-static',
    // Liquid
    'liquid-async-dynamic-section': 'liquid-async-section',
    'liquid-async-dynamic-section-trigger': 'liquid-async-trigger-section',
    'liquid-async-dynamic-snippet': 'liquid-async-section',
    'liquid-global-dynamic-section': 'liquid-global-section',
    'liquid-global-dynamic-snippet': 'liquid-global-snippet',
    'liquid-web-dynamic-block': 'liquid-web',
    'liquid-web-dynamic-section': 'liquid-web',
    'liquid-web-dynamic-snippet': 'liquid-web-snippet',
    'liquid-web-limited-block': 'liquid-web',
    'liquid-web-limited-section': 'liquid-web',
    'liquid-web-limited-snippet': 'liquid-web-snippet',
    'liquid-web-static-block': 'liquid-web-static',
    'liquid-web-static-section': 'liquid-web-static',
    'liquid-web-static-snippet': 'liquid-web-static-snippet',
    // Schemas
    'schema-async': 'schema',
    'schema-global': 'schema-global',
    'schema-web': 'schema',
    // Stories
    'story-async': 'story',
    'story-global': 'story',
    'story-web': 'story-web',
    // Stylesheets
    'stylesheet-block': 'stylesheet-snippet',
    'stylesheet-section': 'stylesheet',
    'stylesheet-snippet': 'stylesheet-snippet',
  }

  return reference[templateName] ? reference[templateName] : templateName
}
