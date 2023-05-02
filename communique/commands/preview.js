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

const buildApi = require('../apis/build')
const filtersApi = require('../apis/filters')
const messagesApi = require('../apis/messages')

const getBrowsersyncConfig = require('../helpers/get-browsersync-config')
const getFilesInFolder = require('../helpers/get-files-in-folder')
const getPorts = require('../helpers/get-ports')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const engine = new Liquid({
  extname: '.liquid',
  root: [
    Paths.templates,
    Paths.snippets,
  ],
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

      /**
       * Build templates.
       */
      const start = performance.now()
      const { filepaths, indexContext } = await findTemplates()
      const { indexStyles, stylePaths } = await findStyles()
      const count = await renderTemplates({ filepaths, indexContext, indexStyles, stylePaths })

      /**
       * Build index page.
       */
      await buildApi.index()

      /**
       * Update messaging.
       */
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

        let template = await fs.readFile(filepath, 'utf-8')
        template = await buildApi.html(template)
        template = await buildApi.css({ filename, indexStyles, stylePaths, template })
        template = await buildApi.liquid({ engine, filename, indexContext, template })

        /**
         * Write parsed file to dist/ folder.
         */
        const writeFilepath = path.join(Paths.dist, filename.replace('.liquid', '.html'))
        await fs.writeFile(writeFilepath, template, 'utf-8')
        count += 1
      }

      resolve(count)

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
