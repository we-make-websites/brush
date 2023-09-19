/**
 * Track
 * -----------------------------------------------------------------------------
 * API to provide tracking interfaces for logging commands and errors.
 *
 */
const fs = require('fs-extra')
const path = require('path')
const Sentry = require('@sentry/node')
const yaml = require('js-yaml')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv
const rootFolder = path.resolve(path.dirname('src'))
const canvasConfigYml = path.resolve(rootFolder, 'config.yml')

/**
 * Initialise Sentry.
 * @returns {Promise}
 */
function init() {
  return new Promise(async(resolve) => {
    if (argv.tracking === false || process.env.BUDDY || process.env.CI) {
      resolve()
      return
    }

    const details = await getDetails()

    const environment =
      ['hot', 'watch'].includes(details.command.name) ||
      (details.command.name === 'build' && (details.command.flags.includes('dev') || details.command.flags.includes('--dev')))
        ? 'development'
        : 'production'

    const release = details.version.canvas === details.version.basis
      ? details.version.basis
      : `cnvs-${details.version.canvas}-basis-${details.version.basis}`

    /**
     * Setup Sentry.
     */
    Sentry.init({
      dsn: 'https://97690ba06fc8ff4a7aa4a8a1c4d21914@o264468.ingest.sentry.io/4505826960605184',
      environment,
      initialScope: {
        tags: {
          command: details.command.name,
          flags: details.command.flags.join(',') || 'none',
          theme: process.env.ADAPTER === 'true' ? 'adapter' : 'canvas',
        },
      },
      release,
      serverName: details.store,
    })

    /**
     * Set additional data.
     */
    Sentry.setUser({ username: details.username })
    Sentry.configureScope((scope) => scope.setTransactionName(details.command.name))

    resolve()
  })
}

/**
 * Get core and event details.
 * @returns {Promise}
 */
function getDetails() {
  return new Promise(async(resolve) => {
    let coreDetails = {}

    if (process.env.TRACK_CORE_DETAILS) {
      coreDetails = JSON.parse(process.env.TRACK_CORE_DETAILS)
    } else {
      coreDetails = await getCoreDetails()
    }

    const commandDetails = getCommandDetails()

    resolve({
      ...commandDetails,
      ...coreDetails,
    })
  })
}

/**
 * Get core details.
 * @returns {Promise}
 */
function getCoreDetails() {
  return new Promise(async(resolve) => {
    const coreDetails = {
      store: 'unknown',
      username: process.env.HOME
        ? process.env.HOME.split(path.sep).reverse()[0]
        : process.env.USERNAME || process.env.LOGNAME,
      version: {
        basis: process.env.npm_package_devDependencies__we_make_websites_basis,
        canvas: process.env.npm_package_version,
      },
    }

    /**
     * Load store URL from config.yml (if it exists).
     */
    const ymlFile = path.resolve(canvasConfigYml)

    if (fs.existsSync(ymlFile)) {
      const fileContents = await fs.readFile(ymlFile, 'utf-8')
      const config = yaml.load(fileContents)
      const environment = config.production || Object.entries(config)[0]
      coreDetails.store = environment?.store?.replace('.myshopify.com', '')
    }

    /**
     * Store core details in environment variable to reduce process time.
     */
    process.env.TRACK_CORE_DETAILS = JSON.stringify(coreDetails)

    /**
     * Resolve details.
     */
    resolve(coreDetails)
  })
}

/**
 * Get command details.
 * @returns {Object}
 */
function getCommandDetails() {
  const commandDetails = {
    command: {
      name: process.env.npm_lifecycle_event,
    },
  }

  /**
   * Determine command flags.
   */
  const argumentFlags = JSON.parse(process.env.npm_config_argv)
  const flags = []
  let index = 0
  let lastFlagIndex = 0

  argumentFlags.original.forEach((item) => {
    if (item === process.env.npm_lifecycle_event) {
      return
    }

    if (item.includes('--')) {
      flags.push(item)
      lastFlagIndex = index
      index += 1
      return
    }

    flags[lastFlagIndex] += ` ${item}`
    index += 1
  })

  commandDetails.command.flags = flags.sort()

  return commandDetails
}

/**
 * Report error.
 * @param {String|Object} error - Captured error.
 * @param {String} [level] - Level of error, accepts 'fatal, 'error',
 * 'warning', 'log', 'info', and 'debug', defaults to error's type.
 */
function reportError(error, level) {
  if (argv.tracking === false || process.env.BUDDY || process.env.CI) {
    return
  }

  if (level) {
    Sentry.withScope((scope) => {
      scope.setLevel(level)
      Sentry.captureException(error)
    })

    return
  }

  Sentry.captureException(error)
}

/**
 * Report message.
 * @param {String} message - Message.
 */
function reportMessage(message) {
  if (argv.tracking === false || process.env.BUDDY || process.env.CI) {
    return
  }

  Sentry.captureMessage(message)
}

/**
 * Export API.
 */
module.exports = {
  init,
  reportError,
  reportMessage,
}
