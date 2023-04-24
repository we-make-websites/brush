#!/usr/bin/env node
/**
 * Email: Preview
 * -----------------------------------------------------------------------------
 * Preview email notification templates.
 *
 */
/* eslint-disable no-await-in-loop */
const fs = require('fs-extra')
const { Liquid } = require('liquidjs')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')

const messagesApi = require('../apis/messages')

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
  messagesApi.logBanner()
  const start = performance.now()

  try {
    await renderLiquidTemplates()
    const end = performance.now()

    Tny.message([
      Tny.colour('green', '📨 Email templates created'),
      Tny.time(start, end),
    ])

  } catch (error) {
    Tny.message([
      Tny.colour('red', '❌ Error creating templates'),
      error,
    ])
  }
}

/**
 * Renders Liquid templates.
 * @returns {Promise}
 */
function renderLiquidTemplates() {
  return new Promise(async(resolve, reject) => {
    await fs.ensureDir(Paths.dist)
    let templates = []
    let indexContext = {}

    /**
     * Find templates and index context.
     */
    try {
      templates = await fs.readdir(Paths.templates)
      indexContext = require(Paths.context.index)

    } catch (error) {
      reject(error)
      return
    }

    /**
     * Go through each template and parse Liquid based on associated context.
     */
    try {
      for (const filename of templates) {
        const filepath = path.join(Paths.templates, filename)
        const template = await fs.readFile(filepath, 'utf-8')

        const contextFilepath = path.join(Paths.context.root, filename.replace('.liquid', '.js'))
        let context = {}

        if (fs.existsSync(contextFilepath)) {
          context = require(contextFilepath)
        }

        const output = await engine.parseAndRender(template, {
          ...indexContext,
          ...context,
        })

        await fs.writeFile(
          path.join(Paths.dist, 'order-confirmation.html'),
          output,
          'utf-8',
        )
      }

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
