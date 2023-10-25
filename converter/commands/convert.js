#!/usr/bin/env node
/**
 * Converter: Convert
 * -----------------------------------------------------------------------------
 * Converts Vue template into Liquid
 *
 */
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

/**
 * Initialises the convert functionality.
 */
async function init() {
  logBanner()
  let convertPath = ''
  let start = 0
  let astData = {}

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
      const folder = argv.component.split('/')[0]
      const component = argv.component.split('/')[1]
      convertPath = path.join(Paths.components.root, folder, component, `${component}.vue`)

    } else {
      convertPath = await askPathQuestion()
    }

  } catch (error) {
    Tny.message(Tny.colour('red', error), { before: true })
    Track.reportError(new Error(error))
  }

  /**
   * Convert Vue into AST.
   */
  try {
    start = performance.now()
    astData = await vueApi.convertTemplate(convertPath)

    if (argv.debug) {
      fs.writeJson(Paths.debug.json, astData)
    }

  } catch (error) {
    Tny.message(Tny.colour('red', error), { before: true })
    Track.reportError(new Error(error))
  }

  /**
   * Build Liquid template.
   */
  try {
    const template = await liquidApi.buildTemplate(astData)

    if (argv.debug) {
      fs.writeFile(Paths.debug.liquid, template)
    }

  } catch (error) {
    Tny.message(Tny.colour('red', error), { before: true })
    Track.reportError(new Error(error))
  }

  /**
   * Output results.
   */
  const end = performance.now()
  const messages = [Tny.colour('green', '🚀 Vue converted into Liquid')]
  messages.push(Tny.time(start, end))
  Tny.message(messages)
}

/**
 * Log banner to console.
 */
function logBanner() {
  const version = getPackageVersion()

  Tny.message([
    Tny.colour('bgCyan', `Convertor ${version}`),
    Tny.colour('bgCyan', 'Convert command'),
  ], { empty: true })
}

/**
 * Ask path question.
 */
async function askPathQuestion() {
  let question = {}

  const filepaths = [...fileSync(Paths.components.root, ['vue'])]

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

  return new Promise((resolve) => {
    resolve(question.answer)
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
