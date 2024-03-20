/**
 * API: Component
 * -----------------------------------------------------------------------------
 * Extra functions for component command.
 *
 */
const fs = require('fs-extra')
const path = require('path')

const Paths = require('../helpers/paths')

/**
 * Get component template.
 * @param {Object} component - Component answer object.
 * @param {String} filename - Complete name of template to find.
 * @returns {Promise}
 */
function getComponentTemplate(component, filename) {
  return new Promise(async(resolve, reject) => {
    try {
      const internalFilepath = path.join(Paths.templates.internal, `${filename}.ejs`)
      const projectFilepath = path.join(Paths.templates.project, `${filename}.ejs`)

      const templatePath = fs.existsSync(projectFilepath)
        ? projectFilepath
        : internalFilepath

      if (!fs.existsSync(templatePath)) {
        resolve('')
      }

      let template = await fs.readFile(templatePath, 'utf-8')

      /**
       * Replace shortcodes.
       */
      template = template
        .replaceAll('<%= description %>', component.formatted.description)
        .replaceAll('<%= folder %>', component.type)
        .replaceAll('<%= folderTitleCase %>', component.formatted.type)
        .replaceAll('<%= handle %>', component.handle)
        .replaceAll('<%= key %>', component.key)
        .replaceAll('<%= liquid %>', component.liquid)
        .replaceAll('<%= liquidTitleCase %>', component.formatted.liquid)
        .replaceAll('<%= load %>', component.load)
        .replaceAll('<%= name %>', component.name)
        .replaceAll('<%= nameLowerCase %>', component.formatted.lowerCase)
        .replaceAll('<%= namePascalCase %>', component.formatted.pascalCase)
        .replaceAll('<%= nameTitleCase %>', component.formatted.titleCase)
        .replaceAll('<%= storyDescription %>', component.description)
        .replaceAll('<%= type %>', component.type)
        .replaceAll('<%= typeTitleCase %>', component.formatted.type)

      resolve(template)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Write component template.
 * @returns {Promise}
 */
function writeTemplate(filepath, filename, template) {
  return new Promise(async(resolve, reject) => {
    try {
      await fs.writeFile(
        path.join(filepath, filename),
        template,
        'utf-8',
      )

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Add component to canvas-imports.js.
 * - If global then add to stylesheet too.
 * @param {Object} component - Component answer object.
 * @returns {Promise}
 */
function importComponent(component) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!fs.existsSync(Paths.scripts.imports)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Can\'t import files as canvas-imports.js is missing')
        return
      }

      let contents = await fs.readFile(Paths.scripts.imports, 'utf-8')

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

      if (component.type !== 'web') {
        if (
          !contents.includes(comments.object.start) ||
          !contents.includes(comments.object.end)
        ) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Can\'t import files as object marker comments are missing')
          return
        }

        /**
         * Split object into an array and remove empty items.
         * - Add new component to objects.
         * - Sort alphabetically.
         */
        const objects = contents
          .split(comments.object.start)[1]
          .split(comments.object.end)[0]
          .split('\n')
          .filter((line) => {
            return line.match(/\w/)
          })

        const objectTemplate = component.type === 'async'
          ? `    '${component.handle}': defineAsyncComponent({ loader: () => import(/* webpackChunkName: 'component.${component.handle}' */'~async/${component.handle}/${component.handle}') }),`
          : `    '${component.handle}': ${component.formatted.pascalCase},`

        objects.push(objectTemplate)
        objects.sort()

        /**
         * Replace objects in canvas-import.js with new content.
         */
        const objectsRegex = new RegExp(`${comments.object.start}(?<replace>.+)${comments.object.end}`, 'gs')
        let objectsTemplate = `${comments.object.start}\n`
        objectsTemplate += `${objects.join('\n')}\n`
        objectsTemplate += `    ${comments.object.end}`
        contents = contents.replace(objectsRegex, objectsTemplate)
      }

      /**
       * Handle global and web component import.
       */
      if (component.type !== 'async') {
        if (
          !contents.includes(comments.import.start) ||
          !contents.includes(comments.import.end)
        ) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('Can\'t import files as import marker comments are missing')
          return
        }

        const imports = contents
          .split(comments.import.start)[1]
          .split(comments.import.end)[0]
          .split('\n')
          .filter((line) => {
            return line.match(/\w/)
          })

        if (component.type === 'web') {
          imports.push(`import(/* webpackChunkName: 'web.${component.handle}' */'~web/${component.handle}/${component.handle}')`)
        } else {
          imports.push(`import ${component.formatted.pascalCase} from '~global/${component.handle}/${component.handle}'`)
        }

        imports.sort()

        const importsRegex = new RegExp(`${comments.import.start}(?<replace>.+)${comments.import.end}`, 'gs')
        let importsTemplate = `${comments.import.start}\n`
        importsTemplate += `${imports.join('\n')}\n`
        importsTemplate += comments.import.end
        contents = contents.replace(importsRegex, importsTemplate)

        if (component.type === 'web') {
          await addCustomElement(component)
        } else {
          await importStylesheet(component)
        }
      }

      /**
       * Write file.
       */
      await fs.writeFile(Paths.scripts.imports, contents, 'utf-8')
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Import global stylesheet into theme.scss.
 * @param {Object} component - Component answer object.
 * @returns {Promise}
 */
function importStylesheet(component) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!fs.existsSync(Paths.styles.theme)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Can\'t import files as theme.scss is missing')
        return
      }

      let contents = await fs.readFile(Paths.styles.theme, 'utf-8')

      const comments = {
        end: '// canvas-global-stylesheets-end',
        start: '// canvas-global-stylesheets-start',
      }

      if (
        !contents.includes(comments.start) ||
        !contents.includes(comments.end)
      ) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Can\'t import files as stylesheet marker comments are missing')
        return
      }

      /**
       * Split stylesheets into an array and remove empty items.
       * - Add new component to stylesheets.
       * - Sort alphabetically.
       */
      const stylesheets = contents
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
      contents = contents.replace(stylesheetsRegex, stylesheetsTemplate)

      /**
       * Write file.
       */
      await fs.writeFile(Paths.styles.theme, contents, 'utf-8')
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Add web component custom element to config.
 * @param {Object} component - Component answer object.
 * @returns {Promise}
 */
