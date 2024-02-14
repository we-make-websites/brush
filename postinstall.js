#!/usr/bin/env node
/**
 * Canvas / Command: Postinstall
 * -----------------------------------------------------------------------------
 * Runs after `yarn install` has completed.
 * - Install Husky and adds permissions.
 *
 */
/* eslint-disable no-empty-function */
const childProcess = require('child_process')
const Tny = require('@we-make-websites/tannoy')

/**
 * Initialises the postinstall functionality.
 */
async function init() {
  await installHusky()

  /**
   * Don't set permissions on non-Mac platforms.
   * - Complete list: https://nodejs.org/api/process.html#process_process_platform
   */
  if (process.platform !== 'darwin') {
    return
  }

  await updateMacOsPermissions()
}

/**
 * Run `husky` command.
 */
function installHusky() {
  return new Promise(async(resolve) => {
    childProcess.execSync('husky')
    await setImmediate(() => {})

    Tny.message(message('🐶 Husky installed'), { after: false })
    resolve()
  })
}

/**
 * Updates Husky hook permissions on macOS.
 */
function updateMacOsPermissions() {
  return new Promise(async(resolve) => {
    childProcess.execSync('chmod ug+x .husky/*')
    await setImmediate(() => {})

    Tny.message(message('🔑 macOS permissions set'))
    resolve()
  })
}

/**
 * Default message helper.
 * @param {String} string - Message string.
 * @returns {String}
 */
function message(string) {
  return `${Tny.colour('bgGreen', 'Postinstall')} ${string}`
}

/**
 * Run postinstall command.
 */
init()
