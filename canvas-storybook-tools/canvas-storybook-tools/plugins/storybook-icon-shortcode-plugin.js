/**
 * Plugin: Storybook icon shortcode plugin
 * -----------------------------------------------------------------------------
 * Replaces 'data:~icon...' shortcodes in assets with base64 versions.
 * - Duplicates functionality of Basis Icon Shortcode Plugin but applies to JS.
 *
 */
const fs = require('fs-extra')
const path = require('path')
const svg64 = require('svg64')
const { Compilation, sources } = require('webpack')

const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const pluginName = 'StorybookIconShortcodePlugin'

/**
 * Tap into hooks and add functionality.
 */
module.exports = class StorybookIconShortcodePlugin {
  apply(compiler) {

    /**
     * Check if required folders exist.
     */
    if (!fs.existsSync(Paths.icons)) {
      return
    }

    /**
     * `thisCompilation` is run every time.
     */
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
        },
        async(assets, callback) => {
          await this.replaceIconShortcodes(compilation, assets)
          callback()
        },
      )
    })
  }

  /**
   * Goes through assets and replaces ~icons shortcode.
   * @param {Object} compilation - Compilation instance.
   * @param {Object} assets - All outputted assets.
   * @returns {Promise}
   */
  replaceIconShortcodes(compilation, assets) {
    return new Promise(async(resolve, reject) => {
      try {
        const queue = []

        const disallowed = [
          'node_modules',
          '.LICENSE.txt',
          'runtime~',
          '.runtime.',
        ]

        /**
         * Filter out non-JS or disallowed files from assets.
         */
        for (const filepath of Object.keys(assets)) {
          const disallowedPath = disallowed.some((part) => {
            return filepath.includes(part)
          })

          if (!filepath.includes('.js') || disallowedPath) {
            continue
          }

          queue.push(this.updateAsset(compilation, filepath))
        }

        /**
         * Process queue.
         */
        await Promise.all(queue)
        resolve()

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Update asset files.
   * - Replaces icon shortcodes.
   * @param {Object} compilation - Compilation instance.
   * @param {String} filepath - Path to output asset.
   */
  updateAsset(compilation, filepath) {
    return new Promise(async(resolve) => {
      const file = compilation.getAsset(filepath)
      let contents = file.source.source()?.toString()
      const shortcodes = contents.match(/(?<path>data:~icons.+?\.svg)/g)

      if (!shortcodes) {
        resolve()
        return
      }

      /**
       * Build matching array of base 64 icons.
       */
      const base64Queue = []

      for (const shortcode of shortcodes) {
        base64Queue.push(this.convertIconToBase64(shortcode))
      }

      const base64Icons = await Promise.all(base64Queue)

      /**
       * Update stylesheet.
       */
      shortcodes.forEach((shortcode, index) => {
        contents = contents.replace(shortcode, base64Icons[index])
      })

      /**
       * Get map to update sourceMap of updated file.
       */
      const { map } = file.source.sourceAndMap()

      /**
       * Update existing asset with updated code.
       */
      await compilation.updateAsset(
        filepath,
        new sources.SourceMapSource(contents, filepath, map),
      )

      resolve()
    })
  }

  /**
   * Converts icon at path to base64.
   * @param {String} shortcode - Found icon path shortcode.
   * @returns {String}
   */
  convertIconToBase64(shortcode) {
    return new Promise(async(resolve) => {
      const iconString = shortcode.replace('data:~icons/', '')

      const iconPath = path.join(Paths.icons, iconString)
      let icon = await fs.readFile(iconPath, 'utf-8')

      if (!icon) {
        resolve('data:Icon not found')
        return
      }

      icon = icon
        .replace('<!-- svgo-optimised -->', '')
        .replace('<!-- svgo-disable -->', '')
        .replaceAll('\n', '')

      const base64 = svg64.default(icon)
      resolve(base64)
    })
  }
}
