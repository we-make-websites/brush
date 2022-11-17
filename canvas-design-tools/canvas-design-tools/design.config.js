/**
 * Helper: Config
 * -----------------------------------------------------------------------------
 * Configuration for design command helpers.
 *
 */
/* eslint-disable array-bracket-newline */
const Paths = require('@we-make-websites/basis/basis/helpers/paths')

/**
 * Ordinal sorting orders.
 */
const screenOrdinals = ['mobile', 'tablet', 'desktop']
const sizeOrdinals = ['4xs', '3xs', '2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl', '10xl']
const sizeOrdinalsReverse = [...sizeOrdinals].reverse()
const spacingOrdinals = ['tightest', 'tighter', 'tight', 'baseline', 'normal', 'loose', 'looser', 'loosest']
const timingOrdinals = ['quickest', 'quicker', 'quick', 'normal', 'slow', 'slower', 'slowest', 'message']

/**
 * Export config.
 * @returns {Object}
 */
module.exports = {

  /**
   * ---------------------------------------------------------------------------
   * 1. Set the tokens.
   * - Only these tokens will be converted to CSS variables and classes.
   * - If they don't exist in tokens then they'll be ignored.
   * ---------------------------------------------------------------------------
   */

  /**
   * Find variables based on type property in object.
   */
  variablesByType: [
    'borderRadius',
    'borderWidth',
    'boxShadow',
    'color',
    'fontFamilies',
    'fontSizes',
    'fontWeights',
    'letterSpacing',
    'lineHeights',
    'spacing',
    'textCase',
    'textDecoration',
  ],

  /**
   * Find variables based on the name of the object.
   * - If an item has a '-' suffix then it will be used to match objects
   *   starting with the provided string.
   */
  variablesByName: [
    'breakpoint',
    'columns',
    'easing',
    'focus-ring',
    'form',
    'gutter',
    'header',
    'icon',
    'layer',
    'margin',
    'max-content-width',
    'paragraphIndent',
    'scale',
    'text-indent',
    'timing',
  ],

  /**
   * Object types to use as classes.
   */
  classes: [
    'typography',
  ],

  /**
   * ---------------------------------------------------------------------------
   * 2. Rename the variables/properties.
   * - Rename types to their equivalent CSS property
   * - The key should match a value you put in the variablesByName or
   *   variablesByType settings.
   * - Use the renamed variables/properties after this step.
   * - If original type isn't found then it's ignored.
   * ---------------------------------------------------------------------------
   */

  /**
   * Original token types and their renamed value.
   */
  renameVariable: {
    borderRadius: 'border-radius',
    borderWidth: 'border-width',
    boxShadow: 'box-shadow',
    fontFamilies: 'font-family',
    fontSizes: 'font-size',
    fontWeights: 'font-weight',
    letterSpacing: 'letter-spacing',
    lineHeights: 'line-height',
    paragraphIndent: 'text-indent',
    textCase: 'text-transform',
    textDecoration: 'text-decoration',
  },

  /**
   * ---------------------------------------------------------------------------
   * 3. Set units.
   * - Those marked as 'rem' will be converted from px to rem using
   *   special.baseScale as the scale to divide by.
   * - Those marked 'rgb` will be converted from hexadecimal to rgb, if the
   *   hexadecimal value has an alpha channel then this will be preserved.
   * - If a value has a '%' sign then it will not be converted.
   * ---------------------------------------------------------------------------
   */

  /**
   * Token groups and their associated units.
   */
  units: {
    'border-radius': 'px',
    'border-width': 'px',
    'box-shadow': 'rgb',
    breakpoint: 'rem',
    color: 'rgb',
    'focus-ring': 'px',
    'font-size': 'rem',
    form: 'px',
    gutter: 'rem',
    header: 'px',
    icon: 'rem',
    'letter-spacing': 'px',
    margin: 'rem',
    'max-content-width': 'rem',
    scale: 'px',
    spacing: 'rem',
    'text-indent': 'px',
    timing: 's',
  },

  /**
   * ---------------------------------------------------------------------------
   * 4. Set sorting.
   * - Determines order of CSS variables in stylesheet.
   * - Each key accepts either 'alpha' for alphabetical sorting or an array for
   *   custom sorting order.
   * - If no sorting is provided then it won't be sorted.
   * - Class properties are automatically sorted alphabetically.
   * ---------------------------------------------------------------------------
   */

  /**
   * Token groups and how they should be sorted.
   */
  sorting: {
    breakpoint: sizeOrdinals,
    color: 'alpha',
    columns: screenOrdinals,
    easing: 'alpha',
    'font-family': 'alpha',
    'font-size': sizeOrdinals,
    'font-weight': ['thin', 'extra-light', 'ultra-light', 'light', 'book', 'normal', 'regular', 'medium', 'demi-bold', 'demibold', 'semi-bold', 'semibold', 'bold', 'extra-bold', 'ultra-bold', 'black', 'heavy'],
    layer: ['base', 'flat', 'raised', 'heightened', 'sticky', 'window-overlay', 'overlay', 'temporary'],
    'letter-spacing': spacingOrdinals,
    'line-height': spacingOrdinals,
    margin: screenOrdinals,
    spacing: sizeOrdinals,
    timing: timingOrdinals,
    typography: {
      heading: sizeOrdinalsReverse,
      body: [...sizeOrdinalsReverse, 'label'],
      button: sizeOrdinalsReverse,
      label: sizeOrdinalsReverse,
      utility: sizeOrdinalsReverse,
    },
  },

  /**
   * ---------------------------------------------------------------------------
   * 5. Configure typography settings.
   * ---------------------------------------------------------------------------
   */

  /**
   * Set default typography to be used for body text, links, and buttons.
   * - Body sets styles for the html, body and .rte elements.
   * - Button sets styles for default btn and Shopify challenge buttons.
   * - Link sets styles for a elements.
   */
  defaults: {
    body: 'text-body-m',
    button: 'text-utility-button',
    link: 'text-body-m-link',
  },

  /**
   * Set fallback font stacks if not set by designer in token's description.
   * - Use name of font family CSS variable as key and font stack as value.
   */
  fontStacks: {
    'font-family-body': 'Helvetica, Arial, sans-serif',
  },

  /**
   * Font weight names and the font weight number to replace them with.
   */
  fontWeights: {
    thin: 100,
    'extra-light': 200,
    'ultra-light': 200,
    light: 300,
    book: 400,
    normal: 400,
    regular: 400,
    medium: 500,
    'demi-bold': 600,
    demibold: 600,
    'semi-bold': 600,
    semibold: 600,
    bold: 700,
    'extra-bold': 800,
    'ultra-bold': 800,
    black: 900,
    heavy: 900,
  },

  /**
   * Set to true to enable tablet breakpoint text classes in output.
   * - Only enable if required as it increases stylesheet size.
   */
  textTabletBreakpoint: false,

  /**
   * ---------------------------------------------------------------------------
   * 6. Configure brand colours.
   * - E.g. Background: `.background-color.background-color-[name]`
   * - E.g. Text: `.text-color.text-color-[name]`
   * - https://we-make-websites.gitbook.io/canvas/features/styles/design-tokens#brand-colours
   * ---------------------------------------------------------------------------
   */

  /**
   * Set whether to compile brand colours.
   */
  brandColours: false,

  /**
    * Exclude colours from being compiled into brand colours (if enabled).
    * - If an item has a '-' suffix then it match all with that prefix.
    */
  brandExcludedColours: [
    'color-border-',
    'color-button-',
    'color-loading',
    'color-overlay',
    'color-support-',
  ],

  /**
   * ---------------------------------------------------------------------------
   * 7. Configure Storybook styleguide settings.
   * - Types must remain the same, e.g. colours can't be an array.
   * - '*' colour group contains all colours that don't belong in other groups.
   * ---------------------------------------------------------------------------
   */

  /**
   * Configuration for variables in styleguide.
   */
  styleguide: {
    animation: {
      easing: 'easing',
      timing: 'timing',
    },
    boxShadow: 'box-shadow',
    colourGroups: {
      Brand: 'brand',
      Misc: '*',
      Typography: 'text',
      Background: 'background',
      Border: 'border',
      Button: 'button',
      Support: 'support',
    },
    colours: 'color',
    grid: {
      Breakpoints: 'breakpoint',
      Columns: 'columns',
      Gutter: 'gutter',
      Margin: 'margin',
      'Max Content Width': 'max-content-width',
    },
    icon: 'icon',
    misc: {
      'Border radius': 'border-radius',
      'Border width': 'border-width',
      'Focus ring': 'focus-ring',
      'Font family': 'font-family',
      'Font size': 'font-size',
      'Font weight': 'font-weight',
      'Form elements': 'form',
      Header: 'header',
      Layer: 'layer',
      'Letter spacing': 'letter-spacing',
      'Line height': 'line-height',
    },
    spacing: {
      Spacing: 'spacing',
    },
    typography: 'typography',
    typographyExclude: [
      'html, body',
    ],
  },

  /**
   * ---------------------------------------------------------------------------
   * 8. Configure file settings
   * - You will rarely need to edit these.
   * ---------------------------------------------------------------------------
   */

  /**
   * Variables to create config scripts from.
   * - Each item must have a corresponding template at
   *   canvas/templates/design/[property].ejs
   */
  scripts: [
    {
      filename: 'breakpoints',
      name: 'Breakpoints',
      property: 'breakpoint',
    },
    {
      filename: 'timings',
      name: 'Timings',
      property: 'timing',
    },
  ],

  /**
   * Stylesheets to build.
   * - Include and exclude supports specific value targetting
   * - E.g. `typography.text-body-m`.
   */
  stylesheets: {
    classes: [
      {
        exclude: [],
        include: [],
        name: 'Critical',
        handle: 'classes-critical',
        path: Paths.styles.base,
      },
      {
        exclude: [],
        include: [],
        name: 'Mixins',
        handle: 'classes-mixins',
        path: Paths.styles.config,
      },
      {
        exclude: [],
        include: [],
        name: 'Default',
        handle: 'classes',
        path: Paths.styles.base,
      },
    ],
    variables: [
      {
        exclude: [],
        include: [],
        name: 'CSS',
        handle: 'variables-css',
        path: Paths.styles.config,
        type: 'css',
      },
      {
        exclude: [],
        include: [
          'breakpoint',
          'columns',
          'margin',
        ],
        name: 'SASS',
        handle: 'variables-sass',
        path: Paths.styles.config,
        type: 'sass',
      },
    ],
  },

  /**
   * ---------------------------------------------------------------------------
   * 9. Default configuration
   * - You shouldn't need to edit these settings.
   * ---------------------------------------------------------------------------
   */

  /**
   * Configure the breakpoints which represent mobile, tablet, and desktop.
   */
  breakpoint: {
    mobile: 'xs',
    tablet: 'm',
    desktop: 'l',
  },

  /**
   * String is prefixed to the start of a variable's CSS variable name.
   */
  cssPrefix: '--',

  /**
   * Defaults type.
   * - The object that defaults are search for in.
   */
  defaultsType: 'typography',

  /**
   * Delimiter used between words in variable names.
   */
  delimiter: '-',

  /**
   * Exclude property and value from classes.
   */
  excludedPropertyValues: [
    'text-transform: none',
  ],

  /**
   * Replace variable with value.
   * - When building class's CSS declarations it uses value instead of CSS
   *   variable, used for keyword CSS properties.
   * - E.g. text-decoration.none will not use var(--text-decoration-none) and
   *   will instead use its value, 'none'.
   * - Also excludes the variable from being added to variables stylesheet.
   */
  replaceVariableWithValue: [
    'text-decoration',
    'text-transform',
  ],

  /**
   * Special objects used to generate additional variables.
   * - baseScale used for rem conversion.
   * - breakpoint used to build SASS variable object for mq.
   * - Easing used to not wrap values in quotations.
   * - fontFamily loads description as font fallbacks.
   * - fontSize is replaced in html, body selector with baseScale variable, as
   *   the html, body selector must use the pixel value to set the base scale.
   * - fontWeight converts value to number based on fontWeights config object.
   * - htmlBody is the string used to style base elements.
   */
  special: {
    baseScale: 'scale.base',
    breakpoint: 'breakpoint',
    color: 'color',
    easing: 'easing',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    fontWeight: 'font-weight',
    htmlBody: 'html, body',
    lineHeight: 'line-height',
  },
}
