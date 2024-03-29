#!/usr/bin/env node
/**
 * Storybook: Watch
 * -----------------------------------------------------------------------------
 * Runs `start-storybook` for local development.
 *
 * Reference:
 * https://stackoverflow.com/a/43477289
 *
 */
const Tny = require('@we-make-websites/tannoy')
const Track = require('@we-make-websites/track')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const getPackageVersion = require('../helpers/get-package-version')
const getVariablesUpdated = require('../helpers/get-variables-updated')

/**
 * Execute commands in node.
 */
const spawn = require('child_process').spawn

/**
 * Set flags.
 */
const argv = yargs(hideBin(process.argv)).argv
const port = argv.port ? argv.port : 6006
let version = '{{canvas version}}'

/**
 * Initialises the storybook watch functionality.
 */
async function init() {
  await Track.init()
  Track.reportMessage('Storybook watch')

  version = getPackageVersion()
  const variablesUpdated = await getVariablesUpdated()
  logBanner()

  if (!variablesUpdated) {
    Tny.message([
      Tny.colour('red', '❌ Storybook variables have not been updated or don\'t exist'),
      '📂 Update .storybook/assets/storybook-variables.js',
      Tny.colour('brightBlack', '❔ credentials.storefront.store does not match the first environment in config.yml'),
    ])

    return
  }

  /**
   * Windows spawn commands don't use alias like in Terminal.
   * https://stackoverflow.com/a/17537559
   */
  const command = process.platform === 'win32'
    ? 'start-storybook.cmd'
    : 'start-storybook'

  /**
   * Watch storybook.
   */
  spawn(command, ['--quiet', `-p ${port}`], { stdio: 'inherit' })
}

/**
 * Outputs storybook banner.
 */
function logBanner() {
  Tny.message([
    Tny.colour('bgCyan', `Canvas storybook tools v${version}`),
    Tny.colour('bgCyan', 'Watch command'),
    Tny.colour('bgCyan', `Running start-storybook --quiet --port ${port}`),
  ], { empty: true })
}

/**
 * Export storybook watch command.
 */
init()
