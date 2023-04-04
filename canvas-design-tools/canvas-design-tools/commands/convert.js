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
const utilitiesApi = require('../apis/utilities')
const variableApi = require('../apis/variables')

const getDesignConfig = require('../helpers/get-design-config')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv
const config = getDesignConfig()
let version = '{{canvas version}}'

/**
 * Initialises the design functionality.
 */
async function init() {
  version = getPackageVersion()
  logBanner()
  const start = performance.now()
  const designPaths = getPaths()

  /**
   * Load tokens file.
   */
  let tokens = await fs.readFile(Paths.tokens, 'utf-8')
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
    await writeUtilityStylesheets({ designPaths, fileMessages, variables })
    await writeClassesStylesheets({ classes, designPaths, fileMessages, variables })

    if (argv.js !== false) {
      await writeVariablesScripts({ fileMessages, variables })
    }

    if (argv.storybook !== false) {
      await writeStyleguideContent({ classes, storybookFileMessages, variables })
    }

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

        fileMessages.push(`${stylesheet.name} stylesheet ${action} ${Tny.colour('brightBlack', `(${designPath.output})`)}`)
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
 * @param {Array} fileMessages - File messages.
 * @param {Object} variables - Formatted variables.
 * @returns {Promise}
 */
function writeVariablesScripts({ fileMessages, variables }) {
  return new Promise(async(resolve, reject) => {
    try {
      await variableApi.buildScripts(variables)

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

      resolve()

    } catch (error) {
      reject({ error, message: 'Failed to write variables scripts' })
    }
  })
}

/**
 * Write variables stylesheets.
 * @param {Object} designPaths - Paths to write files to.
 * @param {Array} fileMessages - File messages.
 * @param {Object} variables - Formatted variables.
 * @returns {Promise}
 */
function writeUtilityStylesheets({ designPaths, fileMessages, variables }) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!config.utilities) {
        resolve()
        return
      }

      const queue = []

      for (const stylesheet of config.utilities) {
        const designPath = designPaths[stylesheet.handle]
        const action = fs.existsSync(designPath.write) ? 'updated' : 'created'

        queue.push(fs.writeFile(
          designPath.write,
          utilitiesApi.buildStyles(variables, stylesheet),
          'utf-8',
        ))

        fileMessages.push(`${stylesheet.name} stylesheet ${action} ${Tny.colour('brightBlack', `(${designPath.output})`)}`)
      }

      await Promise.all(queue)
      resolve()

    } catch (error) {
      reject({ error, message: 'Failed to write utilities stylesheets' })
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
 * - Adds decorations first.
 * @param {Array} fileMessages - File messages.
 * @param {Number} start - Start time of command.
 * @param {Array} storybookFileMessages - Storybook file messages.
 */
function outputMessaging({ fileMessages, start, storybookFileMessages }) {
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

  let messages = [
    Tny.colour('green', '📑 Variables files created'),
    Tny.colour('green', '🎨 Classes files created'),
  ]

  if (argv.storybook !== false) {
    messages.push(Tny.colour('green', '📚 Storybook files created'))
  }

  messages = [
    ...messages,
    Tny.time(start, end),
    '',
    Tny.colour('brightCyan', '📂 Canvas files'),
    ...formattedFileMessages,
  ]

  if (argv.storybook !== false) {
    messages.push('')
    messages.push(Tny.colour('brightCyan', '📂 Storybook files'))
    messages.push(...formattedStorybookFileMessages)
  }

  Tny.message(messages)
}

/**
 * Utilities
 * -----------------------------------------------------------------------------
 * Utility classes to above functions.
 *
 */

/**
 * Get design tools package version.
 * @returns {String}
 */
function getPackageVersion() {
  const packagePath = path.resolve('node_modules', '@we-make-websites/canvas-design-tools/package.json')

  if (!fs.existsSync(packagePath)) {
    return '{{canvas version}}'
  }

  const toolPackage = require(packagePath)
  return toolPackage.version
}

/**
 * Log banner to console.
 */
function logBanner() {
  Tny.message([
    Tny.colour('bgCyan', `Canvas design tools v${version}`),
    Tny.colour('bgCyan', 'Convert command'),
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
   * Build object for each utility stylesheet.
   */
  if (config.utilities) {
    for (const stylesheet of config.utilities) {
      designPaths[stylesheet.handle] = buildPathObject(stylesheet)
    }
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
