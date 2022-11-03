#!/usr/bin/env node
/**
 * Branch naming check
 * -----------------------------------------------------------------------------
 * Core functionality.
 *
 */
const Tny = require('@we-make-websites/tannoy')

const { currentBranchName } = require('./helpers/get-current-branch-name')
const getCanvasConfig = require('./helpers/get-canvas-config')

/**
 * Get current branch name and then test.
 */
currentBranchName()
  .then((branchName) => {
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

    /**
     * Test branch name.
     */
    if (pass) {
      process.exitCode = 0

      Tny.message(
        `${Tny.colour('bgGreen', 'Branch naming check')} ${Tny.colour('green', `✅ ${branchName}`)}`,
        { before: true },
      )

      return
    }

    process.exitCode = 1

    Tny.message([
      `${Tny.colour('bgRed', 'Branch naming check')} ${Tny.colour('red', `❌ ${branchName}`)}`,
      `${Tny.colour('bgRed', 'Branch naming check')} Follow format [bugfix|feature|hotfix|release]/[key]-[id]-[name]`,
      `${Tny.colour('bgRed', 'Branch naming check')} ${errorMessage}`,
    ], { before: true })
  })
