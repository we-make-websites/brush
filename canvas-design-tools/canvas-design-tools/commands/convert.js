#!/usr/bin/env node
/**
 * Design: Convert
 * -----------------------------------------------------------------------------
 * Converts `tokens.json` file into variables and classes stylesheets.
 *
 */
/* eslint-disable no-console, prefer-promise-reject-errors */
const fs = require('fs-extra')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const classApi = require('../apis/classes')
const styleguideApi = require('../apis/styleguide')
const variableApi = require('../apis/variables')

const config = require('../helpers/design-config')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv

/**
 * Initialises the design functionality.
 */
async function init() {
  logBanner()
  const start = performance.now()
  const designPaths = getPaths()

  /**
   * Load tokens file.
   */
  let tokens = await fs.readFile(Paths.canvas.tokens, 'utf-8')
  tokens = JSON.parse(tokens)

  /**
   * Build arrays of data.
   */
  const variables = variableApi.findVariables(tokens)
  const classes = classApi.findTokens(tokens, variables)

  /**
   * Create message arrays.
   */
  const fileMessages = []
  const storybookFileMessages = []

  try {
    await writeVariablesStylesheets({ designPaths, fileMessages, variables })
    await writeVariablesScripts(variables)
    await writeClassesStylesheets({ classes, designPaths, fileMessages, variables })
    await writeStyleguideContent({ classes, storybookFileMessages, variables })

  } catch (error) {
    Tny.message([
      Tny.colour('red', `❌ ${error.message}`),
      '',
      error.error,
    ])

    process.exit()
  }

  outputMessaging({ fileMessages, start, storybookFileMessages })
}

/**
 * Write variables stylesheets.
 * @param {Object} designPaths - Paths to write files to.
 * @param {Array} fileMessages - File messages.
 * @param {Object} variables - Formatted variables.
 * @returns {Promise}
 */
function writeVariablesStylesheets({ designPaths, fileMessages, variables }) {
  return new Promise(async(resolve, reject) => {
    try {
      const queue = []

      for (const stylesheet of config.stylesheets.variables) {
        const designPath = designPaths[stylesheet.handle]
        const action = fs.existsSync(designPath.write) ? 'updated' : 'created'

        queue.push(fs.writeFile(
          designPath.write,
          variableApi.buildStyles(variables, stylesheet),
          'utf-8',
        ))

        fileMessages.push(`${stylesheet.name} variables stylesheet ${action} ${Tny.colour('brightBlack', `(${designPath.output})`)}`)
      }

      await Promise.all(queue)
      resolve()

    } catch (error) {
      reject({ error, message: 'Failed to write variables stylesheets' })
    }
  })
}

/**
 * Write variables scripts.
 * @param {Object} variables - Formatted variables.
 * @returns {Promise}
 */
function writeVariablesScripts(variables) {
  return new Promise(async(resolve, reject) => {
    try {
      await variableApi.buildScripts(variables)
      resolve()

    } catch (error) {
      reject({ error, message: 'Failed to write variables scripts' })
    }
  })
}

/**
 * Write classes stylesheets.
 * @param {Object} classes - Formatted classes.
 * @param {Object} designPaths - Paths to write files to.
 * @param {Array} fileMessages - File messages.
 * @param {Object} variables - Formatted variables.
 * @returns {Promise}
 */
function writeClassesStylesheets({ classes, designPaths, fileMessages, variables }) {
  return new Promise(async(resolve, reject) => {
    try {
      const queue = []

      for (const stylesheet of config.stylesheets.classes) {
        const designPath = designPaths[stylesheet.handle]
        const action = fs.existsSync(designPath.write) ? 'updated' : 'created'

        queue.push(fs.writeFile(
          designPath.write,
          classApi.buildStyles(classes, variables, stylesheet),
          'utf-8',
        ))

        fileMessages.push(`${stylesheet.name} classes stylesheet ${action} ${Tny.colour('brightBlack', `(${designPath.output})`)}`)
      }

      await Promise.all(queue)
      resolve()

    } catch (error) {
      reject({ error, message: 'Failed to write classes stylesheets' })
    }
  })
}

/**
 * Write classes stylesheets.
 * @param {Object} classes - Formatted classes.
 * @param {Array} storybookFileMessages - Storybook file messages.
 * @param {Object} variables - Formatted variables.
 * @returns {Promise}
 */