function addCustomElement(component) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!fs.existsSync(Paths.canvasConfig)) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Can\'t add custom element as canvas.config.js is missing')
        return
      }

      let contents = await fs.readFile(Paths.canvasConfig, 'utf-8')

      const comments = {
        end: '// canvas-custom-elements-end',
        start: '// canvas-custom-elements-start',
      }

      if (
        !contents.includes(comments.start) ||
        !contents.includes(comments.end)
      ) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Can\'t add custom elements as marker comments are missing')
        return
      }

      /**
       * Split custom elements into an array and remove empty items.
       * - Add new custom element to array.
       * - Sort alphabetically.
       */
      const customElements = contents
        .split(comments.start)[1]
        .split(comments.end)[0]
        .split('\n')
        .map((line) => line.trim().replaceAll(',', ''))
        .filter((line) => line.match(/\w/))

      customElements.push(`'${component.handle}'`)
      customElements.sort()

      /**
       * Replace custom elements in canvas.config.js with new content.
       */
      const customElementsRegex = new RegExp(`${comments.start}(?<replace>.+)${comments.end}`, 'gs')
      let configTemplate = `${comments.start}\n`

      customElements.forEach((customElement) => {
        configTemplate += `    ${customElement},\n`
      })

      configTemplate += `    ${comments.end}`
      contents = contents.replace(customElementsRegex, configTemplate)

      /**
       * Write file.
       */
      await fs.writeFile(Paths.canvasConfig, contents, 'utf-8')
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
  getComponentTemplate,
  importComponent,
  writeTemplate,
}
