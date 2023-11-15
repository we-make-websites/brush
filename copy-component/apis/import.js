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
        !fs.existsSync(Paths.src.canvasConfig) ||
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
        web: [],
      }

      let updatedConfig = false
      let updatedStylesheet = false

      imports.forEach((importName) => {
        const parts = importName.split('/')
        types[parts[0]].push(parts[1])
      })

      const components = [
        ...formatImports(types.async, 'async'),
        ...formatImports(types.global, 'global'),
        ...formatImports(types.stores, 'stores'),
        ...formatImports(types.web, 'web'),
      ]

      let config = await fs.readFile(Paths.src.canvasConfig, 'utf-8')
      let scripts = await fs.readFile(Paths.src.canvasImports, 'utf-8')
      let styles = await fs.readFile(Paths.src.themeStyles, 'utf-8')

      /**
       * Go through components and import.
       */
      for (const component of components) {
        scripts = await importComponent(component, scripts)

        await Tny.write(
          `importComponents - Imported "${component.handle}" component script`,
          Paths.libraryLog,
        )

        if (component.type === 'web') {
          config = await addCustomElement(component, config)
          updatedConfig = true

          await Tny.write(
            `importComponents - Added "${component.handle}" to custom elements config`,
            Paths.libraryLog,
          )
        }

        if (component.type === 'global') {
          styles = await importStylesheet(component, styles)
          updatedStylesheet = true

          await Tny.write(
            `importComponents - Imported "${component.handle}" component stylesheet`,
            Paths.libraryLog,
          )
        }
      }

      /**
       * Write files.
       */
      await fs.writeFile(Paths.src.canvasImports, scripts, 'utf-8')
      await Tny.write('importComponents - Updated Canvas imports', Paths.libraryLog)

      if (updatedConfig) {
        await fs.writeFile(Paths.src.canvasConfig, config, 'utf-8')
        await Tny.write('importComponents - Updated canvas.config.js', Paths.libraryLog)
      }

      if (updatedStylesheet) {
        await fs.writeFile(Paths.src.themeStyles, styles, 'utf-8')
        await Tny.write('importComponents - Updated theme stylesheet', Paths.libraryLog)
      }

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Formats the component import.
 * @param {Array} imports - Import array of certain type.
 * @param {String} type - Type of import.
 * @returns {Array}
 */
function formatImports(imports, type) {
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

    if (type === 'stores') {
      pascalCase = `${pascalCase}Store`
    }

    return {
      handle,
      pascalCase,
      type,
    }
  })
}

/**
 * Add component to canvas-imports.js.
 * - If global then add to stylesheet too.
 * @param {Object} component - Component object.
 * @param {String} contents - canvas-imports.js contents.
 * @returns {Promise}
 */
