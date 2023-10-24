/**
 * Helper: Get valid HTML tag
 * -----------------------------------------------------------------------------
 * Get if a HTML tag is valid.
 *
 */

/**
 * Get valid HTML tag.
 * @param {String} tag - Tag to test.
 * @returns {Boolean}
 */
function getValidHtmlTag(tag) {
  const validHtml = [
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
    'source',
    'span',
    'strong',
    'table',
    'td',
    'th',
    'tr',
    'ul',
    'video',
  ]

  return validHtml.includes(tag)
}

/**
 * Export helper.
 */
module.exports = (string) => {
  return getValidHtmlTag(string)
}
