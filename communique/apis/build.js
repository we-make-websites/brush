/**
 * API: Build
 * -----------------------------------------------------------------------------
 * Functions to build parts of the template file.
 *
 */
/* eslint-disable no-await-in-loop */

const cssnano = require('@node-minify/cssnano')
const fs = require('fs-extra')
const minify = require('@node-minify/core')
const path = require('path')

const getFilesInFolder = require('../helpers/get-files-in-folder')
const Paths = require('../helpers/paths')

/**
 * Builds CSS.
 * @param {String} data.filename - Filename.
 * @param {String} [data.indexStyles] - Styles used in all templates.
 * @param {Array} data.stylePaths - CSS stylesheet filepaths.
 * @param {String} data.template - Current template.
 * @param {Boolean} mode - Compile mode, `development` or `production`.
 * @returns {Promise}
 */
function css({ filename, indexStyles, stylePaths, template }, mode) {
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
      let styles = ''

      if (mode !== 'production') {
        styles = `${indexStyles}\n`
      }

      styles += `${newStyles.join('\n')}\n`

      /**
       * Minify CSS.
       * - No need to minify in production because Shopify automatically injects
       *   styles inline when compiling.
       */
      if (mode !== 'production') {
        styles = await minify({
          compressor: cssnano,
          content: styles,
        })
      }

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
 * @param {String} data.template - Current template.
 * @param {Boolean} mode - Compile mode, `development` or `production`.
 * @returns {Promise}
 */
function html({ template }, mode) {
  return new Promise(async(resolve, reject) => {
    try {
      let updatedTemplate = template

      if (mode !== 'production') {
        updatedTemplate = template
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
      }

      /**
       * If in build mode then inject snippet content.
       */
      const regex = new RegExp('{% render \'(?<filename>.+?)\' %}', 'g')
      const renders = updatedTemplate.match(regex)

      if (mode !== 'production' || !renders) {
        resolve(updatedTemplate)
        return
      }

      const snippets = {}

      for (const match of renders) {
        const exec = regex.exec(match)

        if (!exec) {
          continue
        }

        const filename = `${exec.groups.filename}.liquid`
        const filepath = path.join(Paths.snippets, filename)

        if (!fs.existsSync(filepath)) {
          continue
        }

        let snippet = ''

        if (snippets[filename]) {
          snippet = snippets[filename]
        } else {
          snippet = await fs.readFile(filepath, 'utf-8')
          snippets[filename] = snippet
        }

        updatedTemplate = updatedTemplate.replaceAll(match, snippet)
      }

      resolve(updatedTemplate)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Builds index page.
 * @returns {Promise}
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
 * @param {Object} [data.indexContext] - Context used in all templates.
 * @param {String} data.template - Current template.
 * @param {Boolean} mode - Compile mode, `development` or `production`.
 * @returns {Promise}
 */
function liquid({ engine, filename, indexContext, template }, mode) {
  return new Promise(async(resolve, reject) => {
    try {
      if (mode === 'production') {
        resolve(template)
        return
      }

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
