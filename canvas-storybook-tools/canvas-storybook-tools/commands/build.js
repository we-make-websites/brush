#!/usr/bin/env node
/**
 * Storybook: Build
 * -----------------------------------------------------------------------------
 * Runs `build-storybook` then organises files to be Shopify compatible.
 *
 */
/* eslint-disable no-console */
const fs = require('fs-extra')
const glob = require('glob-fs')({ gitignore: true })
const Tny = require('@we-make-websites/tannoy')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const getPackageVersion = require('../helpers/get-package-version')
const getVariablesUpdated = require('../helpers/get-variables-updated')
const Paths = require('../helpers/paths')

/**
 * Execute commands in node.
 */
const util = require('util')
const exec = util.promisify(require('child_process').exec)

/**
 * Set flags.
 */
const argv = yargs(hideBin(process.argv)).argv

/**
 * Set global variables.
 */
let iframeScripts = []
let version = '{{canvas version}}'

/**
 * Configure compiling spinner frames.
 */
/* eslint-disable-next-line array-bracket-newline */
const frames = ['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚']

/**
 * Initialises the storybook build functionality.
 */
async function init() {
  const start = performance.now()
  const variablesUpdated = await getVariablesUpdated()
  version = getPackageVersion()

  try {
    logBanner()

    if (!variablesUpdated) {
      Tny.message([
        Tny.colour('red', '❌ Storybook variables have not been updated or don\'t exist'),
        '📂 Update .storybook/assets/storybook-variables.js',
        Tny.colour('brightBlack', '❔ credentials.storefront.store does not match the first environment in config.yml'),
      ])

      return
    }

    Tny.spinner.start({
      frames,
      message: 'Building storybook',
      states: {
        success: Tny.colour('green', '🚀 Build succeeded'),
        error: Tny.colour('red', '❌ Build failed\n'),
      },
    })

    /**
     * Build storybook (debug mode).
     */
    if (argv.debug) {
      exec('build-storybook --output-dir storybook', (error, stdout, stderror) => {
        if (error) {
          Tny.spinner.stop('error')
          console.log(error)
          return
        }

        Tny.spinner.stop('success')
        console.log(stdout)
        console.log(stderror)
        processFiles()
      })

      return
    }

    /**
     * Build storybook (normally).
     */
    await exec('build-storybook --output-dir storybook')
    await processFiles()

    const end = performance.now()
    Tny.spinner.stop('success')
    Tny.message(Tny.time(start, end))

  } catch (error) {
    Tny.spinner.stop('error')
    Tny.message(error)
  }
}

/**
 * Outputs Canvas banner.
 */
function logBanner() {
  const messages = [
    Tny.colour('bgCyan', `Canvas storybook tools v${version}`),
    Tny.colour('bgCyan', 'Build command'),
    Tny.colour('bgCyan', 'Running build-storybook --output-dir storybook'),
  ]

  if (argv.debug) {
    messages.push(Tny.colour('bgCyan', 'Outputting storybook debug'))
  }

  Tny.message(messages, { empty: true })
}

/**
 * Process files so they work on Shopify.
 * - Remove default favicon file.
 * - Update index.
 * - Move iframe.html.
 * - Create minimum Liquid files.
 * - Update JS file references.
 * - Move social sharing image.
 * @returns {Promise}
 */
