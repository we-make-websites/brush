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

let ports = {}

/**
 * Initialises the preview functionality.
 */
async function init() {
  try {
    ports = await getPorts()
    await createBrowsersync()

  } catch (error) {
    Tny.message([
      Tny.colour('red', '❌ Error creating Browsersync'),
      error,
    ])
  }

  try {
    await runPreview()

  } catch (error) {
    Tny.message([
      Tny.colour('red', '❌ Error creating templates'),
      error,
    ])
  }
}

/**
 * Run preview.
 * - Single function to run each time a file change is detected.
 * @param {Boolean} [watch] - Function is being run from watch.
 * @returns {Promise}
 */
function runPreview(watch) {
  return new Promise(async(resolve, reject) => {
    try {
      messagesApi.logBanner()

      if (watch) {
        Tny.message('⏳ Building emails')
      }

      const start = performance.now()
      const content = await findTemplates()
      const count = await renderTemplates(content)
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
      const indexContext = require(Paths.context.index)
      resolve({ filepaths, indexContext })

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
 * @returns {Promise}
 */
function renderTemplates({ filepaths, indexContext }) {
  return new Promise(async(resolve, reject) => {
    try {
      let count = 0

      for (const filepath of filepaths) {
        const filename = filepath.split(path.sep).reverse()[0]
        const template = await getTemplate(filepath)

        /**
         * Find template specific context (if it exists).
         */
        const contextFilepath = path.join(Paths.context.root, filename.replace('.liquid', '.js'))
        let context = {}

        if (fs.existsSync(contextFilepath)) {
          context = require(contextFilepath)
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
 * @param {String} filepath - Path to file.
 * @returns {String}
 */
function getTemplate(filepath) {
  return new Promise(async(resolve, reject) => {
    try {
      let template = await fs.readFile(filepath, 'utf-8')

      template = template
        .replaceAll(
          `{{ 'notifications/spacer.png' | shopify_asset_url }}`,
          'https://cdn.shopify.com/shopifycloud/shopify/assets/themes_support/notifications/spacer-1a26dfd5c56b21ac888f9f1610ef81191b571603cb207c6c0f564148473cab3c.png',
        )

      resolve(template)

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
 * @returns {Promise}
 */
function createBrowsersync() {
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

          await runPreview(true)
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
