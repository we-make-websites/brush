/* eslint-disable max-len */

const atRule = {
  // Specify lowercase or uppercase for at-rules names
  '@stylistic/at-rule-name-case': 'lower',
  // Require a newline after at-rule names
  '@stylistic/at-rule-name-newline-after': 'always-multi-line',
  // Require a single space after at-rule names
  '@stylistic/at-rule-name-space-after': 'always-single-line',
  // Require a newline after the semicolon of at-rules
  '@stylistic/at-rule-semicolon-newline-after': 'always',
  // Disallow whitespace before the semicolons of at-rules
  '@stylistic/at-rule-semicolon-space-before': 'never',
}

const block = {
  // Require empty line before the closing brace of blocks
  '@stylistic/block-closing-brace-empty-line-before': 'never',
  // Require a newline or disallow whitespace after the closing brace of blocks
  '@stylistic/block-closing-brace-newline-after': 'always-single-line',
  // Require a newline or disallow whitespace before the closing brace of blocks
  '@stylistic/block-closing-brace-newline-before': 'always',
  // Require a single space or disallow whitespace after the closing brace of blocks
  '@stylistic/block-closing-brace-space-after': null,
  // Require a single space or disallow whitespace before the closing brace of blocks
  '@stylistic/block-closing-brace-space-before': 'always-single-line',
  // Require a newline after the opening brace of blocks
  '@stylistic/block-opening-brace-newline-after': 'always',
  // Require a newline or disallow whitespace before the opening brace of blocks
  '@stylistic/block-opening-brace-newline-before': 'always-single-line',
  // Require a single space or disallow whitespace after the opening brace of blocks
  '@stylistic/block-opening-brace-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the opening brace of blocks
  '@stylistic/block-opening-brace-space-before': 'always',
}

const declaration = {
  // Require a single space or disallow whitespace after the bang of declarations
  '@stylistic/declaration-bang-space-after': 'never',
  // Require a single space or disallow whitespace before the bang of declarations
  '@stylistic/declaration-bang-space-before': 'always',
  // Require a newline or disallow whitespace after the semicolons of declaration blocks
  '@stylistic/declaration-block-semicolon-newline-after': 'always',
  // Require a newline or disallow whitespace before the semicolons of declaration blocks
  '@stylistic/declaration-block-semicolon-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the semicolons of declaration blocks
  '@stylistic/declaration-block-semicolon-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the semicolons of declaration blocks
  '@stylistic/declaration-block-semicolon-space-before': 'never',
  // Require or disallow a trailing semicolon within declaration blocks
  '@stylistic/declaration-block-trailing-semicolon': 'always',
  // Require a newline or disallow whitespace after the colon of declarations
  '@stylistic/declaration-colon-newline-after': 'always-multi-line',
  // Require a single space or disallow whitespace after the colon of declarations
  '@stylistic/declaration-colon-space-after': 'always',
  // Require a single space or disallow whitespace before the colon of declarations
  '@stylistic/declaration-colon-space-before': 'never',
}

const functionRules = {
  // Require a newline or disallow whitespace after the commas of functions
  '@stylistic/function-comma-newline-after': 'never-multi-line',
  // Require a newline or disallow whitespace before the commas of functions
  '@stylistic/function-comma-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the commas of functions
  '@stylistic/function-comma-space-after': 'always',
  // Require a single space or disallow whitespace before the commas of functions
  '@stylistic/function-comma-space-before': 'never',
  // Limit the number of adjacent empty lines within functions
  '@stylistic/function-max-empty-lines': 0,
  // Require a newline or disallow whitespace on the inside of the parentheses of functions
  '@stylistic/function-parentheses-newline-inside': 'never-multi-line',
  // Require a single space or disallow whitespace on the inside of the parentheses of functions
  '@stylistic/function-parentheses-space-inside': 'never',
  // Require a single space or disallow whitespace after functions
  '@stylistic/function-whitespace-after': 'always',
}

