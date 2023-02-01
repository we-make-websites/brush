#!/usr/bin/env node
/**
 * Branch naming check
 * -----------------------------------------------------------------------------
 * Core functionality.
 *
 */
const fs = require('fs-extra')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')

const branchNameApi = require('../apis/current-branch-name')
const getCanvasConfig = require('../helpers/get-canvas-config')

/**
 * Initialises branch naming check.
 */
async function init() {
  const branchName = await branchNameApi.readCurrentBranchName()
  const version = getPackageVersion()
  const config = getCanvasConfig()

  /**
   * Set match conditions.
   */
  const defaultBranch = branchName.match(/^(?<default>main|master|staging|development)$/g)
  const camelCaseBranch = branchName.match(/^(?<prefix>bugfix|feature|hotfix|release)\/(?<key>[A-Z0-9]+)-(?<id>[0-9]+)-(?<name>[\w]+)$/g)
  const kebabCaseBranch = branchName.match(/^(?<prefix>bugfix|feature|hotfix|release)\/(?<key>[A-Z0-9]+)-(?<id>[0-9]+)-(?<name>[a-z0-9-]+)$/g)

  /**
   * Configure pass conditions.
   */
  let pass = defaultBranch || camelCaseBranch || kebabCaseBranch
  let errorMessage = '[name] supports camelCase or kebab-case'

  switch (config?.branchNaming) {
    case 'camel':
      errorMessage = '[name] must use camelCase'
      pass = defaultBranch || camelCaseBranch
      break
    case 'kebab':
      errorMessage = '[name] must use kebab-case'
      pass = defaultBranch || kebabCaseBranch
      break
    default:
      errorMessage = '[name] supports camelCase or kebab-case'
      pass = defaultBranch || camelCaseBranch || kebabCaseBranch
  }

  const bannerMessage = `Branch naming check v${version}`

  /**
   * Test branch name.
   */
  if (pass) {
    process.exitCode = 0

    Tny.message(
      `${Tny.colour('bgGreen', bannerMessage)} ${Tny.colour('green', `✅ ${branchName}`)}`,
      { before: true },
    )

    return
  }

  process.exitCode = 1

  Tny.message([
    `${Tny.colour('bgRed', bannerMessage)} ${Tny.colour('red', `❌ ${branchName}`)}`,
    `${Tny.colour('bgRed', bannerMessage)} Follow format [bugfix|feature|hotfix|release]/[key]-[id]-[name]`,
    `${Tny.colour('bgRed', bannerMessage)} ${errorMessage}`,
  ], { before: true })
}

/**
 * Utilities
 * -----------------------------------------------------------------------------
 * Utility classes to above functions.
 *
 */

/**
 * Get branch naming check package version.
 * @returns {String}
 */
function getPackageVersion() {
  const packagePath = path.resolve('node_modules', '@we-make-websites/branch-naming-check/package.json')

  if (!fs.existsSync(packagePath)) {
    return '{{canvas version}}'
  }

  const toolPackage = require(packagePath)
  return toolPackage.version
}

/**
 * Export check command.
 */
init()
