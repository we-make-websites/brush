#!/usr/bin/env node
/**
 * Basis Schema Docs: Create
 * -----------------------------------------------------------------------------
 * Creates schema documentation files.
 *
 */
const { prompt } = require('enquirer')
const fs = require('fs-extra')
const { NodeHtmlMarkdown } = require('node-html-markdown')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const getSchemas = require('../helpers/get-schemas')
const getTemplates = require('../helpers/get-templates')
const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv
const format = argv.html ? 'html' : 'md'
let templates = {}

const templatePath = fs.existsSync(Paths.templates.project)
  ? Paths.templates.project
  : Paths.templates.internal

/**
 * Initialises the docs create functionality.
 * @returns {Promise}
 */
function init() {
  return new Promise(async(resolve, reject) => {
    try {
      Tny.message([
        Tny.colour('bgCyan', 'Basis Schema Docs v{{docs version}}'),
        Tny.colour('bgCyan', 'Create documentation'),
      ], { empty: true })

      /**
       * Create folder.
       */
      await fs.emptyDir(Paths.documentation)

      /**
       * Ask template question.
       */
      const template = argv.template ? argv.template : await styleQuestion()

      /**
       * Create documentation.
       */
      const start = performance.now()
      const schemas = await getSchemas()
      templates = await getTemplates(templatePath, template)
      await createFiles(schemas, templates)
      const end = performance.now()

      Tny.message([
        Tny.colour('green', '📑 Documentation created'),
        Tny.time(start, end),
      ])

      resolve()

    } catch (error) {
      Tny.message(Tny.colour('red', '❌ Error creating documention'))
      reject(error)
    }
  })
}

/**
 * Ask style question based on template folders.
 * @returns {Promise}
 */
function styleQuestion() {
  return new Promise(async(resolve, reject) => {
    try {
      const choices = fs.readdirSync(templatePath)
      const index = choices.findIndex((choice) => choice === 'headings')

      const question = await prompt({
        choices,
        hint: '(Style of documentation to create)',
        index,
        message: 'Style',
        name: 'answer',
        pointer: () => '',
        prefix: () => '🎨',
        result(answer) {
          return answer.toLowerCase().trim()
        },
        type: 'select',
      })

      resolve(question.answer || 'headings')

    } catch (error) {
      Tny.message(Tny.colour('red', '⛔ Process exited'))
      reject(error)
      process.exit()
    }
  })
}

/**
 * Uses templates to create files and write them.
 * @param {Array} schemas - Array of all schema paths.
 * @returns {Promise}
 */