function writeStyleguideContent({ classes, storybookFileMessages, variables }) {
  return new Promise(async(resolve, reject) => {
    try {
      const templatesToLoad = [
        'animation',
        'color',
        'forms',
        'grid',
        'icons',
        'misc',
        'spacing',
        'styles',
        'typography',
      ]

      await styleguideApi.build(classes, variables, templatesToLoad)

      for (const template of templatesToLoad) {
        const filename = template === 'styles'
          ? 'storybook-styleguide.scss'
          : `styleguide-${template}.stories.mdx`

        const rootPath = template === 'styles'
          ? Paths.storybook.assets
          : Paths.storybook.stories

        const filepath = path.join(rootPath, filename)
        const action = fs.existsSync(filepath) ? 'updated' : 'created'
        let output = filepath.split(/\.storybook[/\\]/g)[1]
        output = path.join('.storybook', output)

        storybookFileMessages.push(
          `Styleguide ${template} ${action} ${Tny.colour('brightBlack', `(${output})`)}`,
        )
      }

      resolve()

    } catch (error) {
      reject({ error, message: 'Failed to write styleguide content' })
    }
  })
}

/**
 * Output messaging.
 * @param {Array} fileMessages - File messages.
 * @param {Number} start - Start time of command.
 * @param {Array} storybookFileMessages - Storybook file messages.
 */
function outputMessaging({ fileMessages, start, storybookFileMessages }) {
  config.scripts.forEach((script) => {
    const scriptPath = argv.path
      ? path.resolve(argv.path, `${script.filename}.js`)
      : path.resolve(Paths.scripts.config, `${script.filename}.js`)

    const action = fs.existsSync(scriptPath) ? 'updated' : 'created'

    let scriptOutput = scriptPath.split(/src[/\\]/g)[1]
    scriptOutput = path.join('src', scriptOutput)

    fileMessages.push(
      `${script.name} config script ${action} ${Tny.colour('brightBlack', `(${scriptOutput})`)}`,
    )
  })

  /**
   * Add decorations.
   */
  const formattedFileMessages = fileMessages.map((message, index) => {
    const decoration = index === fileMessages.length - 1
      ? '└──'
      : '├──'

    return `${decoration} ${message}`
  })

  const formattedStorybookFileMessages = storybookFileMessages.map((message, index) => {
    const decoration = index === storybookFileMessages.length - 1
      ? '└──'
      : '├──'

    return `${decoration} ${message}`
  })

  /**
   * Output messages.
   */
  const end = performance.now()

  Tny.message([
    Tny.colour('green', '📑 Variables files created'),
    Tny.colour('green', '🎨 Classes files created'),
    Tny.colour('green', '📚 Storybook files created'),
    Tny.time(start, end),
    '',
    Tny.colour('brightCyan', '📂 Canvas files'),
    ...formattedFileMessages,
    '',
    Tny.colour('brightCyan', '📂 Storybook files'),
    ...formattedStorybookFileMessages,
  ])
}

/**
 * Utilities
 * -----------------------------------------------------------------------------
 * Utility classes to above functions.
 *
 */

/**
 * Log banner to console.
 */
function logBanner() {
  Tny.message([
    Tny.colour('bgCyan', 'Canvas generate v{{canvas version}}'),
    Tny.colour('bgCyan', 'Design command'),
  ], { empty: argv.clear !== false })
}

/**
 * Get paths to files.
 * - Use --path to define custom path location.
 * @returns {Object}
 */
function getPaths() {
  const designPaths = {}

  /**
   * Build object for each classes stylesheet.
   */
  for (const stylesheet of config.stylesheets.classes) {
    designPaths[stylesheet.handle] = buildPathObject(stylesheet)
  }

  /**
   * Build object for each variables stylesheet.
   */
  for (const stylesheet of config.stylesheets.variables) {
    designPaths[stylesheet.handle] = buildPathObject(stylesheet)
  }

  /**
   * Return object.
   */
  return designPaths
}

/**
 * Build path object.
 * @param {Object} stylesheet - Stylesheet object with path.
 * @returns {Object}
 */
function buildPathObject(stylesheet) {
  const filepath = argv.path ? argv.path : stylesheet.path
  fs.ensureDir(filepath)

  const write = path.resolve(filepath, `${stylesheet.handle}.scss`)
  const srcPath = write.split(/src[/\\]/g)[1]
  const output = path.join('src', srcPath)

  return {
    output,
    write,
  }
}

/**
 * Export design command.
 */
init()
