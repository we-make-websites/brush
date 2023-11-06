#!/usr/bin/env node
/**
 * Converter: Convert
 * -----------------------------------------------------------------------------
 * Converts Vue template into Liquid.
 *
 */
/* eslint-disable no-await-in-loop */
const { prompt } = require('enquirer')
const fs = require('fs-extra')
const path = require('path')
const fileSync = require('@we-make-websites/file-sync')
const Tny = require('@we-make-websites/tannoy')
const Track = require('@we-make-websites/track')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const liquidApi = require('../apis/liquid')
const vueApi = require('../apis/vue')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv
let convertArray = []
const debugMode = argv.debug || argv.allComponents

/**
 * Initialises the convert functionality.
 */
async function init() {
  logBanner()
  let start = 0
  const messages = []

  /**
   * Check if required folder exists.
   */
  if (
    !fs.existsSync(Paths.components.async) ||
    !fs.existsSync(Paths.components.global)
  ) {
    Tny.message(Tny.colour('red', '❌ Components folder does not exist'))
    return
  }

  /**
   * Determine component path to convert.
   */
  try {
    if (argv.component) {
      const parts = argv.component.split('/')
      const type = parts[0]
      const handle = parts[parts.length - 1]
      let folder = parts.length === 3 ? parts[1] : handle

      if (folder === 'utils') {
        folder = `utils/${handle}`
      }

      convertArray = [path.join(Paths.components.root, type, folder, `${handle}.vue`)]

    } else {
      convertArray = await askPathQuestion()
    }

  } catch (error) {
    Tny.message(Tny.colour('red', error), { before: true })
    Track.reportError(new Error(error))
  }

  /**
   * Convert each file into AST data then Liquid.
   */
  try {
    start = performance.now()

    if (debugMode) {
      await fs.emptyDir(Paths.debug)
    }

    for (const filepath of convertArray) {
      const file = path.parse(filepath)
      const astData = await vueApi.convertTemplate(filepath)

      if (!astData) {
        messages.push(Tny.colour('red', `❌ ${file.name}.vue has no template to convert`))
        continue
      }

      const template = await liquidApi.buildTemplate(astData, filepath)

      const writePath = debugMode
        ? path.resolve(Paths.debug, `${file.name}.liquid`)
        : path.resolve(file.dir, 'converted.liquid')

      fs.writeFile(writePath, template)
      messages.push(Tny.colour('green', `🧪 ${file.name}.vue converted into Liquid`))
    }

  } catch (error) {
    Tny.message([
      Tny.colour('red', error.error),
      error.filepath,
      `Error in the ${error.api} API`,
    ])

    Track.reportError(new Error(error))
  }

  /**
   * Output results.
   */
  const end = performance.now()

  if (debugMode) {
    messages.push(Tny.colour('magenta', `💾 Converted file${convertArray.length === 1 ? '' : 's'} saved to dependency folder`))
  }

  messages.push(Tny.time(start, end))
  Tny.message(messages)
}

/**
 * Log banner to console.
 */
function logBanner() {
  const version = getPackageVersion()

  Tny.message([
    Tny.colour('bgCyan', `Converter beta v${version}`),
    Tny.colour('bgCyan', 'Convert command'),
  ], { empty: true })
}

/**
 * Ask path question.
 * @returns {Promise}
 */
function askPathQuestion() {
  return new Promise(async(resolve) => {
    let question = {}

    const filepaths = [...fileSync(Paths.components.root, ['vue'])]

    if (argv.allComponents) {
      // Sort filepaths by filename
      convertArray = filepaths
        .map((filepath) => path.parse(filepath).name)
        .sort()
        .map((name) => filepaths.find((filepath) => path.parse(filepath).name === name))

      resolve(convertArray)
      return
    }

    const choices = filepaths
      .map((filepath) => path.parse(filepath).name)
      .sort()

    try {
      question = await prompt({
        choices,
        hint: '(Type to filter)',
        message: 'Component',
        name: 'answer',
        pointer: () => '',
        prefix: '📂',
        result(answer) {
          return filepaths.find((filepath) => filepath.includes(answer))
        },
        type: 'autocomplete',
      })

    } catch (error) {
      Tny.message(Tny.colour('red', '⛔ Process exited'))
      process.exit()
    }

    resolve([question.answer])
  })
}

/**
 * Utilities.
 * -----------------------------------------------------------------------------
 * Utility functions.
 *
 */

/**
 * Get converter package version.
 * - Can't access from process.env.npm_package_version (returns Canvas version).
 * @returns {String}
 */
function getPackageVersion() {
  const packagePath = path.resolve('node_modules', '@we-make-websites/converter/package.json')

  if (!fs.existsSync(packagePath)) {
    return '{{canvas version}}'
  }

  const toolPackage = require(packagePath)
  return toolPackage.version
}

/**
 * Run convert command.
 */
init()