const media = {
  // Require a single space or disallow whitespace after the colon in media features
  '@stylistic/media-feature-colon-space-after': 'always',
  // Require a single space or disallow whitespace before the colon in media features
  '@stylistic/media-feature-colon-space-before': 'never',
  // Specify lowercase or uppercase for media feature names
  '@stylistic/media-feature-name-case': 'lower',
  // Require a single space or disallow whitespace on the inside of the parentheses within media features
  '@stylistic/media-feature-parentheses-space-inside': 'never',
  // Require a single space or disallow whitespace after the range operator in media features
  '@stylistic/media-feature-range-operator-space-after': 'always',
  // Require a single space or disallow whitespace before the range operator in media features
  '@stylistic/media-feature-range-operator-space-before': 'always',
  // Require a newline or disallow whitespace after the commas of media query lists
  '@stylistic/media-query-list-comma-newline-after': 'always-multi-line',
  // Require a newline or disallow whitespace before the commas of media query lists
  '@stylistic/media-query-list-comma-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the commas of media query lists
  '@stylistic/media-query-list-comma-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the commas of media query lists
  '@stylistic/media-query-list-comma-space-before': 'never',
}

const selector = {
  // Require a single space or disallow whitespace on the inside of the brackets within attribute selectors
  '@stylistic/selector-attribute-brackets-space-inside': 'never',
  // Require a single space or disallow whitespace after operators within attribute selectors
  '@stylistic/selector-attribute-operator-space-after': 'never',
  // Require a single space or disallow whitespace before operators within attribute selectors
  '@stylistic/selector-attribute-operator-space-before': 'never',
  // Require a single space or disallow whitespace after the combinators of selectors
  '@stylistic/selector-combinator-space-after': 'always',
  // Require a single space or disallow whitespace before the combinators of selectors
  '@stylistic/selector-combinator-space-before': 'always',
  // Disallow non-space characters for descendant combinators of selectors
  '@stylistic/selector-descendant-combinator-no-non-space': true,
  // Limit the number of adjacent empty lines within selectors
  '@stylistic/selector-max-empty-lines': 0,
  //  Specify lowercase or uppercase for pseudo-class selectors
  '@stylistic/selector-pseudo-class-case': 'lower',
  // Require a single space or disallow whitespace on the inside of the parentheses within pseudo-class selectors
  '@stylistic/selector-pseudo-class-parentheses-space-inside': 'never',
  // Specify lowercase or uppercase for pseudo-element selectors
  '@stylistic/selector-pseudo-element-case': 'lower',
}

const selectorList = {
  // Require a newline or disallow whitespace after the commas of selector lists
  '@stylistic/selector-list-comma-newline-after': 'always-multi-line',
  // Require a newline or disallow whitespace before the commas of selector lists
  '@stylistic/selector-list-comma-newline-before': null,
  // Require a single space or disallow whitespace after the commas of selector lists
  '@stylistic/selector-list-comma-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the commas of selector lists
  '@stylistic/selector-list-comma-space-before': 'never',
}

const value = {
  // Require a newline or disallow whitespace after the commas of value lists
  '@stylistic/value-list-comma-newline-after': 'always-multi-line',
  // Require a newline or disallow whitespace before the commas of value lists
  '@stylistic/value-list-comma-newline-before': 'never-multi-line',
  // Require a single space or disallow whitespace after the commas of value lists
  '@stylistic/value-list-comma-space-after': 'always',
  // Require a single space or disallow whitespace before the commas of value lists
  '@stylistic/value-list-comma-space-before': 'never',
  // Limit the number of adjacent empty lines within value lists
  '@stylistic/value-list-max-empty-lines': 0,
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
  '@stylistic/color-hex-case': 'lower',
  // Specify indentation
  '@stylistic/indentation': 2,
  // Specify unix or windows linebreak
  '@stylistic/linebreaks': null,
  // Disallow more than a specified number of adjacent empty lines
  '@stylistic/max-empty-lines': 1,
  // Limit the length of a line
  '@stylistic/max-line-length': null,
  // Disallow empty first lines
  '@stylistic/no-empty-first-line': true,
  // Disallow end-of-line whitespace
  '@stylistic/no-eol-whitespace': true,
  // Disallow extra semicolons
  '@stylistic/no-extra-semicolons': true,
  // Disallow missing end-of-file newline
  '@stylistic/no-missing-end-of-source-newline': true,
  // Require or disallow a leading zero for fractional numbers less than 1
  '@stylistic/number-leading-zero': 'always',
  // Disallow trailing zeros within numbers
  '@stylistic/number-no-trailing-zeros': true,
  // Specify lowercase or uppercase for properties
  '@stylistic/property-case': 'lower',
  // Specify single or double quotes around strings
  '@stylistic/string-quotes': 'single',
  // Require or disallow the Unicode Byte Order Mark
  '@stylistic/unicode-bom': 'never',
  // Specify lowercase or uppercase for units
  '@stylistic/unit-case': 'lower',
}
