/**
 * Helper: Config
 * -----------------------------------------------------------------------------
 * Single source of truth for config settings in Converter.
 *
 */

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  noRenderProps: [
    'is',
    'key',
    'on',
    'ref',
  ],
  noRenderTags: ['teleport', 'template'],
  validHtmlTags: [
    'a',
    'abbr',
    'address',
    'article',
    'aside',
    'audio',
    'blockquote',
    'br',
    'button',
    'canvas',
    'caption',
    'component',
    'div',
    'em',
    'footer',
    'form',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'iframe',
    'img',
    'input',
    'label',
    'li',
    'main',
    'ol',
    'p',
    'picture',
    'pre',
    'section',
    'source',
    'span',
    'strong',
    'table',
    'td',
    'th',
    'tr',
    'ul',
    'video',
  ],
  vConditionals: ['if', 'else-if', 'else', 'for', 'show'],
  vContent: ['html', 'text'],
  vElseConditionals: ['else-if', 'else'],
}
