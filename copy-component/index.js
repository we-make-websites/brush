#!/usr/bin/env node
/**
 * Library: Copy component
 * -----------------------------------------------------------------------------
 * Copies component from node_modules to project and installs.
 *
 */
const fs = require('fs-extra')
const open = require('open')
const Tny = require('@we-make-websites/tannoy')

const importApi = require('./apis/import')
const installApi = require('./apis/install')

const Paths = require('./helpers/paths')

/**
 * Set variables.
 */
let libraryJson = {}
let name = ''
let packageJson = {}
let requiresManualInstall = false

/**
 * Initialises the copy component functionality.
 */
async function init() {
  if (process.env.BUDDY) {
    process.exit()
  }

  await Tny.write(
    [
      '---',
      'init - Starting copy component',
    ],
    Paths.libraryLog,
  )

  if (!fs.existsSync(Paths.canvasFolder)) {
    await Tny.write(
      'init - 🚩 ERROR - No canvas/ folder found',
      Paths.libraryLog,
    )

    process.exit()
  }

  await openJsonFiles()

  /**
   * Early return if same version of component is already installed.
   */
  if (libraryJson.installed[packageJson.name]) {
    if (libraryJson.installed[packageJson.name] === packageJson.version) {
      await Tny.write(
        'init - 🚩 Component version already installed',
        Paths.libraryLog,
      )

      process.exit()
    }

    await Tny.write(
      `init - Component v${libraryJson.installed[packageJson.name]} already installed, updating to v${packageJson.version}`,
      Paths.libraryLog,
    )
  }

  if (packageJson.config.copy !== false) {
    await updateFiles()
    await updateImports()
  }

  await updateJson()

  if (packageJson.config.manualInstall || packageJson.config.openReadme) {
    let folder = 'packages'

    if (packageJson.config.readmePath) {
      folder = packageJson.config.readmePath.replace(/\/$/g, '')
    }

    open(`https://github.com/we-make-websites/library-monorepo/blob/master/${folder}/${name}/README.md`)
  }

  await Tny.write('init - Install complete', Paths.libraryLog)

  if (!requiresManualInstall) {
    return
  }

  await Tny.write('init - 🚩 Manual install required', Paths.libraryLog)
}

/**
 * Open JSON files.
 */
async function openJsonFiles() {
  try {
    packageJson = await fs.readJSON(Paths.module.packageJson)
    name = packageJson.name.split('/')[1]

    await Tny.write(
      `init - Installing ${packageJson.config.emoji} ${packageJson.name}`,
      Paths.libraryLog,
    )

    libraryJson = await fs.readJSON(Paths.libraryJson)

  } catch (error) {
    handleCatchError('openJsonFiles', 'Failed to open json files', error)
  }
}

/**
 * Update files.
 */
async function updateFiles() {
  try {
    await installApi.removeFiles(packageJson.config.remove)
    requiresManualInstall = await installApi.copyFiles(name)

  } catch (error) {
    handleCatchError('updateFiles', 'Failed to copy or remove files', error)
  }
}

/**
 * Update imports.
 */
async function updateImports() {
  try {
    await importApi.importComponents(packageJson.config.import)

  } catch (error) {
    handleCatchError('updateImports', 'Failed to import components', error)
  }
}

/**
 * Update JSON files.
 */
async function updateJson() {
  try {
    await installApi.mergeLocales()
    await installApi.updateLibraryJson(libraryJson, packageJson)

  } catch (error) {
    handleCatchError('updateJson', 'Failed to update locales or library.json', error)
  }
}

/**
 * Utils.
 * -----------------------------------------------------------------------------
 * Utility functions.
 *
 */

/**
 * Handle catch error.
 * @param {String} catchFunction - Function the catch happened in.
 * @param {String} message - Error message.
 * @param {Object} error - Error.
 */
async function handleCatchError(catchFunction, message, error) {
  await Tny.write(
    [
      `${catchFunction} - 🚩 ERROR - ${message}`,
      error,
    ],
    Paths.libraryLog,
  )

  await open(Paths.libraryLog)
  process.exit()
}

/**
 * Export copy component command.
 */
init()
