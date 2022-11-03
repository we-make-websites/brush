/**
 * API: Import
 * -----------------------------------------------------------------------------
 * Functions to import components into Canvas Vue instance.
 *
 */
/* eslint-disable no-await-in-loop, prefer-promise-reject-errors */
const fs = require('fs-extra')
const path = require('path')

const Paths = require('../helpers/paths')

/**
 * Import async and global components.
 * @param {Object} imports - Components to import.
 * @returns {Promise}
 */
function importComponents(imports) {
  return new Promise(async(resolve, reject) => {
    try {
      if (
        !imports.async.length &&
        !imports.global.length &&
        !imports.stores.length
      ) {
        resolve()
        return
      }

      if (
        !fs.existsSync(Paths.src.scripts.core.import) ||
        !fs.existsSync(Paths.src.styles.layout.theme)
      ) {
        reject('Can\'t import files as necessary files are missing')
        return
      }

      const components = [
        ...formatImports(imports.async, 'async'),
        ...formatImports(imports.global, 'global'),
        ...formatImports(imports.stores, 'stores'),
      ]

      let scripts = await fs.readFile(Paths.src.scripts.core.import, 'utf-8')
      let styles = await fs.readFile(Paths.src.styles.layout.theme, 'utf-8')

      for (const component of components) {
        scripts = await importComponent(component, scripts)

        if (component.folder === 'global') {
          styles = await importStylesheet(component, styles)
        }
      }

      /**
       * Write file.
       */
      await fs.writeFile(Paths.src.scripts.core.import, scripts, 'utf-8')
      await fs.writeFile(Paths.src.styles.layout.theme, styles, 'utf-8')
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
