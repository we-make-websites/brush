/* eslint-disable max-len */

/**
 * Prepend all these rules with `stylistic/` when Stylelint 16 comes out.
 * - Previously with Stylelint 15.10.2 and stylistic 0.4.2 all linting was
 *   broken, check if fixed before upgrading.
 */

const atRule = {
  // Specify lowercase or uppercase for at-rules names
  'at-rule-name-case': 'lower',
  // Require a newline after at-rule names
  'at-rule-name-newline-after': 'always-multi-line',
  // Require a single space after at-rule names
  'at-rule-name-space-after': 'always-single-line',
  // Require a newline after the semicolon of at-rules
  'at-rule-semicolon-newline-after': 'always',
  // Disallow whitespace before the semicolons of at-rules
  'at-rule-semicolon-space-before': 'never',
}

const block = {
  // Require empty line before the closing brace of blocks
  'block-closing-brace-empty-line-before': 'never',
  // Require a newline or disallow whitespace after the closing brace of blocks
  'block-closing-brace-newline-after': 'always-single-line',
  // Require a newline or disallow whitespace before the closing brace of blocks
  'block-closing-brace-newline-before': 'always',
  // Require a single space or disallow whitespace after the closing brace of blocks
  'block-closing-brace-space-after': null,
  // Require a single space or disallow whitespace before the closing brace of blocks
  'block-closing-brace-space-before': 'always-single-line',
  // Require a newline after the opening brace of blocks
  'block-opening-brace-newline-after': 'always',
  // Require a newline or disallow whitespace before the opening brace of blocks
  'block-opening-brace-newline-before': 'always-single-line',
  // Require a single space or disallow whitespace after the opening brace of blocks
  'block-opening-brace-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the opening brace of blocks
  'block-opening-brace-space-before': 'always',
}

const declaration = {
  // Require a single space or disallow whitespace after the bang of declarations
  'declaration-bang-space-after': 'never',
  // Require a single space or disallow whitespace before the bang of declarations
  'declaration-bang-space-before': 'always',
  // Require a newline or disallow whitespace after the semicolons of declaration blocks
  'declaration-block-semicolon-newline-after': 'always',
  // Require a newline or disallow whitespace before the semicolons of declaration blocks
  'declaration-block-semicolon-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the semicolons of declaration blocks
  'declaration-block-semicolon-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the semicolons of declaration blocks
  'declaration-block-semicolon-space-before': 'never',
  // Require or disallow a trailing semicolon within declaration blocks
  'declaration-block-trailing-semicolon': 'always',
  // Require a newline or disallow whitespace after the colon of declarations
  'declaration-colon-newline-after': 'always-multi-line',
  // Require a single space or disallow whitespace after the colon of declarations
  'declaration-colon-space-after': 'always',
  // Require a single space or disallow whitespace before the colon of declarations
  'declaration-colon-space-before': 'never',
}

const functionRules = {
  // Require a newline or disallow whitespace after the commas of functions
  'function-comma-newline-after': 'never-multi-line',
  // Require a newline or disallow whitespace before the commas of functions
  'function-comma-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the commas of functions
  'function-comma-space-after': 'always',
  // Require a single space or disallow whitespace before the commas of functions
  'function-comma-space-before': 'never',
  // Require a newline or disallow whitespace on the inside of the parentheses of functions
  'function-parentheses-newline-inside': 'never-multi-line',
  // Require a single space or disallow whitespace on the inside of the parentheses of functions
  'function-parentheses-space-inside': 'never',
  // Require a single space or disallow whitespace after functions
  'function-whitespace-after': 'always',
}

