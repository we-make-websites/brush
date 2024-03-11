#!/usr/bin/env node
/**
 * Component: Create
 * -----------------------------------------------------------------------------
 * Creates component scaffold.
 * - Inspired by Adam Chipperfield's https://www.npmjs.com/package/sectionise
 *
 */
const { prompt } = require('enquirer')
const fileSync = require('@we-make-websites/file-sync')
const fs = require('fs-extra')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')
const Track = require('@we-make-websites/track')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const componentApi = require('../apis/component')
const Paths = require('../helpers/paths')

/**
 * Get environment variables for Canvas config.
 */
process.env.CANVAS = JSON.stringify(true)

/**
 * Set flags.
 */
const argv = yargs(hideBin(process.argv)).argv
const debug = argv.debug

/**
 * Set default variables object.
 */
const component = {
  description: '',
  handle: '',
  folder: '',
  folderPath: '',
  formatted: {
    description: '',
    folder: '',
    lowerCase: '',
    pascalCase: '',
    titleCase: '',
  },
  import: false,
  liquid: '',
  load: '',
  name: '',
  template: '',
  webComponent: false,
}

const symbols = {
  description: '📑',
  folder: '🌍',
  handle: '📂',
  import: '🚛',
  liquid: '💧',
  load: '⏳',
  name: '📛',
  template: '🔳',
}

let complete = false
let processError = false
let version = '{{canvas version}}'

/**
 * Initialises the create functionality.
 */
async function init() {
  version = getPackageVersion()
  logBanner()

  /**
   * Check if required folder exists.
   */
  if (
    !fs.existsSync(Paths.components.async) ||
    !fs.existsSync(Paths.components.global)
  ) {
    Tny.message(Tny.colour('red', '❌ Components folder does not exist'))
    return
  }

  await askQuestions()

  if (processError || !complete) {
    return
  }

  formatAnswers()
  buildComponent()
}

/**
 * Get information from user.
 * @returns {Object}
 */
async function askQuestions() {
  try {
    await Track.init()
    Track.reportMessage('Component command')

    await nameQuestion()
    await handleQuestion()
    await descriptionQuestion()
    await folderQuestion()
    await templateQuestion()
    await webComponentTemplateQuestion()
    await liquidQuestion()
    await loadQuestion()
    await importQuestion()

  } catch (error) {
    Tny.message(Tny.colour('red', error), { before: true })
    Track.reportError(new Error(error))
  }
}

/**
 * Ask name question.
 * - Converted to sentence case.
 * @returns {Promise}
 */
