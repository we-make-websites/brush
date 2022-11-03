#!/usr/bin/env node
/**
 * Component: Create
 * -----------------------------------------------------------------------------
 * Creates component scaffold.
 * - Inspired by Adam Chipperfield's https://www.npmjs.com/package/sectionise
 *
 */
const { prompt } = require('enquirer')
const fs = require('fs-extra')
const path = require('path')
const Tny = require('@we-make-websites/tannoy')

const componentApi = require('../apis/component')
const Paths = require('../helpers/paths')

/**
 * Get environment variables for Canvas config.
 */
process.env.CANVAS = JSON.stringify(true)

/**
 * Set default variables object.
 */
const component = {
  handle: '',
  folder: 'async',
  import: false,
  liquid: 'section',
  load: 'scroll',
  name: '',
  formatted: {
    folder: '',
    lowerCase: '',
    pascalCase: '',
    titleCase: '',
    type: '',
  },
  template: 'dynamic',
}

let processError = false
let complete = false

/**
 * Initialises the create functionality.
 */
async function init() {
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
 * Log banner to console.
 */
function logBanner() {
  Tny.message([
    Tny.colour('bgCyan', 'Canvas generate v{{canvas version}}'),
    Tny.colour('bgCyan', 'Component command'),
  ], { empty: true })
}

/**
 * Get information from user.
 * @returns {Object}
 */
async function askQuestions() {
  try {
    await nameQuestion()
    await handleQuestion()
    await descriptionQuestion()
    await typeQuestion()
    await templateQuestion()
    await liquidQuestion()
    await loadQuestion()
    await importQuestion()

  } catch (promiseError) {
    Tny.message(Tny.colour('red', promiseError), { before: true })
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
      prefix: () => '📛',
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
        const error = []

        if (!answer.trim()) {
          return Tny.colour('red', '❌ Name is required')
        }

        if (answer.trim().length < 4) {
          error.push('Name is too short')
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
          ? `${error[0].slice(0, 1)}${error.join(', ').toLowerCase().slice(1)}`
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
      prefix: () => '📂',
      result(answer) {
        return answer
          .trim()
          .toLowerCase()
      },
      type: 'input',
      validate(answer) {
        const error = []

        if (!answer.trim()) {
          return Tny.colour('red', '❌ Handle is required')
        }

        if (answer.trim().length < 4) {
          error.push('Handle is too short')
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
          ? `${error[0].slice(0, 1)}${error.join(', ').toLowerCase().slice(1)}`
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
      prefix: () => '📑',
      result(answer) {
        return answer.slice(-1) === '.' ? answer : `${answer}.`
      },
      type: 'input',
      validate(answer) {
        const error = []

        if (!answer.trim()) {
          return Tny.colour('red', '❌ Description is required')
        }

        if (answer.trim().length < 4) {
          error.push('Description is too short')
        }

        if (answer.slice(0, 1).match(/^\s$/g)) {
          error.push('Description can\'t start with a space')
        }

        if (answer.includes('`')) {
          error.push('Backticks are not allowed')
        }

        const formattedError = error.length
          ? `${error[0].slice(0, 1)}${error.join(', ').toLowerCase().slice(1)}`
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
async function typeQuestion() {
  let question = {}

  try {
    question = await prompt({
      choices: [
        { role: 'separator' },
        'async',
        'global',
      ],
      message: 'Type',
      name: 'answer',
      pointer: () => '',
      prefix: () => '🌍',
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

  const filepath = path.join(
    Paths.components[component.folder],
    component.handle,
  )

  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      processError = true
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('❌ Component already exists')
      return
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
        'dynamic',
        'static',
      ],
      message: 'Template',
      name: 'answer',
      pointer: () => '',
      prefix: () => '🔳',
      result(answer) {
        return answer.toLowerCase().trim()
      },
      type: 'select',
    })

  } catch (error) {
    Tny.message(Tny.colour('red', '⛔ Process exited'))
    process.exit()
  }

  component.template = question.answer

  return new Promise((resolve) => {
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
    'section',
    {
      name: 'snippet',
      disabled: component.template === 'dynamic'
        ? false
        : '(Only available with dynamic templates)',
    },
  ]

  let question = {}

  try {
    question = await prompt({
      choices,
      message: 'Liquid type',
      name: 'answer',
      pointer: () => '',
      prefix: () => '💧',
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
        'load',
        'scroll',
        'trigger',
      ],
      index: 2,
      message: 'Load type',
      name: 'answer',
      pointer: () => '',
      prefix: () => '⏳',
      skip:
        component.folder !== 'async' ||
        component.template !== 'dynamic' ||
        component.liquid !== 'section',
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
      message: 'Import component files',
      name: 'answer',
      pointer: () => '',
      prefix: () => '➕',
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
}

/**
 * Build dynamic component.
 */
async function buildComponent() {
  const filepath = path.join(
    Paths.components[component.folder],
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

    if (component.template === 'static') {
      templateFilepath.liquid = `liquid-${component.folder}-${component.liquid}-static`
      templateFilepath.vue = 'vue-static'
    }

    if (component.load === 'trigger') {
      templateFilepath.liquid = `liquid-${component.folder}-${component.liquid}-trigger`
      templateFilepath.vue = `vue-${component.folder}-${component.liquid}-trigger`
    }

    if (component.liquid === 'section') {
      templateFilepath.schema = 'schema'
    }

    if (component.liquid === 'snippet') {
      templateFilepath.liquid = 'liquid-snippet'
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
    await fs.mkdir(filepath)

    /**
     * Write templates.
     */
    await componentApi.writeTemplate(filepath, `${component.handle}.${component.liquid}.liquid`, template.liquid)
    await componentApi.writeTemplate(filepath, `${component.handle}.scss`, template.styles)
    await componentApi.writeTemplate(filepath, `${component.handle}.vue`, template.vue)

    if (component.template === 'dynamic') {
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
    Tny.message(messages, { before: true })

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
 * Run component command.
 */
init()
