/**
 * API: Messages
 * -----------------------------------------------------------------------------
 * Functions to update the terminal.
 *
 */
const fs = require('fs-extra')
const open = require('open')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv

/**
 * Determine whether to clear messages from flags.
 */
let empty = true

if (argv.debug || argv.clear === false) {
  empty = false
}

/**
 * Outputs banner.
 */
function logBanner() {
  const messages = [Tny.colour('bgCyan', 'Canvas Library Tools v{{library version}}')]

  if (argv.components) {
    messages.push(Tny.colour('bgCyan', 'Install components'))

  } else {
    messages.push(Tny.colour('bgCyan', 'Load components'))
  }

  if (argv.debug) {
    messages.push(Tny.colour('bgCyan', 'Debug mode'))
  }

  Tny.message(messages, { empty })
}

/**
 * Outputs repository messages and start of component installation.
 * @param {Object} data - Log data.
 * @param {Boolean} delay - Delay displaying installation banner, required to
 * prevent Enquirer question overwriting previous messages.
 * @returns {Promise}
 */
function logRepository(data, delay = true) {
  return new Promise(async(resolve) => {
    logBanner()

    if (argv.components) {
      resolve()
      return
    }

    Tny.message([
      Tny.colour('green', '🚀 Components successfully loaded'),
      ...data.messages,
      Tny.time(data.start, data.end),
    ], { after: true })

    if (delay) {
      await new Promise((timeoutResolve) => {
        setTimeout(timeoutResolve, 250)
      })
    }

    Tny.message(Tny.colour('bgCyan', 'Component installation'))
    resolve()
  })
}

/**
 * Outputs repository messages and start of component installation.
 * @param {Object} repoData - Repository log data.
 * @param {Object} installData - Installation log data.
 * @param {Object} components - Installed components
 * @returns {Promise}
 */
async function logInstallation(repoData, installData, components) {
  await logRepository(repoData, false)

  const messages = []

  components.packages.forEach((component) => {
    const emoji = component.emoji
      ? component.emoji
      : '✅'

    messages.push(`${emoji} ${component.name}`)
  })

  Tny.message([
    Tny.colour('green', `🧩 ${components.count} component${components.count > 1 ? 's' : ''} successfully installed:`),
    ...messages,
    Tny.time(installData.start, installData.end),
  ])

  return new Promise((resolve) => {
    resolve()
  })
}

/**
 * Build component(s) installation messages.
 * @param {Object} componentsToInstall - Object of components to install.
 * @returns {Array}
 */
function buildComponentMessages(componentsToInstall) {
  const messages = []
  const warnings = []

  /**
   * Build messaging.
   */
  componentsToInstall.packages.forEach((component) => {
    const emoji = component.emoji
      ? component.emoji
      : '✅'

    messages.push('')
    messages.push(`${emoji} ${Tny.colour('magenta', component.name)} - ${component.version}`)
    messages.push(component.description)
    messages.push('')
    messages.push(component.author)
    messages.push(...component.contributors)
  })

  /**
   * Update arrays for presentation.
   */
  messages.shift()

  /**
   * Create warning messages.
   */
  if (componentsToInstall.alreadyInstalled.length) {
    warnings.push('')
    warnings.push(Tny.colour('yellow', `⚠️ The following component${componentsToInstall.alreadyInstalled.length > 1 ? 's have' : ' has'} already been installed and will be skipped:`))
    warnings.push(...componentsToInstall.alreadyInstalled)
  }

  if (componentsToInstall.libraryDependencies.length) {
    warnings.push('')
    warnings.push(Tny.colour('yellow', `⚠️ The following Library component${componentsToInstall.libraryDependencies.length > 1 ? 's' : ''} are being installed as they're required dependencies:`))
    warnings.push(...componentsToInstall.libraryDependencies)
  }

  if (Object.keys(componentsToInstall.dependencies).length) {
    warnings.push('')
    warnings.push(Tny.colour('yellow', `⚠️ The following ${Object.keys(componentsToInstall.dependencies).length > 1 ? 'dependencies' : 'dependency'} will be installed:`))
    warnings.push(...Object.keys(componentsToInstall.dependencies))
  }

  if (componentsToInstall.remove.length) {
    warnings.push('')
    warnings.push(Tny.colour('yellow', `⚠️ The following folder${componentsToInstall.remove.length > 1 ? 's' : ''}/file${componentsToInstall.remove.length > 1 ? 's' : ''} will be removed:`))
    warnings.push(...componentsToInstall.remove)
  }

  return [
    ...messages,
    ...warnings,
  ]
}

/**
 * Log post-install messages and open readmes.
 * @param {Object} componentsToInstall - Object of components to install.
 * @returns {Promise}
 */
function logPostInstallMessages(componentsToInstall) {
  return new Promise((resolve) => {
    const tempFolders = componentsToInstall.names.filter((componentName) => {
      return fs.existsSync(path.resolve(Paths.temp.root, componentName))
    })

    const combined = [
      ...tempFolders,
      ...componentsToInstall.manualInstall,
    ]

    const unique = []

    combined.forEach((componentName) => {
      if (unique.includes(componentName)) {
        return
      }

      unique.push(componentName)
    })

    if (!unique.length) {
      resolve()
      return
    }

    if (!argv.debug && argv.clear !== false) {
      setTimeout(() => {
        unique.forEach((componentName) => {
          open(`https://bitbucket.org/we-make-websites/canvas-library/src/master/${componentName}/README.md`)
        })
      }, 2000)
    }

    Tny.message([
      Tny.colour(
        'yellow',
        '🚩 The following components require additional manual installation:',
      ),
      ...unique,
      '',
      '📁 See their temp folder for any remaining files',
      `🔗 Opening README${unique.length > 1 ? 's' : 's'}`,
    ])

    resolve()
  })
}

/**
 * Export API.
 */
module.exports = {
  buildComponentMessages,
  logBanner,
  logInstallation,
  logPostInstallMessages,
  logRepository,
}
