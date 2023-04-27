#!/usr/bin/env node
/**
 * Email: Preview
 * -----------------------------------------------------------------------------
 * Preview email notification templates.
 *
 */
/* eslint-disable no-await-in-loop */
const bs = require('browser-sync').create()
const fs = require('fs-extra')
const { Liquid } = require('liquidjs')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')

const filtersApi = require('../apis/filters')
const messagesApi = require('../apis/messages')

const getBrowsersyncConfig = require('../helpers/get-browsersync-config')
const getPorts = require('../helpers/get-ports')
const getFilesInFolder = require('../helpers/get-files-in-folder')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const engine = new Liquid({
  extname: '.liquid',
  root: Paths.templates,
})

/**
 * Initialises the preview functionality.
 */
async function init() {
  const ports = await getPorts()

  try {
    Object.entries(filtersApi).forEach(([key, value]) => {
      engine.registerFilter(key, value)
    })

    await runPreview(ports)

  } catch (error) {
    Tny.message([
      Tny.colour('red', '❌ Error creating templates'),
      Tny.colour('red', '❌ Please fix and run command again'),
      error,
    ])

    return
  }

  try {
    await createBrowsersync(ports)

  } catch (error) {
    Tny.message([
      Tny.colour('red', '❌ Error creating Browsersync'),
      error,
    ])
  }
}

/**
 * Run preview.
 * - Single function to run each time a file change is detected.
 * @param {Object} ports - Browsersync ports.
 * @param {Boolean} [watch] - Function is being run from watch.
 * @returns {Promise}
 */
