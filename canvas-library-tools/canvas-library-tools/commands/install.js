#!/usr/bin/env node
/**
 * Library: Install
 * -----------------------------------------------------------------------------
 * Opens/clones repo and installs selected component.
 * Uses nodegit - https://www.nodegit.org/api/
 *
 */
const fs = require('fs-extra')
const { prompt } = require('enquirer')
const Tny = require('@we-make-websites/tannoy')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const installApi = require('../apis/install')
const messagesApi = require('../apis/messages')
const repositoryApi = require('../apis/repository')

const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
let repoComponents = []
const argv = yargs(hideBin(process.argv)).argv

const installData = {
  end: '',
  start: '',
}

const repoData = {
  end: '',
  messages: [],
  start: '',
}

const componentsToInstall = {
  alreadyInstalled: [],
  count: 0,
  dependencies: {},
  import: {
    async: [],
    global: [],
    stores: [],
  },
  libraryDependencies: [],
  manualInstall: [],
  names: [],
  packages: [],
  remove: [],
}

/**
 * Configure compiling spinner frames.
 */
/* eslint-disable-next-line array-bracket-newline */
const frames = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚']

/**
 * Initialises the library install functionality.
 */
async function init() {
  messagesApi.logBanner()

  if (argv.components && !fs.existsSync(Paths.library)) {
    Tny.message(Tny.colour('red', '❌ Library does not exist locally'))
    process.exit()
  }

  /**
   * Get components from repository.
   */
  try {
    repoData.start = performance.now()

    if (!argv.components) {
      Tny.spinner.start({
        frames,
        message: fs.existsSync(Paths.library)
          ? 'Loading component list'
          : 'Cloning repo and loading component list',
        states: {
          success: Tny.colour('green', '🚀 Components successfully loaded'),
          error: Tny.colour('red', '❌ Loading error\n'),
        },
      })
    }

    /**
     * Get components.
     */
    const response = await repositoryApi.getComponentsFromRepo()
    repoComponents = response.components
    repoData.messages = response.messages

    /**
     * Display repository messages.
     */
    if (!argv.components) {
      Tny.spinner.stop('success')
    }

    repoData.end = performance.now()
    await messagesApi.logRepository(repoData)

  } catch (error) {
    Tny.spinner.stop('error')

    Tny.message([
      ...repoData.messages,
      Tny.colour('red', `   ${error.string}`),
      error.error,
    ])

    return
  }

  /**
   * Component question.
   * - Updates componentsToInstall global object.
   */
  if (argv.components) {
    const components = argv.components.split(/[,\s]{1,2}/g)
    await buildComponentsObject(components)

  } else {
    await componentsQuestion()
    await messagesApi.logRepository(repoData, false)
  }

  /**
   * Installation.
   */
  try {
    installData.start = performance.now()

    Tny.spinner.start({
      frames,
      message: `Installing component${componentsToInstall.count > 1 ? 's' : ''}`,
      states: {
        success: Tny.colour('green', `🧩 ${componentsToInstall.count} component${componentsToInstall.count > 1 ? 's' : ''} successfully installed:`),
        error: Tny.colour('red', '❌ Installation error\n'),
      },
    })

    /**
     * Install component(s).
     */
    await installApi.installComponents(componentsToInstall)

    /**
     * Display install messages.
     */
    Tny.spinner.stop('success')
    installData.end = performance.now()
    await messagesApi.logInstallation(repoData, installData, componentsToInstall)

  } catch (error) {
    Tny.spinner.stop('error')

    const errorMessages = [
      Tny.colour('red', `   ${error.string}`),
      error.error,
    ]

    if (installData?.messages?.length) {
      errorMessages.unshift(...installData.messages)
    }

    Tny.message(errorMessages)
    return
  }

  /**
   * Open readme on Bitbucket if manual install steps or files left in temp.
   */
  try {
    await messagesApi.logPostInstallMessages(componentsToInstall)

  } catch (error) {
    Tny.message([
      Tny.colour('red', '❌ Failed to display manual steps message'),
      error,
    ])
  }
}

/**
 * Ask component question.
 * @returns {Promise}
 */
