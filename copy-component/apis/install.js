/**
 * API: Install
 * -----------------------------------------------------------------------------
 * Functions to install components.
 *
 */
/* eslint-disable no-await-in-loop */
const fs = require('fs-extra')
const path = require('path')
const fileSync = require('@we-make-websites/file-sync')
const Tny = require('@we-make-websites/tannoy')

const deepAssign = require('../helpers/deep-assign')
const Paths = require('../helpers/paths')

/**
 * Copies files from node_modules.
 * @param {String} name - Name of component.
 * @returns {Promise}
 */
function copyFiles(name) {
  return new Promise(async(resolve, reject) => {
    try {
      const filepaths = fileSync(Paths.module.src)
      let requiresManualInstall = false

      for (const filepath of filepaths) {
        const moduleSrcPath = filepath.replace(Paths.module.src, '')
        let destinationPath = path.join(Paths.src.root, moduleSrcPath)

        /**
         * If file already exists then copy to library/ temp folder instead.
         * - Leave it up to developer to manually install.
         */
        if (fs.existsSync(destinationPath)) {
          const componentLibraryFolderPath = path.join(Paths.library, name)
          destinationPath = path.join(componentLibraryFolderPath, moduleSrcPath)
          requiresManualInstall = true
          await fs.ensureDir(componentLibraryFolderPath)
        }

        await fs.copy(filepath, destinationPath, { overwrite: false })

        if (requiresManualInstall) {
          await Tny.write(
            `copyFiles - ⚠️ NOTE - "${moduleSrcPath}" already exists, copied to library/${name}/ folder`,
            Paths.libraryLog,
          )

          continue
        }

        await Tny.write(
          `copyFiles - Copied "${moduleSrcPath}"`,
          Paths.libraryLog,
        )
      }

      resolve(requiresManualInstall)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Merge locales.json into all JSON files in locales folder.
 * @returns {Promise}
 */
function mergeLocales() {
  return new Promise(async(resolve, reject) => {
    try {
      if (!fs.existsSync(Paths.module.localeJson)) {
        await Tny.write('mergeLocales - No locales.json to merge', Paths.libraryLog)
        resolve()
        return
      }

      const json = await fs.readJson(Paths.module.localeJson)
      const localePaths = fileSync(Paths.src.locales, ['json'])

      /**
       * Go through each Shopify locale file and merge in component locales and
       * update Shopify locale.
       * - Replace `/` with `\/` to match Shopify requirements.
       */
      for (const localePath of localePaths) {
        const shopifyLocale = await fs.readJson(localePath)

        let mergedLocale = deepAssign(shopifyLocale, json)
        mergedLocale = JSON.stringify(mergedLocale, null, 2)
        mergedLocale = mergedLocale.replace(/(?<!\\)(?:\/)/g, '\\/')

        await fs.writeFile(localePath, mergedLocale)
        await Tny.write(`mergeLocales - Updated "${localePath}"`, Paths.libraryLog)
      }

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Remove folder(s)/file(s) specified.
 * @param {Array} remove - Array of paths to remove in src/ folder.
 * @returns {Promise}
 */
function removeFiles(remove) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!remove.length) {
        await Tny.write('removeFiles - No files to remove', Paths.libraryLog)
        resolve()
      }

      for (const folder of remove) {
        const destination = path.resolve(Paths.src.root, folder)
        await fs.remove(destination)
        await Tny.write(`removeFiles - Removed "${destination}"`, Paths.libraryLog)
      }

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Update Library JSON with installed component.
 * @param {Object} libraryJson - Library JSON.
 * @param {Object} packageJson - Package JSON.
 * @returns {Promise}
 */
function updateLibraryJson(libraryJson, packageJson) {
  return new Promise(async(resolve, reject) => {
    try {
      const newLibraryJson = libraryJson
      newLibraryJson.installed[packageJson.name] = packageJson.version

      /**
       * Sort into alphabetical order.
       */
      const installed = {}

      Object.keys(newLibraryJson.installed).sort().forEach((key) => {
        installed[key] = newLibraryJson.installed[key]
      })

      /**
       * Update JSON file.
       */
      await fs.writeJSON(
        Paths.libraryJson,
        {
          ...newLibraryJson,
          installed,
        },
        { spaces: 2 },
      )

      await Tny.write(
        `updateLibraryJson - Updated "${Paths.libraryJson}"`,
        Paths.libraryLog,
      )

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export API.
 */
module.exports = {
  copyFiles,
  mergeLocales,
  removeFiles,
  updateLibraryJson,
}
