/**
 * Plugin: Storybook Shopify Plugin
 * -----------------------------------------------------------------------------
 * Convert Storybook build into a folder structure which Shopify supports.
 * - Changes that are made here instead of in the build command are made to
 *   change the source of truth in webpack.
 *
 */

/**
 * Set variables.
 */
const pluginName = 'StorybookShopifyPlugin'

/**
 * Tap into hooks and add functionality.
 */
module.exports = class StorybookShopifyPlugin {
  apply(compiler) {
    const { webpack } = compiler
    const { Compilation, sources } = webpack

    /**
     * `thisCompilation` is run every time.
     */
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.afterOptimizeChunkModules.tap(pluginName, (chunks) => {
        this.renameScripts(chunks)
      })

      compilation.hooks.processAssets.tapAsync(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
        },
        async(assets, callback) => {
          await this.processAssets(compilation, assets, sources, callback)
          callback()
        },
      )
    })
  }

  /**
   * Renames script files.
   * @param {Array} chunks - Emitted chunks (JS files).
   */
  renameScripts(chunks) {
    chunks.forEach((chunk) => {
      const id = chunk.debugId
      const name = chunk.name ? chunk.name.replace('~', '.') : 'bundle'
      chunk.filenameTemplate = `assets/${id}.${name}.js`
    })
  }

  /**
   * Process assets and move into Shopify folder structure.
   * @param {Object} compilation - Compilation instance.
   * @param {Object} assets - All outputted assets.
   * @param {Object} sources - Webpack sources.
   * @returns {Promise}
   */
  processAssets(compilation, assets, sources) {
    return new Promise(async(resolve) => {
      await this.moveAssets(compilation, assets, sources)
      resolve()
    })
  }

  /**
   * Moves asset files (JS, PNG) into assets folder.
   * @param {Object} compilation - Compilation instance.
   * @param {Object} assets - All outputted assets.
   * @param {Object} sources - Webpack sources.
   * @returns {Promise}
   */
  moveAssets(compilation, assets, sources) {
    const queue = Object.keys(assets).map((filepath) => {
      const matchedFile = filepath.match(/\.(?:png)$/g)

      if (!matchedFile) {
        return false
      }

      /**
       * Return promise to queue.
       */
      return this.moveAsset(compilation, filepath, sources)
    }).filter(Boolean)

    /**
     * Process queue.
     */
    return Promise.all(queue)
  }

  /**
   * Move PNGs to assets folder.
   * - Also updates references inside file.
   * @param {Object} compilation - Compilation instance.
   * @param {String} filepath - Path to output Liquid.
   * @param {Object} sources - Webpack sources.
   * @returns {Promise}
   */
  moveAsset(compilation, filepath, sources) {
    return new Promise((resolve) => {
      const file = compilation.getAsset(filepath)
      const newPath = `assets/${filepath.replace('static/media', '')}`

      /**
       * Duplicate file on new path.
       */
      compilation.emitAsset(
        newPath,
        new sources.RawSource(file.source.source()),
      )

      /**
       * Delete old path file.
       */
      compilation.deleteAsset(filepath)

      resolve()
    })
  }
}
