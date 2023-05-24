/**
 * API: Import
 * -----------------------------------------------------------------------------
 * Functions to import components into Canvas Vue instance.
 *
 */
/* eslint-disable no-await-in-loop, prefer-promise-reject-errors */
const fs = require('fs-extra')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')

const Paths = require('../helpers/paths')

/**
 * Import async and global components and stores.
 * @param {Object} imports - Components to import.
 * @returns {Promise}
 */
function importComponents(imports) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!imports.length) {
        await Tny.write(
          'importComponents - No components to import',
          Paths.libraryLog,
        )

        resolve()
      }

      if (
        !fs.existsSync(Paths.src.canvasImports) ||
        !fs.existsSync(Paths.src.themeStyles)
      ) {
        reject('Can\'t import files as necessary files are missing')
        return
      }

      /**
       * Split imports into types.
       */
      const types = {
        async: [],
        global: [],
        stores: [],
      }

      imports.forEach((importName) => {
        const parts = importName.split('/')
        types[parts[0]].push(parts[1])
      })

      const components = [
        ...formatImports(types.async, 'async'),
        ...formatImports(types.global, 'global'),
        ...formatImports(types.stores, 'stores'),
      ]

      let scripts = await fs.readFile(Paths.src.canvasImports, 'utf-8')
      let styles = await fs.readFile(Paths.src.themeStyles, 'utf-8')

      for (const component of components) {
        scripts = await importComponent(component, scripts)

        await Tny.write(
          `importComponents - Imported "${component.handle}" component script`,
          Paths.libraryLog,
        )

        if (component.folder === 'global') {
          styles = await importStylesheet(component, styles)

          await Tny.write(
            `importComponents - Imported "${component.handle}" component stylesheet`,
            Paths.libraryLog,
          )
        }
      }

      /**
       * Write file.
       */
      await fs.writeFile(Paths.src.canvasImports, scripts, 'utf-8')
      await Tny.write('importComponents - Updated Canvas imports', Paths.libraryLog)
      await fs.writeFile(Paths.src.themeStyles, styles, 'utf-8')
      await Tny.write('importComponents - Updated theme stylesheet', Paths.libraryLog)
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Formats the component import.
 * @param {Array} imports - Import array of certain type.
 * @param {String} folder - Folder of import.
 * @returns {Array}
 */
function formatImports(imports, folder) {
  return imports.map((handle) => {
    let pascalCase = handle
      .replace(
        /(?<firstLetter>\w)(?<rest>\w*)/g,
        (_, $1, $2) => {
          return $1.toUpperCase() + $2.toLowerCase()
        },
      )
      .replace(/-/g, '')
      .replace(/\s/g, '')

    if (folder === 'stores') {
      pascalCase = `${pascalCase}Store`
    }

    return {
      folder,
      handle,
      pascalCase,
    }
  })
}

/**
 * Add component to canvas-imports.js.
 * - If global then add to stylesheet too.
 * @param {Object} component - Component object.
 * @param {String} scripts - canvas-imports.js contents.
 * @returns {Promise}
 */
