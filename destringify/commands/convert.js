#!/usr/bin/env node
/**
 * Destringify: Convert
 * -----------------------------------------------------------------------------
 * Converts Dawn section setting locale strings into plain strings.
 *Á
 */
/* eslint-disable no-await-in-loop */
const { prompt } = require('enquirer')
const fs = require('fs-extra')
const path = require('path')
const fileSync = require('@we-make-websites/file-sync')
const Tny = require('@we-make-websites/tannoy')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const convertApi = require('../apis/convert')

const getSectionSchema = require('../helpers/get-section-schema')
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
  const start = 0
  const messages = []

  /**
   * Determine section path to convert.
   */
  let projectPath = Paths.root

  if (argv.local) {
    const rootPath = argv.path
      ? path.join('../../', argv.path)
      : '../../'

    projectPath = argv.project
      ? path.join(rootPath, argv.project)
      : await askProjectPathQuestion(rootPath)
  }

  /**
   * Determine section to convert.
   */
  const sections = await askSectionQuestion(projectPath)

  if (!sections.length) {
    messages.push(Tny.colour('red', '❌ No sections found'))
  }

  /**
   * Convert each section settings into plain string JSON object.
   */
  const localePrefix = argv.language ? argv.language : 'en.default'

  const localesPath = argv.local
    ? path.join(projectPath, 'locales', `${localePrefix}.schema.json`)
    : path.join(Paths.locales, `${localePrefix}.schema.json`)

  const locales = await fs.readJson(localesPath)

  await fs.emptyDir(Paths.output)

  for (const section of sections) {
    const file = path.parse(section)
    const schema = await getSectionSchema(section)

    if (!schema) {
      messages.push(Tny.colour('red', `❌ ${file.name}.liquid failed (no schema found)`))
      continue
    }

    const formattedSchema = await convertApi.convertSchema(schema, locales)

    const writePath = path.resolve(Paths.output, `${file.name}.json`)
    fs.writeJSON(writePath, formattedSchema, { spaces: 2 })

    messages.push(Tny.colour('green', `🧪 ${file.name}.json converted`))
  }

  /**
   * Output results.
   */
  const end = performance.now()
  messages.push(Tny.time(start, end))
  Tny.message(messages)
}

/**
 * Log banner to console.
 */
function logBanner() {
  const version = getPackageVersion()

  Tny.message([
    Tny.colour('bgCyan', `Destringify v${version}`),
    Tny.colour('bgCyan', 'Convert command'),
  ], { empty: true })
}

/**
 * Ask project path question.
 * @param {String} rootPath - Path to root folder to search for project in.
 * @returns {Promise}
 */
function askProjectPathQuestion(rootPath) {
  return new Promise(async(resolve) => {
    let question = {}

    /**
     * Find all folders at root path.
     */
    const choices = fs
      .readdirSync(rootPath, { withFileTypes: true })
      .filter((folder) => {
        if (folder.name === '.github') {
          return false
        }

        return folder.isDirectory()
      })
      .map((folder) => folder.name)

    /**
     * Ask question.
     */
    try {
      question = await prompt({
        choices,
        hint: '(Type to filter)',
        message: 'Project folder',
        name: 'answer',
        pointer: () => '',
        prefix: '📂',
        result(answer) {
          return path.join(rootPath, answer)
        },
        type: 'autocomplete',
      })

    } catch (error) {
      Tny.message(Tny.colour('red', '⛔ Process exited'))
      process.exit()
    }

    resolve(question.answer)
  })
}

/**
 * Ask sections question.
 * @param {String} projectPath - Path to project folder.
 * @returns {Promise}
 */
function askSectionQuestion(projectPath) {
  return new Promise(async(resolve) => {
    const sectionsPath = path.join(projectPath, 'sections')
    let question = {}

    /**
     * Determine if sections folder exists.
     */
    if (!fs.existsSync(sectionsPath)) {
      Tny.message([
        Tny.colour('red', '❌ No sections/ folder found'),
        Tny.colour('red', '   Ensure you\'ve selected a Dawn project'),
      ])

      process.exit()
    }

    const filepaths = fileSync(sectionsPath, {
      array: true,
      filter: ['.liquid'],
      return: 'parse',
    })

    /**
     * Return section for flag.
     */
    if (argv.section) {
      const section = filepaths
        .filter((file) => file.name === argv.section)
        .map((file) => file.path)

      resolve(section)
      return
    }

    /**
     * Return all sections for flag.
     */
    if (argv.allSections) {
      // Sort filepaths by filename
      const convertArray = filepaths
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((file) => file.path)

      resolve(convertArray)
      return
    }

    const choices = filepaths
      .map((file) => file.name)
      .sort()

    try {
      question = await prompt({
        choices,
        hint: '(Type to filter)',
        message: 'Section',
        name: 'answer',
        pointer: () => '',
        prefix: '💧',
        result(answer) {
          return filepaths
            .filter((file) => file.name === answer)
            .map((file) => file.path)
        },
        type: 'autocomplete',
      })

    } catch (error) {
      Tny.message(Tny.colour('red', '⛔ Process exited'))
      process.exit()
    }

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
