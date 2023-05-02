/**
 * API: Build
 * -----------------------------------------------------------------------------
 * Functions to build parts of the template file.
 *
 */
const cssnano = require('@node-minify/cssnano')
const fs = require('fs-extra')
const minify = require('@node-minify/core')
const path = require('path')

const getFilesInFolder = require('../helpers/get-files-in-folder')
const Paths = require('../helpers/paths')

/**
 * Builds CSS.
 * @param {String} data.filename - Filename.
 * @param {String} data.indexStyles - Styles used in all templates.
 * @param {Array} data.stylePaths - CSS stylesheet filepaths.
 * @param {String} data.template - Current template.
 * @returns {Promise}
 */
function css({ filename, indexStyles, stylePaths, template }) {
  return new Promise(async(resolve, reject) => {
    try {
      let updatedTemplate = template.replace('<link rel="stylesheet" type="text/css" href="/assets/notifications/styles.css">', '')
      const styleName = filename.replace('.liquid', '.css')
      const queue = []

      /**
       * Load CSS files with matching filename.
       */
      for (const filepath of stylePaths) {
        if (filepath.includes('index.css') || !filepath.includes(styleName)) {
          continue
        }

        queue.push(fs.readFile(filepath, 'utf-8'))
      }

      const newStyles = await Promise.all(queue)

      /**
       * Add index and matching styles.
       */
      let styles = `${indexStyles}\n`
      styles += `${newStyles.join('\n')}\n`

      /**
       * Minify CSS.
       */
      styles = await minify({
        compressor: cssnano,
        content: styles,
      })

      /**
       * Get existing styles in file's <style> tags.
       * - Add them last for increased specificity.
       */
      let inlineStyles = updatedTemplate.match(/<style>(?<styles>.*)<\/style>/gs)

      if (inlineStyles) {
        inlineStyles = inlineStyles[0].replace('<style>', '').replace('</style>', '')
        styles += inlineStyles.replaceAll('  ', '')
      }

      /**
       * Update template.
       * - Inject into <style> tag if it exists, otherwise create it.
       */
      if (updatedTemplate.includes('<style>')) {
        updatedTemplate = updatedTemplate.replace(
          /<style>(?<styles>.*)<\/style>/gs,
          `<style>${styles}</style>`,
        )

        resolve(updatedTemplate)
        return
      }

      updatedTemplate = updatedTemplate.replace(
        '</head>',
        `<style>${styles}</style>\n</head>`,
      )

      resolve(updatedTemplate)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Builds HTML.
 * @param {String} template - Current template.
 * @returns {Promise}
 */
function html(template) {
  return new Promise((resolve) => {
    const updatedTemplate = template
      .replaceAll(
        `{{ 'notifications/spacer.png' | shopify_asset_url }}`,
        'https://cdn.shopify.com/shopifycloud/shopify/assets/themes_support/notifications/spacer-1a26dfd5c56b21ac888f9f1610ef81191b571603cb207c6c0f564148473cab3c.png',
      )
      .replaceAll(
        `{{ 'notifications/discounttag.png' | shopify_asset_url }}`,
        'https://cdn.shopify.com/shopifycloud/shopify/assets/themes_support/notifications/discounttag-d1f7c6d9334582b151797626a5ae244c56af0791fcd7841f21027dd44830bcc6.png',
      )
      .replaceAll(
        'money_with_currency',
        `money | append: ' ' | append: shop.currency`,
      )

    resolve(updatedTemplate)
  })
}

/**
 * Builds index page.
 */
function index() {
  return new Promise(async(resolve, reject) => {
    const filepaths = getFilesInFolder(Paths.templates, ['liquid'])

    /**
     * Build objects from filepaths to reflect folder structure.
     */
    const structure = {}

    for (const filepath of filepaths) {
      const folderPath = filepath.replace(`${Paths.templates}${path.sep}`, '').split(path.sep)
      const folder = folderPath[0]

      if (!structure[folder]) {
        const name = folder.replace('-', ' ')

        structure[folder] = {
          handle: folder,
          name: `${name.slice(0, 1).toUpperCase()}${name.slice(1)}`,
          paths: [],
        }
      }

      structure[folder].paths.push({
        distPath: folderPath[1].replace('.liquid', '.html'),
        filename: folderPath[1],
        filepath,
      })
    }

    /**
     * Build HTML groups.
     */
    const groups = Object.values(structure).map((folder) => {
      let template = `<strong>${folder.name}</strong>\n\n`
      template += '    <ul>\n'

      folder.paths.forEach((item) => {
        template += `      <li><a href="${item.distPath}" data-page="${item.filename}" js-iframe="link">${item.filename}</a>\n`
      })

      template += '    </ul>'

      return template
    }).join('\n\n    ')

    try {
      let contents = await fs.readFile(Paths.index, 'utf-8')
      contents = contents.replace('<%= groups %>', groups)

      await fs.writeFile(path.join(Paths.dist, 'index.html'), contents, 'utf-8')
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Builds Liquid.
 * @param {Object} data.engine - Liquid parsing engine.
 * @param {String} data.filename - Filename.
 * @param {Object} data.indexContext - Context used in all templates.
 * @param {String} data.template - Current template.
 * @returns {Promise}
 */
function liquid({ engine, filename, indexContext, template }) {
  return new Promise(async(resolve, reject) => {
    try {

      /**
       * Find template specific context if it exists.
       */
      const contextFilepath = path.join(Paths.context.root, filename.replace('.liquid', '.json'))
      let context = {}

      if (fs.existsSync(contextFilepath)) {
        context = await fs.readJSON(contextFilepath)
      }

      /**
       * Use LiquidJS to parse and render Liquid in template.
       * - Combines index and template-specific contexts.
       */
      const output = await engine.parseAndRender(template, {
        ...indexContext,
        ...context,
      })

      resolve(output)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export API.
 */
module.exports = {
  css,
  html,
  index,
  liquid,
}