function importComponent(component, scripts) {
  return new Promise((resolve, reject) => {
    try {
      let localScripts = scripts

      const comments = {
        import: {
          end: `// canvas-${component.folder}-import-end`,
          start: `// canvas-${component.folder}-import-start`,
        },
        object: {
          end: `// canvas-${component.folder}-object-end`,
          start: `// canvas-${component.folder}-object-start`,
        },
      }

      if (
        !localScripts.includes(comments.object.start) ||
        !localScripts.includes(comments.object.end)
      ) {
        reject('Can\'t import files as object marker comments are missing')
        return
      }

      /**
       * Split object into an array and remove empty items.
       * - Add new component to objects.
       * - Sort alphabetically.
       */
      const objects = localScripts
        .split(comments.object.start)[1]
        .split(comments.object.end)[0]
        .split('\n')
        .filter((line) => {
          return line.match(/\w/)
        })

      const objectTemplate = component.folder === 'async'
        ? `    '${component.handle}': defineAsyncComponent({ loader: () => import(/* webpackChunkName: 'component.${component.handle}' */'~async/${component.handle}/${component.handle}') }),`
        : `    '${component.handle}': ${component.pascalCase},`

      /**
       * Early return if component has already been imported.
       */
      const matchedImport = objects.find((line) => {
        return line.includes(objectTemplate.trim())
      })

      if (matchedImport) {
        resolve(localScripts)
        return
      }

      objects.push(objectTemplate)
      objects.sort()

      /**
       * Replace objects in canvas-import.js with new content.
       */
      const objectsRegex = new RegExp(`${comments.object.start}(?<replace>.+)${comments.object.end}`, 'gs')
      let objectsTemplate = `${comments.object.start}\n`
      objectsTemplate += `${objects.join('\n')}\n`
      objectsTemplate += `    ${comments.object.end}`
      localScripts = localScripts.replace(objectsRegex, objectsTemplate)

      /**
       * Handle global and stores component import.
       */
      if (component.folder !== 'async') {
        if (
          !localScripts.includes(comments.import.start) ||
          !localScripts.includes(comments.import.end)
        ) {
          reject('Can\'t import files as import marker comments are missing')
          return
        }

        const imports = localScripts
          .split(comments.import.start)[1]
          .split(comments.import.end)[0]
          .split('\n')
          .filter((line) => {
            return line.match(/\w/)
          })

        const importTemplate = component.folder === 'global'
          ? `import ${component.pascalCase} from '~${component.folder}/${component.handle}/${component.handle}'`
          : `import ${component.pascalCase} from '~${component.folder}/${component.handle}'`

        imports.push(importTemplate)
        imports.sort()

        const importsRegex = new RegExp(`${comments.import.start}(?<replace>.+)${comments.import.end}`, 'gs')
        let importsTemplate = `${comments.import.start}\n`
        importsTemplate += `${imports.join('\n')}\n`
        importsTemplate += comments.import.end
        localScripts = localScripts.replace(importsRegex, importsTemplate)
      }

      resolve(localScripts)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Import global stylesheet into theme.scss.
 * @param {Object} component - Component answer object.
 * @param {String} styles - theme.scss contents.
 * @returns {Promise}
 */
function importStylesheet(component, styles) {
  return new Promise((resolve, reject) => {
    try {
      let localStyles = styles

      if (!fs.existsSync(path.resolve(Paths.src.components.global, component.handle, `${component.handle}.scss`))) {
        resolve(localStyles)
        return
      }

      const comments = {
        end: '// canvas-global-stylesheets-end',
        start: '// canvas-global-stylesheets-start',
      }

      if (
        !localStyles.includes(comments.start) ||
        !localStyles.includes(comments.end)
      ) {
        reject('Can\'t import files as stylesheet marker comments are missing')
        return
      }

      /**
       * Split stylesheets into an array and remove empty items.
       * - Add new component to stylesheets.
       * - Sort alphabetically.
       */
      const stylesheets = localStyles
        .split(comments.start)[1]
        .split(comments.end)[0]
        .split('\n')
        .filter((line) => {
          return line.match(/\w/)
        })

      stylesheets.push(`@import '~global/${component.handle}/${component.handle}';`)
      stylesheets.sort()

      /**
       * Replace stylesheets in theme.scss with new content.
       */
      const stylesheetsRegex = new RegExp(`${comments.start}(?<replace>.+)${comments.end}`, 'gs')
      let stylesheetsTemplate = `${comments.start}\n`
      stylesheetsTemplate += `${stylesheets.join('\n')}\n`
      stylesheetsTemplate += comments.end
      localStyles = localStyles.replace(stylesheetsRegex, stylesheetsTemplate)

      resolve(localStyles)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export API.
 */
module.exports = {
  importComponents,
}
