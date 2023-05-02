#!/usr/bin/env node
/**
 * Email: Build
 * -----------------------------------------------------------------------------
 * Build email notification templates.
 *
 */
/* eslint-disable no-await-in-loop */

const fs = require('fs-extra')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')

const buildApi = require('../apis/build')
const messagesApi = require('../apis/messages')

const getFilesInFolder = require('../helpers/get-files-in-folder')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const mode = 'production'

/**
 * Initialises the build functionality.
 */
async function init() {
  try {
    await runBuild()

  } catch (error) {
    Tny.message([
      Tny.colour('red', '❌ Error creating templates'),
      Tny.colour('red', '❌ Please fix and run command again'),
      error,
    ])
  }
}

/**
 * Run build.
 * @returns {Promise}
 */
function runBuild() {
  return new Promise(async(resolve, reject) => {
    try {
      messagesApi.logBanner(mode)

      /**
       * Build templates.
       */
      const start = performance.now()
      const filepaths = getFilesInFolder(Paths.templates, ['liquid'])
      const stylePaths = getFilesInFolder(Paths.styles.root, ['css'])
      const count = await renderTemplates({ filepaths, stylePaths })

      /**
       * Update messaging.
       */
      messagesApi.logBuild({ count, start })

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Renders templates.
 * - Go through each template and add CSS and Liquid snippets.
 * @param {Array} data.filepaths - Liquid template filepaths.
 * @param {Array} data.stylePaths - CSS stylesheet filepaths.
 * @returns {Promise}
 */
function renderTemplates({ filepaths, stylePaths }) {
  return new Promise(async(resolve, reject) => {
    try {
      let count = 0

      for (const filepath of filepaths) {
        const filename = filepath.split(path.sep).reverse()[0]

        let template = await fs.readFile(filepath, 'utf-8')
        template = await buildApi.html({ template }, mode)
        template = await buildApi.css({ filename, stylePaths, template }, mode)

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
 * Run build command.
 */
init()
