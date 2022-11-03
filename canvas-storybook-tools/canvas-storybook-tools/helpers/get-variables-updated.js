/**
 * Helper: Get variables updated
 * -----------------------------------------------------------------------------
 * Checks to see if Storybook variables have been updated by comparing
 * credentials with first config.yml environment.
 *
 */
const fs = require('fs-extra')
const yaml = require('js-yaml')

const Paths = require('../helpers/paths')

/**
 * Export.
 * @returns {Promise}
 */
module.exports = () => {
  return new Promise(async(resolve) => {
    if (process.env.BUDDY) {
      resolve(true)
      return
    }

    if (
      !fs.existsSync(Paths.config.variables) ||
      !fs.existsSync(Paths.config.yaml)
    ) {
      resolve(false)
      return
    }

    /**
     * Find first environment's store.
     */
    const yamlFile = await fs.readFile(Paths.config.yaml, 'utf-8')
    const yamlData = yaml.load(yamlFile)
    const firstEnvironment = Object.keys(yamlData)[0]
    const configStore = yamlData[firstEnvironment].store.replace('.myshopify.com', '')

    /**
     * Find credentials.storefront.store value in variables JS.
     */
    const jsFile = await fs.readFile(Paths.config.variables, 'utf-8')

    const variableStore = jsFile
      .match(/const store = '[a-z0-9-]+'/g)[0]
      .split(' = ')[1]
      .replaceAll('\'', '')
      .trim()

    /**
     * Resolve.
     */
    resolve(configStore === variableStore)
  })
}
