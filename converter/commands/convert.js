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

const vueApi = require('../apis/vue')
const Paths = require('../helpers/paths')

/**
 * Initialises the convert functionality.
 */
async function init() {
  logBanner()
  let convertPath = ''
  let start = 0

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
   * Determine component path.
   */
  try {
    convertPath = await askPathQuestion()

  } catch (error) {
    Tny.message(Tny.colour('red', error), { before: true })
    Track.reportError(new Error(error))
  }

  /**
   * Convert template into Liquid.
   */
  try {
    start = performance.now()
    const astData = await vueApi.convertTemplate(convertPath)
    console.log('astData', astData)
    fs.writeJson(Paths.debug, astData)

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