function createFiles(schemas) {
  return new Promise(async(resolve, reject) => {
    try {
      const queue = []

      for (const schemaPath of schemas) {
        const handle = schemaPath
          .split(/[\\/]{1,2}/g)
          .reverse()[0]
          .replace(/(?:\.schema)?\.js/g, '')

        const filepath = path.join(Paths.documentation, `${handle}.${format}`)
        const schema = require(schemaPath)

        if (!schema.blocks?.length && !schema.settings?.length) {
          continue
        }

        const fileContents = buildDocumentationTemplate(schema)
        queue.push(writeFile(fileContents, filepath))
      }

      await Promise.all(queue)
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Build markup for documentation template.
 * @param {Object} schema - Section schema object.
 * @returns {String}
 */
function buildDocumentationTemplate(schema) {
  let section = ''
  let blocks = ''

  if (schema.settings?.length) {
    section = buildSectionTemplate(schema)
  }

  if (schema.blocks?.length) {
    blocks = buildBlocksTemplate(schema)
  }

  let template = tagReplace(templates.base, 'section', section)
  template = tagReplace(template, 'blocks', blocks)
  template = tagReplace(template, 'name', schema.name)

  return template
}

/**
 * Build markup for section template.
 * @param {Object} schema - Section schema object.
 * @returns {String}
 */
function buildSectionTemplate(schema) {
  let template = tagReplace(templates.section, 'name', schema.name)

  /**
   * Replace shortcodes.
   */
  if (schema.limit) {
    template = tagReplace(template, 'limit', schema.limit)
  }

  template = tagReplace(
    template,
    'settingOrGroup',
    buildSettingOrGroupTemplate(schema.settings),
  )

  /**
   * Remove unused shortcodes.
   */
  template = template
    .replaceAll(templateTag('name'), '')
    .replaceAll(templateTagString('limit'), '')

  return template
}

/**
 * Build markup for setting or group template.
 * @param {Array} settings - Settings array.
 * @returns {String}
 */
function buildSettingOrGroupTemplate(settings) {
  const hasHeaders = settings.find((setting) => setting.content)

  if (hasHeaders) {
    const groups = buildGroups(settings)
    return buildGroupsTemplate(groups)
  }

  return buildSettingsTemplate(settings)
}

/**
 * Build groups as dictated by headings.
 * @param {Array} settings - Settings array.
 * @returns {String}
 */
function buildGroups(settings) {
  let groups = {}
  let activeGroup = ''
  let groupIndex = 1

  const firstGroup = {
    content: '',
    settings: [],
    type: 'first',
  }

  settings.forEach((setting) => {
    if (setting.content) {
      activeGroup = `group-${groupIndex}`
      groupIndex++

      groups[activeGroup] = {
        content: setting.content,
        info: setting.info,
        settings: [],
        type: setting.type,
      }

      return
    }

    if (!activeGroup) {
      firstGroup.settings.push(setting)
      return
    }

    groups[activeGroup].settings.push(setting)
  })

  /**
   * If first group (settings with no preceding header) then add to groups.
   */
  if (firstGroup.settings.length) {
    groups = {
      'group-0': firstGroup,
      ...groups,
    }
  }

  return groups
}

/**
 * Build markup for groups template.
 * @param {Array} groups - Groups of settings based on headers.
 * @param {String} type - Type of template, `section`, or `block`.
 */
function buildGroupsTemplate(groups, type = 'section') {
  const groupsTemplate = Object.values(groups).map((group) => {

    /**
     * If no content then use default settings template.
     */
    if (!group.content) {
      return buildSettingsTemplate(group.settings)
    }

    /**
     * Build group settings template.
     */
    let template = templates.group

    if (group.type === 'header') {
      template = tagReplace(template, 'header', group.content)
    } else {
      template = tagReplace(template, 'paragraph', group.content)
    }

    if (group.info) {
      template = tagReplace(template, 'info', group.info)
    }

    if (group.settings?.length) {
      const settingsTemplate = group.settings.map((setting) => {
        return buildSettingTemplate(setting)
      }).join('')

      template = tagReplace(template, 'setting', settingsTemplate)
    } else {
      template = tagReplace(template, 'setting', '')
    }

    /**
     * Increase heading when rendering a block template to account for block
     * title element.
     */
    if (type === 'block') {
      template = template.replaceAll(
        /(?<tag><(?:\/)?h(?<level>\d)>)/g,
        (_, $1, $2) => {
          return $1.replace($2, Number($2) + 1)
        },
      )
    }

    /**
     * Remove unused shortcodes.
     */
    template = template
      .replaceAll(templateTagLine('header'), '')
      .replaceAll(templateTagLine('paragraph'), '')
      .replaceAll(templateTagString('info'), '')

    return template
  })

  return groupsTemplate.join('')
}

/**
 * Build markup from settings template.
 * @param {Array} settings - Settings array.
 * @returns {String}
 */
function buildSettingsTemplate(settings) {
  return settings.map((setting) => {
    return buildSettingTemplate(setting)
  }).join('')
}

/**
 * Build markup for setting template.
 * @param {Object} setting - Schema setting.
 * @returns {String}
 */
function buildSettingTemplate(setting) {
  const keys = [
    'type',
    'id',
    'label',
    'info',
    'accept',
    'limit',
    'min',
    'max',
    'step',
    'unit',
    'options',
    'placeholder',
    'default',
  ]

  /**
   * Replace template shortcodes.
   */
  let template = tagReplace(templates.setting, 'label', setting.label)

  keys.forEach((key) => {
    if (!setting[key]) {
      const regex = new RegExp(`.+?<%= ${key} %>.+\n`, 'g')
      template = template.replaceAll(regex, '')
      return
    }

    if (key === 'options' && setting.options?.length) {
      template = tagReplace(template, key, buildOptionsTemplate(setting.options))
    }

    template = tagReplace(template, key, setting[key])
  })

  return template
}

/**
 * Build markup for options template.
 * @param {Array} options - Options settings.
 * @returns {String}
 */
function buildOptionsTemplate(options) {
  const repeatTemplate = templates.options
    .match(/<%= repeat %>.+/g)[0]
    .replaceAll(templateTag('repeat'), '')

  let optionsTemplate = ''

  const keys = [
    'label',
    'group',
    'value',
  ]

  /**
   * Replace template shortcodes.
   */
  options.forEach((option) => {
    keys.forEach((key) => {
      if (!repeatTemplate.includes(templateTag(key))) {
        return
      }

      optionsTemplate += tagReplace(repeatTemplate, key, option[key])
    })
  })

  const template = templates.options.replaceAll(
    /<%= repeat %>.+/g,
    optionsTemplate,
  )

  return template
}

/**
 * Build markup for blocks template.
 * @param {Object} schema - Section schema object.
 * @returns {String}
 */
function buildBlocksTemplate(schema) {
  let template = templates.blocks

  /**
   * Replace shortcodes.
   */
  if (schema.max_blocks) {
    template = tagReplace(templates.blocks, 'maxBlocks', schema.max_blocks)
  }

  const blocksTemplate = schema.blocks.map((block) => {
    return buildBlockTemplate(block)
  }).join('')

  template = tagReplace(template, 'block', blocksTemplate)

  /**
   * Remove unused shortcodes.
   */
  template = template.replaceAll(templateTagString('maxBlocks'), '')

  return template
}

/**
 * Build markup from block template.
 * @param {Object} block - Block object.
 */
function buildBlockTemplate(block) {
  let template = tagReplace(templates.block, 'name', block.name)

  if (block.limit) {
    template = tagReplace(template, 'limit', block.limit)
  }

  if (block.settings?.length) {
    let settingOrGroupTemplate = ''
    const hasHeaders = block.settings.find((setting) => setting.content)

    if (hasHeaders) {
      const groups = buildGroups(block.settings)
      settingOrGroupTemplate = buildGroupsTemplate(groups, 'block')
    } else {
      settingOrGroupTemplate = buildSettingsTemplate(block.settings)
    }

    template = tagReplace(template, 'settingOrGroup', settingOrGroupTemplate)
  }

  /**
   * Remove unused shortcodes.
   */
  template = template
    .replaceAll(templateTagLine('settingOrGroup'), '')
    .replaceAll(templateTagString('limit'), '')

  return template
}

/**
 * Creates a file for each schema.
 * @param {String} content - HTML content to be parsed.
 * @param {String} filepath - Filepath to be created.
 */
function writeFile(content, filepath) {
  return new Promise(async(resolve, reject) => {
    try {
      let markdown = content

      if (format === 'md') {
        markdown = NodeHtmlMarkdown.translate(content)

        /**
         * Fix markdown conversion messing up nesting of options list.
         * - Also removes escape characters as Notion no longer needs them.
         */
        markdown = markdown
          .replaceAll('         *', '        *')
          .replaceAll('              *', '          *')
          .replaceAll('\\-', '-')
          .replaceAll('\\[', '[')
          .replaceAll('\\]', ']')
      }

      await fs.writeFile(filepath, markdown)
      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Replaces template tag with specified content.
 * @param {String} template - Template to replace tag in.
 * @param {String} tag - Tag to replace.
 * @param {String} content - Content to replace tag with.
 * @returns {String}
 */
function tagReplace(template, tag, content) {
  const regex = templateTagString(tag)
  let newTemplate = template.replaceAll(templateTag(tag), content)

  if (newTemplate.match(regex)) {
    newTemplate = newTemplate.replaceAll(
      regex,
      (_, $1) => {
        return $1
          .replaceAll(`{${tag}}`, content)
          .slice(0, -1)
          .slice(1)
      },
    )
  }

  return newTemplate
}

/**
 * Returns template tag of specified tag.
 * @param {String} tag - Tag to return.
 * @returns {String}
 */
function templateTag(tag) {
  return `<%= ${tag} %>`
}

/**
 * Returns template tag regex for finding tags with strings.
 * @param {String} tag - Tag to return.
 * @returns {String}
 */
function templateTagString(tag) {
  return new RegExp(`<%= ${tag} (?<string>.*?)?\\s?%>`, 'g')
}

/**
 * Returns template tag regex for finding the tag and its whole line.
 * @param {String} tag - Tag to return.
 * @returns {String}
 */
function templateTagLine(tag) {
  return new RegExp(`.+?<%= ${tag} %>.+\\n`, 'g')
}

/**
 * Export create command.
 */
init()
