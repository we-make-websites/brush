/**
 * API: Styleguide
 * -----------------------------------------------------------------------------
 * Functions to build styleguide from design tokens.
 *
 */
const fs = require('fs-extra')
const path = require('path')

const variableApi = require('../apis/variables')

const convertStringToHandle = require('../helpers/convert-string-to-handle')
const getDesignConfig = require('../helpers/get-design-config')
const Paths = require('../helpers/paths')

const config = getDesignConfig()
let templates = {}

/**
 * Build page and stylesheets.
 * @param {Object} classes - Converted classes object.
 * @param {Object} variables - Converted variables object.
 * @param {Array} templatesToLoad - Template names to load.
 */
function build(classes, variables, templatesToLoad) {
  return new Promise(async(resolve, reject) => {
    try {
      if (!config.styleguide) {
        resolve()
        return
      }

      templates = await loadTemplates(templatesToLoad)

      /**
       * Build variable styleguides.
       */
      await buildAnimation(variables)
      await buildBoxShadow(variables[config.styleguide.boxShadow])
      await buildColor(variables[config.styleguide.colours])
      await buildGrid(variables)
      await buildIcons(variables)
      await buildMisc(variables)
      await buildSpacing(variables)
      await buildTypography(classes[config.styleguide.typography])

      /**
       * Write files.
       */
      const queue = []

      for (const template of templatesToLoad) {
        const filepath = template === 'styles'
          ? path.join(Paths.storybook.assets, 'storybook-styleguide.scss')
          : path.join(Paths.storybook.stories, `styleguide-${template}.stories.mdx`)

        queue.push(fs.writeFile(filepath, templates[template], 'utf-8'))
      }

      await Promise.all(queue)
      resolve()

    } catch (error) {
      reject(error)
    }
  })

}

/**
 * Loads page and style templates and assigned to global variable.
 * @param {Array} templatesToLoad - Template names to load.
 * @returns {Promise}
 */
