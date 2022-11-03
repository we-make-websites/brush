/**
 * Storybook: Theme
 * -----------------------------------------------------------------------------
 * Customise theme appearance.
 * - See https://storybook.js.org/docs/react/configure/theming
 * - See `storybook-preview-styles.scss` for additional preview styles.
 * - See `manager-head.html` for additional UI styles.
 *
 */
import { create } from '@storybook/theming'

import logo from './storybook-logo.png'

export default create({
  base: 'dark',

  // Logo
  brandImage: logo,
  brandTitle: 'Canvas Storybook',
  brandUrl: 'https://we-make-websites.gitbook.io/canvas/',

  // UI
  appBg: 'rgb(27, 27, 27)',
  appBorderRadius: 5,

  // Form colors
  inputBg: 'rgba(255, 255, 255, 0)',
  inputBorder: 'rgb(100, 100, 100)',
  inputTextColor: 'rgb(255, 255, 255)',
  inputBorderRadius: 0,
})
