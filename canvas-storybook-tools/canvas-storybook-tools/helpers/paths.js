/**
 * Helper: Paths
 * -----------------------------------------------------------------------------
 * Single source of truth for path locations for use in Basis.
 *
 */
const path = require('path')

const rootFolder = path.resolve(path.dirname('src'))

/**
 * Export.
 * @returns {Object}
 */
module.exports = {
  assets: {
    iframe: path.resolve(rootFolder, 'storybook', 'assets', 'iframe.html'),
    root: path.resolve(rootFolder, 'storybook', 'assets'),
    social: {
      destination: path.resolve(rootFolder, 'storybook', 'assets', 'storybook-social.jpg'),
      source: path.resolve(rootFolder, 'node_modules', '@we-make-websites', 'canvas-storybook-tools', 'canvas-storybook-tools', 'assets', 'storybook-social.jpg'),
    },
  },
  config: {
    root: path.resolve(rootFolder, 'storybook', 'config'),
    schema: path.resolve(rootFolder, 'storybook', 'config', 'settings_schema.json'),
    variables: path.resolve(rootFolder, './.storybook', 'assets', 'storybook-variables.js'),
    yaml: path.resolve(rootFolder, 'config.yml'),
  },
  favicon: path.resolve(rootFolder, 'storybook', 'favicon.ico'),
  iframe: path.resolve(rootFolder, 'storybook', 'iframe.html'),
  icons: path.resolve(rootFolder, 'src', 'icons'),
  index: path.resolve(rootFolder, 'storybook', 'index.html'),
  layout: {
    root: path.resolve(rootFolder, 'storybook', 'layout'),
    theme: path.resolve(rootFolder, 'storybook', 'layout', 'theme.liquid'),
  },
  packageJson: '../../package.json',
  root: path.resolve(rootFolder, 'storybook'),
  templates: {
    giftCard: path.resolve(rootFolder, 'storybook', 'templates', 'gift_card.liquid'),
    index: path.resolve(rootFolder, 'storybook', 'templates', 'index.json'),
    root: path.resolve(rootFolder, 'storybook', 'templates'),
  },
}