function importComponent(component, contents) {
  return new Promise((resolve, reject) => {
    try {
      let localContent = contents

      const comments = {
        import: {
          end: `// canvas-${component.type}-import-end`,
          start: `// canvas-${component.type}-import-start`,
        },
        object: {
          end: `// canvas-${component.type}-object-end`,
          start: `// canvas-${component.type}-object-start`,
        },
      }

      /**
       * Split object into an array and remove empty items.
       * - Add new component to objects.
       * - Sort alphabetically.
       */
      if (component.type !== 'web') {
        if (
          !localContent.includes(comments.object.start) ||
          !localContent.includes(comments.object.end)
        ) {
          reject('Can\'t import files as object marker comments are missing')
          return
        }

        const objects = localContent
          .split(comments.object.start)[1]
          .split(comments.object.end)[0]
          .split('\n')
          .filter((line) => {
            return line.match(/\w/)
          })

        const objectTemplate = component.type === 'async'
          ? `    '${component.handle}': defineAsyncComponent({ loader: () => import(/* webpackChunkName: 'component.${component.handle}' */'~async/${component.handle}/${component.handle}') }),`
          : `    '${component.handle}': ${component.pascalCase},`

        /**
         * Early return if component has already been imported.
         */
        const matchedImport = objects.find((line) => {
          return line.includes(objectTemplate.trim())
        })

        if (matchedImport) {
          resolve(localContent)
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
        localContent = localContent.replace(objectsRegex, objectsTemplate)
      }

      /**
       * Handle global, stores, and web component import.
       */
      if (component.type !== 'async') {
        if (
          !localContent.includes(comments.import.start) ||
          !localContent.includes(comments.import.end)
        ) {
          reject('Can\'t import files as import marker comments are missing')
          return
        }

        const imports = localContent
          .split(comments.import.start)[1]
          .split(comments.import.end)[0]
          .split('\n')
          .filter((line) => {
            return line.match(/\w/)
          })

        let importTemplate = ''

        switch (component.type) {
          case 'stores':
            importTemplate = `import ${component.pascalCase} from '~${component.type}/${component.handle}'`
            break
          case 'web':
            importTemplate = `import(/* webpackChunkName: 'web.${component.handle}' */'~async/${component.handle}/${component.handle}')`
            break
          default:
            importTemplate = `import ${component.pascalCase} from '~${component.type}/${component.handle}/${component.handle}'`
        }

        imports.push(importTemplate)
        imports.sort()

        const importsRegex = new RegExp(`${comments.import.start}(?<replace>.+)${comments.import.end}`, 'gs')
        let importsTemplate = `${comments.import.start}\n`
        importsTemplate += `${imports.join('\n')}\n`
        importsTemplate += comments.import.end
        localContent = localContent.replace(importsRegex, importsTemplate)
      }

      resolve(localContent)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Add custom element handle to canvas.config.js.
 * @param {Object} component - Component answer object.
 * @param {String} contents - canvas.config.js contents.
 * @returns {Promise}
 */
function addCustomElement(component, contents) {
  return new Promise((resolve, reject) => {
    try {
      let localContent = contents

      const comments = {
        end: '// canvas-custom-elements-end',
        start: '// canvas-custom-elements-start',
      }

      if (
        !localContent.includes(comments.start) ||
        !localContent.includes(comments.end)
      ) {
        reject('Can\'t import files as custom element marker comments are missing')
        return
      }

      /**
       * Split custom elements into an array and remove empty items.
       * - Add new component to custom elements.
       * - Sort alphabetically.
       */
      const customElements = localContent
        .split(comments.start)[1]
        .split(comments.end)[0]
        .split(',\n')
        .filter((line) => line.match(/\w/))
        .map((line) => line.trim())

      customElements.push(`'${component.handle}'`)
      customElements.sort()

      /**
       * Replace custom elements in canvas.config.js with new content.
       */
      const customElementsRegex = new RegExp(`${comments.start}(?<replace>.+)${comments.end}`, 'gs')
      let customElementsTemplate = `${comments.start}\n`
      customElementsTemplate += `    ${customElements.join(',\n    ')},\n    `
      customElementsTemplate += comments.end
      localContent = localContent.replace(customElementsRegex, customElementsTemplate)

      resolve(localContent)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Import global stylesheet into theme.scss.
 * @param {Object} component - Component answer object.
 * @param {String} contents - theme.scss contents.
 * @returns {Promise}
 */
function importStylesheet(component, contents) {
  return new Promise((resolve, reject) => {
    try {
      let localContents = contents

      if (!fs.existsSync(path.resolve(Paths.src.components.global, component.handle, `${component.handle}.scss`))) {
        resolve(localContents)
        return
      }

      const comments = {
        end: '// canvas-global-stylesheets-end',
        start: '// canvas-global-stylesheets-start',
      }

      if (
        !localContents.includes(comments.start) ||
        !localContents.includes(comments.end)
      ) {
        reject('Can\'t import files as stylesheet marker comments are missing')
        return
      }

      /**
       * Split stylesheets into an array and remove empty items.
       * - Add new component to stylesheets.
       * - Sort alphabetically.
       */
      const stylesheets = localContents
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
      localContents = localContents.replace(stylesheetsRegex, stylesheetsTemplate)

      resolve(localContents)

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