function processFiles() {
  return new Promise(async(resolve, reject) => {
    try {
      await fs.remove(Paths.favicon)
      await updateIndex()
      await updateIframe()
      await createLiquidFiles()
      await updateAssets()
      await fs.copy(Paths.assets.social.source, Paths.assets.social.destination)

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Updates the index to be theme.liquid.
 * - Updates array of scripts references in iframe.html.
 * @returns {Promise}
 */
function updateIndex() {
  return new Promise(async(resolve, reject) => {
    try {
      let file = await fs.readFile(Paths.index, 'utf-8')

      file = file
        .replace('</head>', `{% capture shopify_header_content %}{{ content_for_header }}{% endcapture %}{{ shopify_header_content | remove: 'previewBarInjector.init();' }}</head>`)
        .replace('</body>', '{{ content_for_layout }}</body>')
        .replace('<title>Webpack App</title>', getTitle())
        .replace(
          /assets\/(?<url>[a-z0-9.-]*\.(?:js|png))/g,
          (_, $1) => {
            return `{{ '${$1}' | asset_url }}`
          },
        )

      await fs.writeFile(Paths.index, file, 'utf-8')

      await fs.move(
        Paths.index,
        Paths.layout.theme,
      )

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Get title and OpenGraph tags.
 * @returns {String}
 */
function getTitle() {
  return `
    {%- liquid
      assign og_description = 'Storybook of all styles and components built for # by We Make Websites.' | replace: '#', shop.name
      assign og_title = 'Storybook'
      assign og_type = 'website'
      assign og_url = canonical_url | default: request.origin
    -%}

    <title>{{ og_title }}</title>

    <meta property="og:description" content="{{ og_description | escape }}">
    <meta property="og:site_name" content="{{ shop.name }}">
    <meta property="og:title" content="{{ og_title | escape }}">
    <meta property="og:type" content="{{ og_type }}">
    <meta property="og:url" content="{{ og_url }}">
    <meta property="og:image" content="http:{{ 'storybook-social.jpg' | asset_img_url: '1200x' }}">
    <meta property="og:image:alt" content="">
    <meta property="og:image:height" content="628">
    <meta property="og:image:secure_url" content="https:{{ 'storybook-social.jpg' | asset_img_url: '1200x' }}">
    <meta property="og:image:width" content="1200">
  `
}

/**
 * Moves iFrame to assets folder.
 * - Updates array of scripts references in iframe.html.
 * @returns {Promise}
 */
function updateIframe() {
  return new Promise(async(resolve, reject) => {
    try {
      const file = await fs.readFile(Paths.iframe, 'utf-8')
      iframeScripts = file.match(/[a-z0-9.-]*\.(?:js|png)/g)
      await fs.move(Paths.iframe, Paths.assets.iframe)

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Create minimum required Liquid files for functional theme.
 * @returns {Promise}
 */
function createLiquidFiles() {
  const packageJson = require(Paths.packageJson)

  return new Promise(async(resolve, reject) => {
    try {

      /**
       * Create index.json template.
       */
      await fs.mkdirSync(Paths.templates.root)

      await fs.writeFile(
        Paths.templates.index,
        '{\n  "sections": {},\n  "order": []\n}',
        'utf-8',
      )

      /**
       * Create settings_schema.json config.
       */
      await fs.mkdirSync(Paths.config.root)

      await fs.writeFile(
        Paths.config.schema,
        `[{"name":"theme_info","theme_name":"Storybook","theme_version":"${packageJson.version}","theme_author":"We Make Websites","theme_documentation_url":"https://we-make-websites.gitbook.io/canvas/canvas-tools/storybook","theme_support_url":"https://we-make-websites.atlassian.net/jira/software/c/projects/CANVAS"}]`,
        'utf-8',
      )

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Finds all assets and updates file references to use asset_url Liquid.
 * @returns {Promise}
 */
async function updateAssets() {
  const queue = await glob.readdirPromise('storybook/assets/**/*').map((filepath) => {
    return updateAssetFile(filepath)
  }).filter(Boolean)

  return Promise.all(queue)
}

/**
 * Updates assets.
 * - Removes if license.txt.
 * - Ignores if not .js file.
 * - Updates JS code to point to use asset_url Liquid.
 * - Changes file type to .js.liquid.
 * @param {String} filepath - Path to file to update.
 * @returns {Promise}
 */
function updateAssetFile(filepath) {
  return new Promise(async(resolve, reject) => {
    try {
      if (filepath.includes('LICENSE.txt')) {
        await fs.remove(filepath)
        resolve()
        return
      }

      if (filepath.includes('.png')) {
        resolve()
        return
      }

      /**
       * Update file contents.
       */
      let file = await fs.readFile(filepath, 'utf-8')

      file = file
        .replaceAll('static/media', 'assets')
        .replace(
          /assets\/(?<url>[a-z0-9.-]*\.(?:js|png))/g,
          (_, $1) => {
            return `{{ '${$1}' | asset_url }}`
          },
        )
        .replaceAll(
          '"/iframe.html?id="',
          `{{ 'iframe.html' | asset_url | append: '&id=' | json }}`,
        )

      /**
       * Only set iFrame URL in non-iFrame scripts.
       */
      const iframeScript = iframeScripts.find((script) => {
        return filepath.includes(script)
      })

      if (!iframeScript) {
        file = file
          .replaceAll(
            '"/iframe.html"',
            '"iframe.html"',
          )
          .replaceAll(
            '"iframe.html"',
            `{{ 'iframe.html' | asset_url | json }}`,
          )
      }

      /**
       * Update file.
       */
      await fs.writeFile(filepath, file, 'utf-8')

      /**
       * Change file type to Liquid if using Liquid tags.
       */
      if (file.includes('| asset_url')) {
        await fs.move(filepath, `${filepath}.liquid`)
      }

      resolve()

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Export storybook build command.
 */
init()