function componentsQuestion() {
  return new Promise(async(resolve, reject) => {
    let question = {}

    try {
      question = await prompt({
        choices: [
          {
            role: 'separator',
          },
          ...repoComponents.map((component) => component.name),
        ],
        hint: '(Use <space> to select, <return> to submit)',
        message: 'Component(s) to install',
        name: 'answers',
        prefix: () => '🧩',
        type: 'multiselect',
        validate(answer) {
          return answer.length ? true : Tny.colour('red', '❌ Please select at least one component')
        },
      })

      /**
       * Build object of components to install.
       */
      await buildComponentsObject(question.answers)

      /**
       * Handle if no new components are being installed.
       */
      if (
        !componentsToInstall.names.length &&
        componentsToInstall.alreadyInstalled.length
      ) {
        Tny.message(Tny.colour('yellow', '🚩 No new components selected for install'))
        // eslint-disable-next-line prefer-promise-reject-errors
        reject()
        process.exit()
      }

      /**
       * Confirm choice.
       */
      await confirmationQuestion()
      resolve(componentsToInstall)

    } catch (error) {
      Tny.message(Tny.colour('red', '⛔ Components question exited'))
      reject(error)
      process.exit()
    }
  })
}

/**
 * Confirm choice of component(s) after displaying more component details.
 * @returns {Promise}
 */
function confirmationQuestion() {
  return new Promise(async(resolve, reject) => {
    let question = {}

    Tny.message(
      messagesApi.buildComponentMessages(componentsToInstall),
      { before: true },
    )

    try {
      question = await prompt({
        message: `Install component${componentsToInstall.length > 1 ? 's' : ''}?`,
        name: 'answer',
        prefix: () => '✔️',
        type: 'confirm',
      })

      /**
       * If declined then revert back to component question.
       */
      if (!question.answer) {
        await messagesApi.logRepository(repoData)
        await componentsQuestion()
        resolve()
        return
      }

      resolve()

    } catch (error) {
      Tny.message(Tny.colour('red', '⛔ Confirmation question exited'))
      reject(error)
      process.exit()
    }
  })
}

/**
 * Build global components from list of components and order.
 * @param {Array} components - Component handles to create object of.
 */
function buildComponentsObject(components) {
  return new Promise(async(resolve, reject) => {
    try {
      const libraryJson = await fs.readJSON(Paths.libraryJson)

      for (const componentName of components) {
        buildComponentObject(componentName, libraryJson)
      }

      /**
       * Sort arrays and objects.
       */
      const orderedDependencies = {}

      Object.keys(componentsToInstall.dependencies).sort().forEach((key) => {
        orderedDependencies[key] = componentsToInstall.dependencies[key]
      })

      componentsToInstall.dependencies = orderedDependencies
      componentsToInstall.libraryDependencies.sort()
      componentsToInstall.manualInstall.sort()
      componentsToInstall.remove.sort()

      resolve()

    } catch (error) {
      Tny.message(Tny.colour('red', '⛔ Failed to build components object'))
      reject(error)
      process.exit()
    }
  })
}

/**
 * Build component object.
 * @param {String} componentName - Component question answer.
 * @param {Object} libraryJson - Canvas library.json file.
 */
function buildComponentObject(componentName, libraryJson) {
  if (componentsToInstall.names.includes(componentName)) {
    return
  }

  /**
   * Add to already installed if in Library JSON and not already in array.
   */
  if (
    libraryJson.installed[componentName] &&
    !componentsToInstall.alreadyInstalled.includes(componentName)
  ) {
    componentsToInstall.alreadyInstalled.push(componentName)
    return
  }

  /**
   * Find component object.
   */
  const component = repoComponents.find((componentObject) => {
    return componentObject.name === componentName
  })

  if (!component) {
    Tny.message(
      `❓ ${componentName} component does not exist`,
      { after: false },
    )
  }

  componentsToInstall.count++

  /**
   * Add components to import.
   */
  if (component.import.length) {
    component.import.forEach((importName) => {
      const parts = importName.split('/')
      componentsToInstall.import[parts[0]].push(parts[1])
    })
  }

  /**
   * Add Library dependencies.
   * - Runs function recursively so Library dependencies are added as normal
   *   components for the API to run through.
   */
  if (component.libraryDependencies.length) {
    componentsToInstall.libraryDependencies.push(...component.libraryDependencies)

    component.libraryDependencies.forEach((dependencyName) => {
      buildComponentObject(dependencyName, libraryJson)
    })
  }

  /**
   * Add npm dependencies.
   */
  if (Object.keys(component.dependencies).length) {
    Object.entries(component.dependencies).forEach(([key, value]) => {
      componentsToInstall.dependencies[key] = value
    })
  }

  /**
   * Add name and package.
   */
  componentsToInstall.names.push(component.name)
  componentsToInstall.packages.push(component)

  /**
   * Add if component requires manual intervention.
   */
  if (component.manualInstall) {
    componentsToInstall.manualInstall.push(component.name)
  }

  /**
   * Add remove.
   */
  if (component.remove.length) {
    componentsToInstall.remove.push(...component.remove)
  }
}

/**
 * Export library install command.
 */
init()