function runPreview(ports, watch) {
  return new Promise(async(resolve, reject) => {
    try {
      messagesApi.logBanner()

      if (watch) {
        Tny.message('⏳ Building emails')
      }

      const start = performance.now()
      const { filepaths, indexContext } = await findTemplates()
      const { indexStyles, stylePaths } = await findStyles()
      const count = await renderTemplates({ filepaths, indexContext, indexStyles, stylePaths })
      await renderIndexPage()

      if (watch) {
        messagesApi.logBanner()
      }

      messagesApi.logBuild({ count, start, watch })

      Tny.message([
        Tny.colour('green', '👀 Watching for changes'),
        '',
        Tny.colour('magenta', '🔗 Localhost URLs'),
        `📧 http://localhost:${ports.browsersync} ${Tny.colour('brightBlack', '(Emails)')}`,
        `💻 http://localhost:${ports.ui} ${Tny.colour('brightBlack', '(Browsersync UI)')}`,
      ])

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Finds Liquid templates.
 * @returns {Promise}
 */
function findTemplates() {
  return new Promise(async(resolve, reject) => {
    try {
      await fs.ensureDir(Paths.dist)
      const filepaths = getFilesInFolder(Paths.templates, ['liquid'])
      const indexContext = await fs.readJSON(Paths.context.index)
      resolve({ filepaths, indexContext })

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Finds CSS files.
 * @returns {Promise}
 */
function findStyles() {
  return new Promise(async(resolve, reject) => {
    try {
      const stylePaths = getFilesInFolder(Paths.styles.root, ['css'])
      const indexStyles = await fs.readFile(Paths.styles.index, 'utf-8')
      resolve({ indexStyles, stylePaths })

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Renders Liquid templates.
 * - Go through each template and parse Liquid based on associated context.
 * @param {Array} data.filepaths - Liquid template filepaths.
 * @param {Object} data.indexContext - Context used in all templates.
 * @param {String} data.indexStyles - Styles used in all templates.
 * @param {Array} data.stylePaths - CSS stylesheet filepaths.
 * @returns {Promise}
 */
function renderTemplates({ filepaths, indexContext, indexStyles, stylePaths }) {
  return new Promise(async(resolve, reject) => {
    try {
      let count = 0

      for (const filepath of filepaths) {
        const filename = filepath.split(path.sep).reverse()[0]
        const template = await getTemplate({ filename, filepath, indexStyles, stylePaths })

        /**
         * Find template specific context (if it exists).
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

        /**
         * Write parsed file to dist/ folder.
         */
        const writeFilepath = path.join(Paths.dist, filename.replace('.liquid', '.html'))
        await fs.writeFile(writeFilepath, output, 'utf-8')
        count += 1
      }

      resolve(count)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Read and update template before parsing.
 * @param {String} data.filename - Filename.
 * @param {String} data.filepath - Path to file.
 * @param {String} data.indexStyles - Styles used in all templates.
 * @param {Array} data.stylePaths - CSS stylesheet filepaths.
 * @returns {String}
 */
function getTemplate({ filename, filepath, indexStyles, stylePaths }) {
  return new Promise(async(resolve, reject) => {
    try {
      let template = await fs.readFile(filepath, 'utf-8')

      template = template
        .replaceAll(
          `{{ 'notifications/spacer.png' | shopify_asset_url }}`,
          'https://cdn.shopify.com/shopifycloud/shopify/assets/themes_support/notifications/spacer-1a26dfd5c56b21ac888f9f1610ef81191b571603cb207c6c0f564148473cab3c.png',
        )

      /**
       * If it contains style.css link then embed the styles and remove <link>.
       */
      if (template.includes('<link rel="stylesheet" type="text/css" href="/assets/notifications/styles.css">')) {
        template = template.replace('<link rel="stylesheet" type="text/css" href="/assets/notifications/styles.css">', '')
        template = await injectStyles({ filename, indexStyles, stylePaths, template })
      }

      resolve(template)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Inject stylesheet files into <style> tag.
 * @param {String} data.filename - Filename.
 * @param {String} data.indexStyles - Styles used in all templates.
 * @param {Array} data.stylePaths - CSS stylesheet filepaths.
 * @param {String} data.template - Current template.
 * @returns {Promise}
 */
function injectStyles({ filename, indexStyles, stylePaths, template }) {
  return new Promise(async(resolve, reject) => {
    try {
      let updatedTemplate = template
      const styleName = filename.replace('.liquid', '.css')
      const queue = []

      /**
       * Load CSS files with matching filename.
       */
      for (const filepath of stylePaths) {
        if (filepath.includes('index.css') || !filepath.includes(styleName)) {
          continue
        }

        queue.push(await fs.readFile(filepath, 'utf-8'))
      }

      const newStyles = await Promise.all(queue)

      /**
       * Add index and matching styles.
       */
      let styles = `${indexStyles}\n`
      styles += `${newStyles.join('\n')}\n`

      /**
       * Get existing styles in file's <style> tags.
       * - Add them last for increased specificity.
       */
      let inlineStyles = updatedTemplate.match(/<style>(?<styles>.*)<\/style>/gs)

      if (inlineStyles) {
        inlineStyles = inlineStyles[0].replace('<style>', '').replace('</style>', '')
        styles += `${inlineStyles}\n`
      }

      /**
       * Update template.
       */
      updatedTemplate = updatedTemplate.replace(
        /<style>(?<styles>.*)<\/style>/gs,
        `<style>${styles}</style>`,
      )

      resolve(updatedTemplate)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Render index page for notification navigation.
 * @returns {Promise}
 */
function renderIndexPage() {
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
 * Create Browsersync instance.
 * @param {Object} ports - Browsersync ports.
 * @returns {Promise}
 */
function createBrowsersync(ports) {
  return new Promise((resolve, reject) => {
    try {
      bs.watch(
        'emails/**/*',
        {
          ignored: 'emails/dist/*',
          ignoreInitial: true,
        },
        async(event) => {
          if (event !== 'change' && event !== 'add') {
            return
          }

          await runPreview(ports, true)
          bs.notify('🔥 Updated', 2000)
          bs.reload()
        },
      )

      bs.init(getBrowsersyncConfig(ports))
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Run preview command.
 */
init()