function loadTemplates(templatesToLoad) {
  return new Promise(async(resolve, reject) => {
    try {
      const localTemplates = {}

      for (const template of templatesToLoad) {
        const internalFilepath = path.join(Paths.templates.internal, `styleguide-${template}.ejs`)
        const projectFilepath = path.join(Paths.templates.project, `styleguide-${template}.ejs`)

        const templatePath = fs.existsSync(projectFilepath)
          ? projectFilepath
          : internalFilepath

        // eslint-disable-next-line no-await-in-loop
        let contents = await fs.readFile(templatePath, 'utf-8')

        contents = contents.replace(
          'WarningMessage',
          'Automatically generated by `design` command, do not edit',
        )

        localTemplates[template] = contents
      }

      resolve(localTemplates)

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Builds animation styleguides.
 * @param {Object} variables - Converted variables object.
 * @returns {Promise}
 */
function buildAnimation(variables) {
  return new Promise((resolve) => {

    /**
     * Update styles content.
     */
    const styleObjectArray = []
    const styleEachArray = []

    variables[config.styleguide.animation.easing].forEach((easing) => {
      const timingProperties = variables[config.styleguide.animation.timing]
      const objectValues = []

      timingProperties.forEach((timing) => {
        const variableName = `${easing.variable.replace('--', '')}-${timing.variable.replace('--', '')}`
        objectValues.push(`'${variableName}': var(${timing.variable}) var(${easing.variable})`)
      })

      styleObjectArray.push(`  $${easing.name}: (${objectValues.join(',')});`)

      let string = ''
      string += `    @each $class, $value in $${easing.name} {\n`
      string += '      &#{$parent}__label--#{$class}::before {\n'
      string += `        transition: $value;\n`
      string += '      }\n'
      string += '    }'

      styleEachArray.push(string)
    })

    templates.styles = templates.styles
      .replace('<%= animation-object %>', styleObjectArray.join('\n'))
      .replace('<%= animation-each %>', styleEachArray.join('\n\n'))

    /**
     * Update page content.
     * - Go through each easing item, combine with each timing item to create
     *   preview animation.
     */
    const groupArray = variables[config.styleguide.animation.easing].map((easing, easingIndex) => {
      const timingProperties = variables[config.styleguide.animation.timing]

      /**
       * Build grid property rows.
       */
      const propertiesArray = timingProperties.map((timing, timingIndex) => {
        const propertyClass = `sb-animation__label--${easing.variable.replace('--', '')}-${timing.variable.replace('--', '')}`

        const template = `
          <tr className="sb-property-table__row">
            <td className="sb-property-table__variable">
              <input id="animation-${easingIndex}-${timingIndex}" className="sb-animation__input" type="checkbox" />
              <label className="sb-animation__label ${propertyClass}" htmlFor="animation-${easingIndex}-${timingIndex}"></label>
            </td>

            <td className="sb-property-table__value">
              <span className="sb-animation__token sb-token">${timing.variable}</span>
              ${timing.value}${timing.unit}
            </td>

            <td className="sb-property-table__value">
              <span className="sb-animation__token sb-token">${easing.variable}</span>
              ${easing.value}${easing.unit}
            </td>
          </tr>
        `

        return template.replaceAll('  ', '').replaceAll('\n', '')
      })

      /**
       * Build group table template.
       */
      const template = `
        <tr className="sb-group-table__row">
          <td className="sb-group-table__title">
            <strong>${convertHandle(easing.name)} easing</strong>
          </td>

          <td className="sb-group-table__properties">
            <table class="sb-property-table">
              <tbody>
                ${propertiesArray.join('\n')}
              </tbody>
            </table>
          </td>
        </tr>
      `

      return template.replaceAll('  ', '').replaceAll('\n', '')
    })

    templates.animation = templates.animation.replace('<%= animation %>', groupArray.join('\n\n'))
    resolve()
  })
}

/**
 * Builds box shadow styleguide on color page.
 * @param {Array} boxShadows - Array of box-shadows.
 * @returns {Promise}
 */
function buildBoxShadow(boxShadows) {
  return new Promise((resolve, reject) => {
    try {
      if (!boxShadows?.length) {
        templates.styles = templates.styles.replace('<%= boxShadow %>', '')
        templates.color = templates.color.replace('<%= boxShadow %>', '')
        resolve()
      }

      /**
       * Update styles content.
       */
      const boxShadowsArray = []

      boxShadows.forEach((boxShadow) => {
        const formattedName = formatName(
          boxShadow.name,
          config.styleguide.boxShadow,
          boxShadow.group,
        )

        const value = `'${formattedName}': var(${boxShadow.variable})`
        boxShadowsArray.push(value)
      })

      templates.styles = templates.styles.replace('<%= boxShadow %>', boxShadowsArray.join(','))

      /**
       * Update page content.
       */
      const propertiesArray = boxShadows.map((boxShadow) => {
        const formattedName = formatName(
          boxShadow.name,
          config.styleguide.boxShadow,
          boxShadow.group,
        )

        const values = boxShadow.original.value
          ? `
            <td className="sb-property-table__value">
              ${boxShadow.value}
            </td>

            <td className="sb-property-table__value">
              ${boxShadow.original.value}
            </td>
          `
          : `
            <td className="sb-property-table__value">
              ${boxShadow.value}
            </td>
          `

        return `
          <tr className="sb-property-table__row">
            <td className="sb-box-shadow__swatch-cell">
              <div className="sb-box-shadow__swatch sb-box-shadow__swatch--${formattedName}"></div>
            </td>

            <td className="sb-property-table__variable sb-token">
              ${boxShadow.variable}
            </td>

            ${values}
          </tr>
        `
      })

      /**
       * Build group table template.
       */
      let template = `
        ## Box shadow

        <table className="sb-color sb-group-table">
          <tbody>
            <tr className="sb-group-table__row">
              <td className="sb-group-table__title">
                <strong>Box shadow</strong>
              </td>

              <td className="sb-group-table__properties">
                <table className="sb-property-table">
                  <tbody>
                    ${propertiesArray.join('\n')}
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      `

      template = template.replaceAll('  ', '').replaceAll('\n', '')
      templates.color = templates.color.replace('<%= boxShadow %>', template)
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Builds color styleguide.
 * @param {Array} colours - Array of colours.
 * @returns {Promise}
 */
function buildColor(colours) {
  return new Promise((resolve, reject) => {
    try {
      if (!colours) {
        resolve()
        return
      }

      /**
       * Update styles content.
       */
      const coloursArray = []
      const gradientsArray = []

      colours.forEach((colour) => {
        const formattedName = formatName(
          colour.name,
          config.styleguide.colours,
          colour.group,
        )

        const value = `'${formattedName}': var(${colour.variable})`

        if (colour.value.includes('gradient')) {
          gradientsArray.push(value)
          return
        }

        coloursArray.push(value)
      })

      templates.styles = templates.styles.replace('<%= colours %>', coloursArray.join(','))
      templates.styles = templates.styles.replace('<%= gradients %>', gradientsArray.join(','))

      /**
       * Update page content.
       */
      const pageArray = Object.entries(config.styleguide.colourGroups).map(([title, group]) => {

        /**
         * Find colours that match current group.
         */
        const filteredColours = colours.filter((colour) => {
          const formattedName = formatName(colour.name, config.styleguide.colours, colour.group)

          /**
           * If '*' group then find colours that aren't matched by others.
           */
          if (group === '*') {
            const belongsInOtherGroup = Object.values(config.styleguide.colourGroups)
              .some((subGroup) => {
                if (typeof subGroup === 'object') {
                  return subGroup.some((subGroupItem) => formattedName.startsWith(subGroupItem))
                }

                return formattedName.startsWith(subGroup)
              })

            return !belongsInOtherGroup
          }

          /**
           * If array.
           */
          if (typeof group === 'object') {
            return group.some((groupItem) => formattedName.startsWith(groupItem))
          }

          return formattedName.startsWith(group)
        })

        if (!filteredColours.length) {
          return false
        }

        const propertiesArray = filteredColours.map((colour) => {
          const formattedName = formatName(colour.name, config.styleguide.colours, colour.group)

          let values = colour.original.value
            ? `
              <td className="sb-property-table__value">
                ${colour.value}
              </td>

              <td className="sb-property-table__value">
                ${colour.original.value}
              </td>
            `
            : `
              <td className="sb-property-table__value">
                ${colour.value}
              </td>
            `

          if (colour.alias) {
            const name = formatName(colour.alias, config.styleguide.colours)

            const aliasVariable = variableApi.convertPropertyNameToVariable(
              { name, type: config.special.color },
            )

            const aliasObject = colours.find((colourObject) => {
              return aliasVariable === colourObject.variable
            })

            const abbr = aliasObject.original
              ? `${aliasObject.value} (${aliasObject.original.value})`
              : `${aliasObject.value}`

            values = `
              <td className="sb-property-table__value sb-property-table__value--half" colSpan="2">
                <abbr className="sb-color__value" title="${abbr}">${aliasVariable}</abbr>
              </td>
            `
          }

          return `
            <tr className="sb-property-table__row">
              <td className="sb-color__swatch-cell">
                <div className="sb-color__swatch-container">
                  <div className="sb-color__swatch-background"></div>
                  <div className="sb-color__swatch sb-color__swatch--${formattedName}"></div>
                </div>
              </td>

              <td className="sb-property-table__variable sb-token">
                ${colour.variable}
              </td>

              ${values}
            </tr>
          `
        })

        /**
         * Build group table template.
         */
        const template = `
          <tr className="sb-group-table__row">
            <td className="sb-group-table__title">
              <strong>${title}</strong>
            </td>

            <td className="sb-group-table__properties">
              <table className="sb-property-table">
                <tbody>
                  ${propertiesArray.join('\n')}
                </tbody>
              </table>
            </td>
          </tr>
        `

        return template.replaceAll('  ', '').replaceAll('\n', '')
      }).filter(Boolean)

      templates.color = templates.color.replace('<%= color %>', pageArray.join('\n\n'))
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Builds grid styleguide.
 * @param {Object} variables - Converted variables object.
 * @returns {Promise}
 */
function buildGrid(variables) {
  return new Promise((resolve, reject) => {
    try {
      const groupArray = Object.entries(config.styleguide.grid).map(([title, variable]) => {
        const properties = variables[variable]

        if (!properties) {
          resolve()
          return false
        }

        /**
         * Build property rows.
         */
        const propertiesArray = properties.map((property) => {
          let colSpan = 'colSpan="2"'
          let original = ''
          let valueClass = 'sb-property-table__value--half'

          if (property.original?.value) {
            colSpan = ''
            original = `<td className="sb-property-table__value">${property.original?.value ?? ''}${property.original?.unit || ''}</td>`
            valueClass = ''
          }

          const template = `
            <tr className="sb-property-table__row">
              <td className="sb-property-table__variable sb-token">
                ${property.variable}
              </td>

              <td className="sb-property-table__value ${valueClass}" ${colSpan}>
                ${property.value}${property.unit}
              </td>

              ${original}
            </tr>
          `

          return template.replaceAll('  ', '').replaceAll('\n', '')
        })

        /**
         * Build group table template.
         */
        const template = `
          <tr className="sb-group-table__row">
            <td className="sb-group-table__title">
              <strong>${title}</strong>
            </td>

            <td className="sb-group-table__properties">
              <table className="sb-property-table">
                <tbody>
                  ${propertiesArray.join('\n')}
                </tbody>
              </table>
            </td>
          </tr>
        `

        return template.replaceAll('  ', '').replaceAll('\n', '')
      }).filter(Boolean)

      templates.grid = templates.grid.replace('<%= grid %>', groupArray.join('\n\n'))
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Builds misc styleguide.
 * @param {Object} variables - Converted variables object.
 * @returns {Promise}
 */
function buildMisc(variables) {
  return new Promise((resolve, reject) => {
    try {
      const groupArray = Object.entries(config.styleguide.misc).map(([title, variable]) => {
        const properties = variables[variable]

        if (!properties) {
          resolve()
          return false
        }

        /**
         * Build property rows.
         */
        const propertiesArray = properties.map((property) => {
          let colSpan = 'colSpan="2"'
          let original = ''
          let valueClass = 'sb-property-table__value--half'

          if (property.original?.value) {
            colSpan = ''
            original = `<td className="sb-property-table__value">${property.original?.value ?? ''}${property.original?.unit || ''}</td>`
            valueClass = ''
          }

          const template = `
            <tr className="sb-property-table__row">
              <td className="sb-property-table__variable sb-token">
                ${property.variable}
              </td>

              <td className="sb-property-table__value ${valueClass}" ${colSpan}>
                ${property.value}${property.unit}
              </td>

              ${original}
            </tr>
          `

          return template.replaceAll('  ', '').replaceAll('\n', '')
        })

        /**
         * Build group table template.
         */
        const template = `
          <tr className="sb-group-table__row">
            <td className="sb-group-table__title">
              <strong>${title}</strong>
            </td>

            <td className="sb-group-table__properties">
              <table className="sb-property-table">
                <tbody>
                  ${propertiesArray.join('\n')}
                </tbody>
              </table>
            </td>
          </tr>
        `

        return template.replaceAll('  ', '').replaceAll('\n', '')
      }).filter(Boolean)

      templates.misc = templates.misc.replace('<%= misc %>', groupArray.join('\n\n'))
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Builds icons styleguides.
 * @param {Object} variables - Converted variables object.
 * @returns {Promise}
 */
function buildIcons(variables) {
  return new Promise(async(resolve) => {
    const icons = {}

    /**
     * Build object of icons.
     * - Copied from icons API in Basis.
     */
    for (const tier1Item of fs.readdirSync(Paths.icons)) {
      if (tier1Item.includes('.svg') || tier1Item.slice(0, 1) === '.') {
        continue
      }

      const tier1 = path.parse(tier1Item).name
      const tier1Path = path.join(Paths.icons, tier1)

      icons[tier1] = {}

      /**
       * Tier 2 icons/folders.
       */
      for (const tier2Item of fs.readdirSync(tier1Path)) {
        if (tier2Item.slice(0, 1) === '.') {
          continue
        }

        const tier2 = path.parse(tier2Item).name
        const tier2Path = path.join(tier1Path, tier2)

        if (tier2Item.includes('.svg')) {
          // eslint-disable-next-line no-await-in-loop
          const icon = await getIcon(tier2Path)

          const tier2StyleguidePath = `~${tier2Path.split(/src[\\/]/g)[1]}.svg`
            .replace(/[\\/]/g, '/')

          icons[tier1][tier2] = {
            icon,
            path: tier2StyleguidePath,
            type: 'icon',
          }

          continue
        }

        if (!icons[tier1][tier2]) {
          icons[tier1][tier2] = {}
        }

        /**
         * Tier 3 icons.
         */
        for (const tier3Item of fs.readdirSync(tier2Path)) {
          if (!tier3Item.includes('.svg')) {
            continue
          }

          const tier3 = path.parse(tier3Item).name
          const tier3Path = path.join(tier2Path, tier3)
          // eslint-disable-next-line no-await-in-loop
          const icon = await getIcon(tier3Path)

          const tier3StyleguidePath = `~${tier3Path.split(/src[\\/]/g)[1]}.svg`
            .replace(/[\\/]/g, '/')

          icons[tier1][tier2][tier3] = {
            icon,
            path: tier3StyleguidePath,
            type: 'icon',
          }
        }
      }
    }

    /**
     * Build object of icon sizes and update stylesheet.
     */
    const iconSizesObject = variables[config.styleguide.icon].map((property) => {
      return `'${property.variable.replace('--', '')}': var(${property.variable})`
    })

    templates.styles = templates.styles.replace('<%= icon-sizes %>', iconSizesObject.join(','))

    /**
     * Build template.
     */
    const iconSizes = variables[config.styleguide.icon]

    const iconsTemplateArray = Object.keys(icons).map((tier1) => {

      /**
       * Build icon property rows.
       */
      const propertiesArray = Object.keys(icons[tier1]).map((tier2) => {
        if (icons[tier1][tier2]?.type !== 'icon') {
          return Object.keys(icons[tier1][tier2]).map((tier3) => {
            return buildIconTemplate(icons[tier1][tier2][tier3], iconSizes)
          }).join('\n')
        }

        return buildIconTemplate(icons[tier1][tier2], iconSizes)
      })

      /**
       * Build group table template.
       */
      const template = `
        <tr className="sb-group-table__row">
          <td className="sb-group-table__title">
            <strong>${convertHandle(tier1)}</strong>
          </td>

          <td className="sb-group-table__properties">
            <table className="sb-property-table">
              <tbody>
                ${propertiesArray.join('\n')}
              </tbody>
            </table>
          </td>
        </tr>
      `

      return template
        .replaceAll('  ', '')
        .replaceAll('\n', '')
        .replace(
          /(?<comments>#{3,4}\s[^<]+)/gi,
          (_, $1) => {
            return `\n\n${$1}\n\n`
          },
        )
    })

    templates.icons = templates.icons.replace('<%= icons %>', iconsTemplateArray.join('\n\n'))
    resolve()
  })
}

/**
 * Build icon template.
 * @param {Object} icon - Icon object with path and icon SVG.
 * @param {Array} sizes - Icon sizes.
 * @returns {String}
 */
function buildIconTemplate(icon, sizes) {
  const iconsTemplate = sizes.map(({ variable }) => {
    const className = variable.replace('--', '')

    return `
      <abbr className="sb-icons__icon sb-icons__icon--${className}" title="${variable}">
        ${icon.icon}
      </abbr>
    `
  })

  return `
    <tr className="sb-property-table__row">
      <td className="sb-property-table__value">
        <div className="sb-icons__icons">
          ${iconsTemplate.join('\n')}
        </div>
      </td>

      <td className="sb-property-table__variable sb-token">
        ${icon.path}
      </td>
    </tr>
  `
}

/**
 * Builds spacing styleguides.
 * @param {Object} variables - Converted variables object.
 * @returns {Promise}
 */
function buildSpacing(variables) {
  return new Promise((resolve) => {

    /**
     * Update styles object content.
     * - SASS object variable for iteration
     */
    const styleObjectArray = Object.values(config.styleguide.spacing).map((variable) => {
      const object = variables[variable]

      const objectValues = object.map((property) => {
        return `'${property.variable.replace('--', '')}': var(${property.variable})`
      })

      return `  $${variable}: (${objectValues.join(',')});`
    })

    /**
     * Update styles each content.
     * - Iterate over each SASS variable.
     */
    const styleEachArray = Object.values(config.styleguide.spacing).map((variable) => {
      let string = ''
      string += `    @each $class, $value in $${variable} {\n`
      string += '      &#{&}--#{$class} {\n'
      string += '        height: $value;\n'
      string += '        width: $value;\n'
      string += '      }\n'
      string += '    }'

      return string
    })

    templates.styles = templates.styles
      .replace('<%= spacing-object %>', styleObjectArray.join('\n'))
      .replace('<%= spacing-each %>', styleEachArray.join('\n\n'))

    /**
     * Update page content.
     */
    const groupArray = Object.entries(config.styleguide.spacing).map(([title, variable]) => {
      const object = variables[variable]

      /**
       * Build inner template for each property.
       */
      const propertiesArray = object.map((property) => {
        return `
          <tr className="sb-property-table__row">
            <td className="sb-property-table__variable">
              <div className="sb-spacing__element sb-spacing__element--${property.variable.replace('--', '')}"></div>
            </td>

            <td className="sb-property-table__variable sb-token">
              ${property.variable}
            </td>

            <td className="sb-property-table__value">
              ${property.value}${property.unit}
            </td>

            <td className="sb-property-table__value">
              ${property.original?.value ?? ''}${property.original?.unit || ''}
            </td>
          </tr>
        `
      })

      const template = `
        <tr className="sb-group-table__row">
          <td className="sb-group-table__title"><strong>${title}</strong></td>

          <td className="sb-group-table__properties">
            <table className="sb-property-table">
              <tbody>
                ${propertiesArray.join('\n')}
              </tbody>
            </table>
          </td>
        </tr>
      `

      return template.replaceAll('  ', '').replaceAll('\n', '')
    })

    templates.spacing = templates.spacing.replace('<%= spacing %>', groupArray.join('\n\n'))
    resolve()
  })
}

/**
 * Builds typography styleguide.
 * @param {Array} typography - Array of typography.
 * @returns {Promise}
 */
function buildTypography(typography) {
  return new Promise((resolve) => {

    /**
     * Update styles content.
     */
    const styleArray = typography.map((type) => {
      if (config.styleguide.typographyExclude.includes(type.className)) {
        return false
      }

      return `    &.${type.className} { @include ${type.className}; }`
    }).filter(Boolean)

    templates.styles = templates.styles.replace('<%= typography %>', styleArray.join('\n'))

    /**
     * Update page content.
     */
    const pageArray = typography.map((type) => {
      if (config.styleguide.typographyExclude.includes(type.className)) {
        return false
      }

      const formattedName = convertHandle(type.className.replace(`text${config.delimiter}`, ''))

      /**
       * Build properties
       */
      const propertiesArray = type.properties.map((property) => {
        const formattedProperty = property.property
          .replaceAll('-', ' ')
          .replace(
            /\w\S*/g,
            (string) => {
              return string.charAt(0).toUpperCase() + string.substr(1).toLowerCase()
            },
          )

        const value = property.value
          .replace('var(', '')
          .replace(')', '')

        let variable = ''
        let className = ''

        if (property.variable.value !== property.value) {
          variable = `${property.variable.value}${property.variable.unit}`

          if (property.variable.original) {
            variable += ` (${property.variable.original.value}${property.variable.original.unit})`
          }

          variable = ` title="${variable}"`
          className = ' className="sb-token"'
        }

        const element = variable ? 'abbr' : 'span'

        const template = `
          <tr className="sb-property-table__row">
            <td className="sb-typography__field sb-property-table__value">
              ${formattedProperty}
            </td>

            <td>
              <${element}${className}${variable}>
                ${value}
              </${element}>
            </td>
          </tr>
        `

        return template.replaceAll('  ', '').replaceAll('\n', '')
      })

      /**
       * Build template.
       */
      const template = `
        <tr className="sb-group-table__row">
          <td className="sb-typography__title sb-group-table__title">
            <span className="sb-typography__class sb-token">
              .${type.className}
            </span>

            <span className="sb-typography__style ${type.className}">
              ${formattedName}
            </span>
          </td>

          <td className="sb-group-table__properties">
            <table className="sb-property-table">
              <tbody>
                ${propertiesArray.join('\n')}
              </tbody>
            </table>
          </td>
        </tr>
      `

      return `  ${template.replaceAll('  ', '').replaceAll('\n', '')}`
    }).filter(Boolean)

    templates.typography = templates.typography
      .replace('<%= typography %>', pageArray.join('\n\n'))

    /**
     * Resolve.
     */
    resolve()
  })
}

/**
 * Formats name to remove prefix.
 * @param {String} name - Original name.
 * @param {String} prefix - Prefix to remove.
 * @param {String|Boolean} group - Original token group.
 * @returns {String}
 */
function formatName(name, prefix, group = false) {
  let formattedName = name.replace(`${prefix}${config.delimiter}`, '')

  if (group) {
    formattedName = `${group}${config.delimiter}${formattedName}`
  }

  return convertStringToHandle(formattedName, config)
}

/**
 * Convert handle to Sentence case
 * @param {String} handle - Original handle.
 * @returns {String}
 */
function convertHandle(handle) {
  const formattedName = handle.replaceAll('-', ' ')
  return `${formattedName.slice(0, 1).toUpperCase()}${formattedName.slice(1)}`
}

/**
 * Get icon and format.
 * @param {String} iconPath - Path to file.
 * @returns {String}
 */
function getIcon(iconPath) {
  return new Promise(async(resolve) => {
    let icon = await fs.readFile(`${iconPath}.svg`, 'utf-8')

    icon = icon
      .replaceAll('<!-- svgo-optimised -->', '')
      .replaceAll('<!-- svgo-disable -->', '')
      .replaceAll('class="', 'className="')
      .replaceAll('fill-rule', 'fillRule')
      .replaceAll('clip-rule', 'clipRule')

    resolve(icon)
  })
}

/**
 * Export API.
 */
module.exports = {
  build,
}