const media = {
  // Require a single space or disallow whitespace after the colon in media features
  'media-feature-colon-space-after': 'always',
  // Require a single space or disallow whitespace before the colon in media features
  'media-feature-colon-space-before': 'never',
  // Specify lowercase or uppercase for media feature names
  'media-feature-name-case': 'lower',
  // Require a single space or disallow whitespace on the inside of the parentheses within media features
  'media-feature-parentheses-space-inside': 'never',
  // Require a single space or disallow whitespace after the range operator in media features
  'media-feature-range-operator-space-after': 'always',
  // Require a single space or disallow whitespace before the range operator in media features
  'media-feature-range-operator-space-before': 'always',
  // Require a newline or disallow whitespace after the commas of media query lists
  'media-query-list-comma-newline-after': 'always-multi-line',
  // Require a newline or disallow whitespace before the commas of media query lists
  'media-query-list-comma-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the commas of media query lists
  'media-query-list-comma-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the commas of media query lists
  'media-query-list-comma-space-before': 'never',
}

const selector = {
  // Require a single space or disallow whitespace on the inside of the brackets within attribute selectors
  'selector-attribute-brackets-space-inside': 'never',
  // Require a single space or disallow whitespace after operators within attribute selectors
  'selector-attribute-operator-space-after': 'never',
  // Require a single space or disallow whitespace before operators within attribute selectors
  'selector-attribute-operator-space-before': 'never',
  // Require a single space or disallow whitespace after the combinators of selectors
  'selector-combinator-space-after': 'always',
  // Require a single space or disallow whitespace before the combinators of selectors
  'selector-combinator-space-before': 'always',
  // Disallow non-space characters for descendant combinators of selectors
  'selector-descendant-combinator-no-non-space': true,
  // Limit the number of adjacent empty lines within selectors
  'selector-max-empty-lines': 0,
  //  Specify lowercase or uppercase for pseudo-class selectors
  'selector-pseudo-class-case': 'lower',
  // Require a single space or disallow whitespace on the inside of the parentheses within pseudo-class selectors
  'selector-pseudo-class-parentheses-space-inside': 'never',
  // Specify lowercase or uppercase for pseudo-element selectors
  'selector-pseudo-element-case': 'lower',
}

const selectorList = {
  // Require a newline or disallow whitespace after the commas of selector lists
  'selector-list-comma-newline-after': 'always-multi-line',
  // Require a newline or disallow whitespace before the commas of selector lists
  'selector-list-comma-newline-before': null,
  // Require a single space or disallow whitespace after the commas of selector lists
  'selector-list-comma-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the commas of selector lists
  'selector-list-comma-space-before': 'never',
}

const value = {
  // Require a newline or disallow whitespace after the commas of value lists
  'value-list-comma-newline-after': 'always-multi-line',
  // Require a newline or disallow whitespace before the commas of value lists
  'value-list-comma-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the commas of value lists
  'value-list-comma-space-after': 'always',
  // Require a single space or disallow whitespace before the commas of value lists
  'value-list-comma-space-before': 'never',
  // Limit the number of adjacent empty lines within value lists
  'value-list-max-empty-lines': 0,
}

module.exports = {
  ...atRule,
  ...block,
  ...declaration,
  ...functionRules,
  ...media,
  ...selector,
  ...selectorList,
  ...value,
  // Specify lowercase or uppercase for hex colors
  'color-hex-case': 'lower',
  // Specify indentation
  indentation: 2,
  // Specify unix or windows linebreak
  linebreaks: null,
  // Disallow more than a specified number of adjacent empty lines
  'max-empty-lines': 1,
  // Limit the length of a line
  'max-line-length': null,
  // Disallow empty first lines
  'no-empty-first-line': true,
  // Disallow end-of-line whitespace
  'no-eol-whitespace': true,
  // Disallow extra semicolons
  'no-extra-semicolons': true,
  // Disallow missing end-of-file newline
  'no-missing-end-of-source-newline': true,
  // Require or disallow a leading zero for fractional numbers less than 1
  'number-leading-zero': 'always',
  // Disallow trailing zeros within numbers
  'number-no-trailing-zeros': true,
  // Specify lowercase or uppercase for properties
  'property-case': 'lower',
  // Specify single or double quotes around strings
  'string-quotes': 'single',
  // Require or disallow the Unicode Byte Order Mark
  'unicode-bom': 'never',
  // Specify lowercase or uppercase for units
  'unit-case': 'lower',
}
