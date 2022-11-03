/**
 * API: Install
 * -----------------------------------------------------------------------------
 * Functions to install component into Canvas project.
 *
 */
/* eslint-disable no-await-in-loop, no-console, prefer-promise-reject-errors */
const childProcess = require('child_process')
const fs = require('fs-extra')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const importApi = require('../apis/import')

const deepAssign = require('../helpers/deep-assign')
const getFilesInFolder = require('../helpers/get-files-in-folder')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv

/**
 * Install component(s).
 * @param {Object} componentsToInstall - Object of components to install.
 * @returns {Promise}
 */
function installComponents(componentsToInstall) {
  return new Promise(async(resolve, reject) => {
    try {
      await fs.remove(Paths.temp.root)

      if (componentsToInstall.remove.length) {
        await removeFolders(componentsToInstall.remove)
      }

      for (const component of componentsToInstall.packages) {
        await installComponent(component)
      }

      await importApi.importComponents(componentsToInstall.import)
      await installNpmDependencies(componentsToInstall.dependencies)
      await updateLibraryJson(componentsToInstall.packages)

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Remove folder(s)/file(s) specified.
 * @param {Array} remove - Array of paths to remove in src folder.
 * @returns {Promise}
 */
function removeFolders(remove) {
  return new Promise(async(resolve, reject) => {
    try {
      for (const folder of remove) {
        const destination = path.resolve(Paths.src.root, folder)
        await fs.remove(destination)
      }

      resolve()

    } catch (error) {
      reject({ error, string: 'Failed to delete remove folder(s)/file(s)' })
    }
  })
}

/**
 * Install component.
 * @param {Object} component - Component package JSON.
 * @returns {Promise}
 */
function installComponent(component) {
  return new Promise(async(resolve, reject) => {
    try {
      await fs.ensureDir(Paths.temp.root)
      await copyComponentToTemp(component.name)
      await copySrcFiles(component.name)
      await mergeLocales(component.name)
      await cleanUpTempFolder(component.name)

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Copy component from Library to temp folder.
 * @param {String} componentName - Component name.
 * @returns {Promise}
 */
function copyComponentToTemp(componentName) {
  return new Promise(async(resolve, reject) => {
    try {
      const libraryPath = path.resolve(Paths.library, componentName)
      const tempPath = path.resolve(Paths.temp.root, componentName)

      await fs.ensureDir(tempPath)
      await fs.copy(libraryPath, tempPath)
      resolve()

    } catch (error) {
      reject({ error, string: 'Failed to copy component files' })
    }
  })
}

/**
 * Copies component files into project src.
 * - Only moves files in folders defined in srcFolders.
 * - If a file already exists then it skips it.
 * @param {String} componentName - Component name.
 * @returns {Promise}
 */
function copySrcFiles(componentName) {
  return new Promise(async(resolve, reject) => {
    try {
      const filepaths = getFilesInFolder(Paths.temp.root)

      /**
       * Filter out non-src folders and copy files to src folder.
       */
      for (const filepath of filepaths) {
        const srcFolderMatch = Paths.srcFolders.some((folder) => {
          const regex = new RegExp(`temp[\\\\/]${componentName}[\\\\/]${folder}`, 'g')
          return regex.test(filepath)
        })

        if (!srcFolderMatch) {
          continue
        }

        const file = filepath
          .split(/[\\/]temp[\\/]/g)[1]
          .replace(componentName, '')
          .slice(1)

        if (argv.stage1) {
          console.log('\nFilepath', filepath)
        }

        const destination = path.resolve(Paths.src.root, file)

        if (argv.stage1) {
          console.log('Destination', destination)
        }

        if (fs.existsSync(destination)) {
          continue
        }

        await fs.copy(filepath, destination, { overwrite: false })
        await fs.remove(filepath)
      }

      resolve()

    } catch (error) {
      reject({ error, string: 'Failed to move component src folders' })
    }
  })
}

/**
 * Merge locales.json into all JSON files in locales folder.
 * @param {String} componentName - Component name.
 * @returns {Promise}
 */
function mergeLocales(componentName) {
  return new Promise(async(resolve, reject) => {
    try {
      const tempLocalesPath = Paths.temp.locales.replace('COMPONENT', componentName)

      if (!fs.existsSync(tempLocalesPath)) {
        resolve()
        return
      }

      const json = await fs.readJson(tempLocalesPath)
      const localePaths = getFilesInFolder(Paths.src.locales)

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
      }

      await fs.remove(tempLocalesPath)

      resolve()

    } catch (error) {
      reject({ error, string: 'Failed to merge locales' })
    }
  })
}

/**
 * Cleans default files from temp.
 * @param {String} componentName - Component name.
 * @returns {Promise}
 */
function cleanUpTempFolder(componentName) {
  return new Promise(async(resolve, reject) => {
    try {
      const filesToDelete = [
        'CHANGELOG.md',
        'package.json',
        'preview.gif',
        'preview.jpg',
        'preview.png',
        'README.md',
      ]

      const componentTempFolder = path.join(Paths.temp.root, componentName)
      const componentOuterFiles = getFilesInFolder(componentTempFolder)

      /**
       * Remove default files and specified folders.
       * - Files defined in filesToDelete.
       * - Files containing library or preview.
       */
      for (const filepath of componentOuterFiles) {
        const file = filepath.split(/[\\/]/g).reverse()[0]

        if (!filesToDelete.includes(file) && !filepath.includes('library-')) {
          continue
        }

        if (argv.stage2) {
          console.log('Remove 1', filepath)
        }

        await fs.remove(filepath)
      }

      /**
       * Go through remaining folders and delete empty folders at the root.
       */
      const componentInner = getFilesInFolder(componentTempFolder, true)

      for (const filepath of componentInner) {
        if (filepath.includes('.')) {
          continue
        }

        const rootPath = filepath.split(/temp[\\/]+/g)[0]

        const rootFolder = filepath
          .split(/temp[\\/]+/g)[1]
          .replace(componentName, '')
          .split(/[\\/]+/g)[1]

        if (argv.stage2) {
          console.log('Remove 2', filepath)
        }

        await fs.remove(path.resolve(rootPath, 'temp', componentName, rootFolder))
      }

      /**
       * If component temp folder is empty then remove it.
       */
      const componentTempFiles = getFilesInFolder(componentTempFolder)

      if (![...componentTempFiles].length) {
        if (argv.stage2) {
          console.log('Remove component folder', componentName)
        }

        await fs.remove(componentTempFolder)
      }

      /**
       * If temp folder is empty then remove it.
       */
      const tempFiles = getFilesInFolder(Paths.temp.root)

      if (![...tempFiles].length) {
        if (argv.stage2) {
          console.log('Remove temp folder')
        }

        await fs.remove(Paths.temp.root)
      }

      resolve()

    } catch (error) {
      reject({ error, string: `Failed to clean up temp ${componentName} folder` })
    }
  })
}

/**
 * Update package JSON and install dependencies.
 * @param {Object} dependencies - Object of npm dependencies.
 * @returns {Promise}
 */
function installNpmDependencies(dependencies) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!Object.keys(dependencies).length || argv.clear === false) {
        resolve()
        return
      }

      const packageJson = await fs.readJson(Paths.packageJson)

      /**
       * Combine component and package JSON dependencies.
       */
      const mergedDependencies = deepAssign(
        packageJson.dependencies,
        dependencies,
      )

      /**
       * Sort into alphabetical order.
       */
      const orderedDependencies = {}

      Object.keys(mergedDependencies).sort().forEach((key) => {
        orderedDependencies[key] = mergedDependencies[key]
      })

      /**
       * Update package JSON.
       */
      await fs.writeJson(
        Paths.packageJson,
        {
          ...packageJson,
          dependencies: orderedDependencies,
        },
        { spaces: 2 },
      )

      /**
       * Run yarn install.
       */
      childProcess.execSync('yarn install')
      // eslint-disable-next-line no-empty-function
      await setImmediate(() => {})

      resolve()

    } catch (error) {
      reject({ error, string: 'Failed to install dependencies' })
    }
  })
}

/**
 * Updates library JSON with installed component(s) and its version.
 * @param {Array} components - Array of component package JSONs.
 * @returns {Promise}
 */
function updateLibraryJson(components) {
  return new Promise(async(resolve, reject) => {
    try {
      const libraryJson = await fs.readJSON(Paths.libraryJson)

      for (const component of components) {
        libraryJson.installed[component.name] = component.version
      }

      /**
       * Sort into alphabetical order.
       */
      const installed = {}

      Object.keys(libraryJson.installed).sort().forEach((key) => {
        installed[key] = libraryJson.installed[key]
      })

      /**
       * Update JSON file.
       */
      await fs.writeJSON(
        Paths.libraryJson,
        {
          ...libraryJson,
          installed,
        },
        { spaces: 2 },
      )

      resolve()

    } catch (error) {
      reject({ error, string: 'Failed to update Library JSON' })
    }
  })
}

/**
 * Export API.
 */
module.exports = {
  installComponent,
  installComponents,
}