async function nameQuestion() {
  let question = {}

  try {
    question = await prompt({
      hint: '(Supports letters, numbers, spaces, ampersands, forward-slashes, and hyphens)',
      message: 'Name',
      name: 'answer',
      prefix: symbols.name,
      result(answer) {
        return answer
          .trim()
          .replace(
            /(?<firstLetter>\w*)(?<rest>\s\w*)/g,
            (_, $1, $2) => {
              return $1 + $2.toLowerCase()
            },
          )
      },
      type: 'input',
      validate(answer) {
        if (debug) {
          return true
        }

        const error = []

        if (!answer.trim()) {
          error.push('Name is required')
        }

        if (answer.trim().length < 4) {
          error.push('Name is too short (less then 4 characters)')
        }

        if (answer.trim().length > 25) {
          error.push('Name is too long for Shopify settings schema name value (more than 25 characters)')
        }

        if (answer.slice(0, 1).match(/^\s$/g)) {
          error.push('Name can\'t start with a space')
        }

        if (!answer.slice(-1).match(/^\w$/g)) {
          error.push('Name can\'t end with punctuation')
        }

        if (!answer.trim().match(/^[\w\d\s/&-]+$/giu)) {
          error.push('Invalid characters')
        }

        const formattedError = error.length
          ? error[0]
          : ''

        return error.length ? Tny.colour('red', `❌ ${formattedError}`) : true
      },
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.name = question.answer

  return new Promise((resolve) => {
    resolve()
  })
}

/**
 * Ask handle question.
 * - Converted to kebab-case.
 * - Must not start with a number as this is invalid CSS and Vue.
 * @returns {Promise}
 */
async function handleQuestion() {
  const tempHandle = component.name
    .toLowerCase()
    .replace(/\//g, '-')
    .replace(/&/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s/g, '-')
    .replace(/-{2,}/g, '-')

  let initial = []

  /**
   * Remove parts if they would mean the handle starts with a number.
   */
  tempHandle.split('-').forEach((part) => {
    const startsWithNumber = part.slice(0, 1).match(/\d/g)

    if (!initial.length && startsWithNumber) {
      return
    }

    initial.push(part)
  })

  initial = initial.join('-')

  let question = {}

  try {
    question = await prompt({
      initial,
      hint: '(Must be kebab-case, supports letters, numbers, and hyphens)',
      message: 'Handle',
      name: 'answer',
      prefix: symbols.handle,
      result(answer) {
        return answer
          .trim()
          .toLowerCase()
      },
      type: 'input',
      validate(answer) {
        if (debug) {
          return true
        }

        const error = []

        if (!answer.trim()) {
          error.push('Handle is required')
        }

        if (answer.trim().length < 4) {
          error.push('Handle is too short (less than 4 characters)')
        }

        if (answer.split('-').length < 2) {
          error.push('Handle must be at least two words')
        }

        if (!answer.slice(0, 1).match(/^[a-z]{1}$/giu)) {
          error.push('Handle must start with a letter')
        }

        if (!answer.slice(-1).match(/^\w$/g)) {
          error.push('Handle can\'t end with punctuation')
        }

        if (answer.match(/[A-Z]/g)) {
          error.push('Handle must be lowercase')
        }

        if (answer.match(/\s/g)) {
          error.push('No spaces allowed')
        }

        if (!answer.match(/^[\w\d\s-]+$/giu)) {
          error.push('Invalid characters')
        }

        const formattedError = error.length
          ? error[0]
          : ''

        return error.length ? Tny.colour('red', `❌ ${formattedError}`) : true
      },
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.handle = question.answer

  return new Promise((resolve) => {
    resolve()
  })
}

/**
 * Ask description question.
 * - Adds full stop to end if not present.
 * @returns {Promise}
 */
async function descriptionQuestion() {
  let question = {}

  try {
    question = await prompt({
      message: 'Description',
      name: 'answer',
      prefix: symbols.description,
      result(answer) {
        return answer.trim().slice(-1) === '.' ? answer.trim() : `${answer.trim()}.`
      },
      type: 'input',
      validate(answer) {
        if (debug) {
          return true
        }

        const error = []

        if (!answer.trim()) {
          error.push('Description is required')
        }

        if (answer.trim().length < 4) {
          error.push('Description is too short (less than 4 characters)')
        }

        if (answer.slice(0, 1).match(/^\s$/g)) {
          error.push('Description can\'t start with a space')
        }

        if (answer.includes('`')) {
          error.push('Backticks are not allowed')
        }

        const formattedError = error.length
          ? error[0]
          : ''

        return error.length ? Tny.colour('red', `❌ ${formattedError}`) : true
      },
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.description = question.answer

  return new Promise((resolve) => {
    resolve()
  })
}

/**
 * Ask type/folder question.
 * @returns {Promise}
 */
async function folderQuestion() {
  let question = {}

  try {
    question = await prompt({
      choices: [
        { role: 'separator' },
        'Async',
        'Global',
        'Web',
      ],
      footer: ({ index }) => footer('folder', index),
      message: 'Type',
      name: 'answer',
      pointer: () => '',
      prefix: symbols.folder,
      result(answer) {
        return answer.toLowerCase()
      },
      type: 'select',
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.folder = question.answer
  component.folderPath = question.answer

  /**
   * Web component pretends to be async component.
   */
  if (component.folder === 'web') {
    component.folderPath = 'async'
    component.webComponent = true
  }

  const filepath = path.join(
    Paths.components[component.folderPath],
    component.handle,
  )

  return new Promise((resolve, reject) => {
    if (!debug && fs.existsSync(filepath)) {
      const folderFiles = fileSync(filepath, { array: true })

      if (folderFiles.length) {
        processError = true
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('❌ Component already exists')
        return
      }
    }

    resolve()
  })
}

/**
 * Ask template question.
 * @returns {Promise}
 */
async function templateQuestion() {
  let question = {}

  try {
    question = await prompt({
      choices: [
        { role: 'separator' },
        'Dynamic',
        'Limited interactivity',
        'Static',
      ],
      footer: ({ index }) => footer('template', index),
      message: 'Template',
      name: 'answer',
      pointer: () => '',
      prefix: symbols.template,
      result(answer) {
        return answer.toLowerCase().trim().replaceAll(' ', '-')
      },
      skip: component.webComponent,
      type: 'select',
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.template = question.answer

  if (component.webComponent) {
    component.template = 'dynamic'
  }

  return new Promise((resolve) => {
    resolve()
  })
}

/**
 * Ask web component template question.
 * - Skip if not web component.
 * @returns {Promise}
 */
async function webComponentTemplateQuestion() {
  let question = {}

  try {
    question = await prompt({
      choices: [
        { role: 'separator' },
        'Vanilla',
        'Vue',
      ],
      hint: '(Select Vue for a Vue-inspired template with helpers)',
      index: 2,
      message: 'Template',
      name: 'answer',
      pointer: () => '',
      prefix: symbols.template,
      skip: !component.webComponent,
      result(answer) {
        return answer.toLowerCase().trim()
      },
      type: 'select',
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  if (question.answer) {
    component.template = question.answer
  }

  return new Promise((resolve) => {
    complete = true
    resolve()
  })
}

/**
 * Ask Liquid question.
 * - No point in a static snippet, just create a snippet from scratch.
 * @returns {Promise}
 */
async function liquidQuestion() {
  const choices = [
    { role: 'separator' },
    'Section',
    {
      name: 'Snippet',
      disabled: component.template === 'dynamic' || component.webComponent
        ? false
        : '(Only available with dynamic templates)',
    },
  ]

  let question = {}

  try {
    question = await prompt({
      choices,
      message: 'Liquid type',
      footer,
      name: 'answer',
      pointer: () => '',
      prefix: symbols.liquid,
      result(answer) {
        return answer.toLowerCase().trim()
      },
      type: 'select',
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.liquid = question.answer

  return new Promise((resolve) => {
    resolve()
  })
}

/**
 * Ask load question.
 * - Skip if not async, dynamic, or a section.
 * - Defaults to 'scroll' if skipped.
 * @returns {Promise}
 */
async function loadQuestion() {
  let question = {}

  try {
    question = await prompt({
      choices: [
        { role: 'separator' },
        'Load',
        'Scroll',
        'Trigger',
      ],
      footer: ({ index }) => footer('load', index),
      index: 2,
      message: 'Load type',
      name: 'answer',
      pointer: () => '',
      prefix: symbols.load,
      skip: skipLoadQuestion(),
      result(answer) {
        return answer.toLowerCase().trim()
      },
      type: 'select',
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.load = question.answer ? question.answer : 'scroll'

  return new Promise((resolve) => {
    complete = true
    resolve()
  })
}

/**
 * Ask import question.
 * @returns {Promise}
 */
async function importQuestion() {
  let question = {}

  try {
    question = await prompt({
      choices: [
        { role: 'separator' },
        'Import',
        'Manually import',
      ],
      footer,
      message: 'Import component files',
      name: 'answer',
      pointer: () => '',
      prefix: symbols.import,
      result(answer) {
        return answer.toLowerCase().trim()
      },
      type: 'select',
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.import = question.answer === 'import'

  return new Promise((resolve) => {
    complete = true
    resolve()
  })
}

/**
 * Format answers.
 */
function formatAnswers() {
  component.formatted.folder = `${component.folder[0].toUpperCase()}${component.folder.slice(1)}`
  component.formatted.lowerCase = component.name.toLowerCase()

  component.formatted.pascalCase = component.handle
    .replace(
      /(?<firstLetter>\w)(?<rest>\w*)/g,
      (_, $1, $2) => {
        return $1.toUpperCase() + $2.toLowerCase()
      },
    )
    .replace(/-/g, '')
    .replace(/\s/g, '')

  component.formatted.titleCase = component.name
    .replace(
      /(?<firstLetter>\w)(?<rest>\w*)/g,
      (_, $1, $2) => {
        return $1.toUpperCase() + $2.toLowerCase()
      },
    )

  /**
   * Split description onto multiple lines to avoid eslint errors.
   */
  const words = component.description.split(' ')
  let lineLength = 0

  const description = words.map((word, index) => {
    lineLength += index === 0 ? word.length : word.length + 1

    if (lineLength > 77) {
      lineLength = word.length
      return `\n * ${word}`
    }

    return index === 0 ? word : ` ${word}`
  })

  component.formatted.description = description.join('')
}

/**
 * Build dynamic component.
 */
async function buildComponent() {
  const filepath = path.join(
    Paths.components[component.folderPath],
    component.handle,
  )

  const templateFilepath = {
    liquid: false,
    schema: false,
    stories: false,
    styles: false,
    vue: false,
  }

  /**
   * Output information.
   */
  const start = performance.now()

  try {

    /**
     * Create templates.
     */
    templateFilepath.styles = `styles-${component.liquid}`

    if (component.template === 'dynamic') {
      templateFilepath.liquid = `liquid-${component.folder}-${component.liquid}`
      templateFilepath.stories = 'stories'
      templateFilepath.vue = `vue-${component.folder}-${component.liquid}`
    }

    if (component.template === 'limited-interactivity') {
      templateFilepath.liquid = `liquid-${component.folder}-${component.liquid}-limited-interactivity`
      templateFilepath.vue = `vue-${component.folder}-limited-interactivity`
    }

    if (component.template === 'static') {
      templateFilepath.liquid = `liquid-${component.folder}-${component.liquid}-static`
      templateFilepath.vue = 'vue-static'
    }

    if (component.load === 'trigger') {
      templateFilepath.liquid = `liquid-${component.folder}-${component.liquid}-trigger`
      templateFilepath.vue = `vue-${component.folder}-${component.liquid}-trigger`
    }

    if (component.liquid === 'section') {
      templateFilepath.schema = `schema-${component.folder}`
    }

    if (component.liquid === 'snippet') {
      templateFilepath.liquid = 'liquid-snippet'
    }

    /**
     * Web component overrides.
     */
    if (component.folder === 'web') {
      templateFilepath.liquid = `liquid-web-${component.liquid}`
      templateFilepath.stories = 'stories-web'
      templateFilepath.vue = `web-component-${component.template}`
    }

    /**
     * Load templates.
     */
    const template = {
      liquid: await componentApi.getComponentTemplate(component, templateFilepath.liquid),
      schema: await componentApi.getComponentTemplate(component, templateFilepath.schema),
      stories: await componentApi.getComponentTemplate(component, templateFilepath.stories),
      styles: await componentApi.getComponentTemplate(component, templateFilepath.styles),
      vue: await componentApi.getComponentTemplate(component, templateFilepath.vue),
    }

    /**
     * Create folder.
     */
    await fs.ensureDir(filepath)

    /**
     * Write templates.
     */
    await componentApi.writeTemplate(filepath, `${component.handle}.${component.liquid}.liquid`, template.liquid)
    await componentApi.writeTemplate(filepath, `${component.handle}.scss`, template.styles)
    await componentApi.writeTemplate(filepath, `${component.handle}.${component.webComponent ? 'js' : 'vue'}`, template.vue)

    if (component.template === 'dynamic' || component.webComponent) {
      await componentApi.writeTemplate(filepath, `${component.handle}.stories.js`, template.stories)
    }

    if (component.liquid === 'section') {
      await componentApi.writeTemplate(filepath, `${component.handle}.schema.js`, template.schema)
    }

    /**
     * Update import file.
     */
    if (component.import) {
      await componentApi.importComponent(component)
    }

    /**
     * Complete process.
     */
    const end = performance.now()
    const messages = [Tny.colour('green', '🚀 Component files created')]
    messages.push(Tny.time(start, end))
    messages.push(footer())
    Tny.message(messages, { after: false, before: true })

  } catch (promiseError) {
    Tny.message(
      [
        Tny.colour('red', '❌ Failed to build component'),
        promiseError,
      ],
      { before: true },
    )
  }
}

/**
 * Utilities
 * -----------------------------------------------------------------------------
 * Utility classes to above functions.
 *
 */

/**
 * Get design tools package version.
 * @returns {String}
 */
function getPackageVersion() {
  const packagePath = path.resolve('node_modules', '@we-make-websites/canvas-component-tools/package.json')

  if (!fs.existsSync(packagePath)) {
    return '{{canvas version}}'
  }

  const toolPackage = require(packagePath)
  return toolPackage.version
}

/**
 * Log banner to console.
 */
function logBanner() {
  const messages = [
    Tny.colour('bgCyan', `Canvas component tools v${version}`),
    Tny.colour('bgCyan', 'Create command'),
  ]

  if (debug) {
    messages.push(Tny.colour('bgYellow', 'Restrictions disabled in debug mode'))
  }

  Tny.message(messages, { empty: true })
}

/**
 * Builds footer documentation links.
 * @param {String} type - Question type.
 * @param {Number} index - Current index choice.
 * @returns {String}
 */
function footer(type, index) {
  let message = `\n📚 ${Tny.colour('magenta', 'Documentation')}\n`

  /**
   * Documentation links.
   */
  const links = {
    folder: {
      async: 'https://we-make-websites.gitbook.io/canvas/components/overview/async-components',
      global: 'https://we-make-websites.gitbook.io/canvas/components/overview/global-components',
      web: 'https://we-make-websites.gitbook.io/canvas/components/overview/web-components',
    },
    load: {
      load: 'https://we-make-websites.gitbook.io/canvas/components/overview/async-components#data-component-type',
      scroll: 'https://we-make-websites.gitbook.io/canvas/components/overview/async-components#data-component-type',
      trigger: 'https://we-make-websites.gitbook.io/canvas/components/overview/async-components#data-component-type',
    },
    template: {
      dynamic: '',
      'limited-interactivity': 'https://we-make-websites.gitbook.io/canvas/components/other-types/limited-interactivity-components',
      static: 'https://we-make-websites.gitbook.io/canvas/components/other-types/static-components',
    },
  }

  /**
   * Build documentation links from previous choices.
   */
  Object.entries(component).forEach(([key, value]) => {
    if (key === 'formatted' || !links[key] || !links[key][value]) {
      return
    }

    /**
     * Ignore load type if not applicable.
     */
    if (key === 'load' && skipLoadQuestion()) {
      return
    }

    /**
     * Override documentation URL for web components.
     */
    let docUrl = links[key][value]

    if (component.webComponent && value === 'async') {
      docUrl = links[key].web
    }

    message += `${symbols[key]} ${docUrl}\n`
  })

  /**
   * Add current choice's documentation.
   */
  if (type && index) {
    const documentation = Object.values(links[type])[index - 1]

    if (documentation) {
      message += `${symbols[type]} ${Tny.colour('cyan', documentation)}`
    }
  }

  return message
}

/**
 * Skip load question?
 * @returns {Boolean}
 */
function skipLoadQuestion() {
  return (
    component.webComponent ||
    (component.folder && component.folder !== 'async') ||
    (component.template && component.template !== 'dynamic') ||
    (component.liquid && component.liquid !== 'section')
  )
}

/**
 * Run component command.
 */
init()
