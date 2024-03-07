/* eslint-disable max-len */

module.exports = {
  // Require or disallow a newline after the closing brace of @else statements
  'scss/at-else-closing-brace-newline-after': 'always-last-in-chain',
  // Require a single space or disallow whitespace after the closing brace of @else statements
  'scss/at-else-closing-brace-space-after': 'always-intermediate',
  // Require an empty line or disallow empty lines before @-else
  'scss/at-else-empty-line-before': 'never',
  // Disallow at-extends (@extend) with missing placeholders
  'scss/at-extend-no-missing-placeholder': true,
  // Specify a pattern for Sass/SCSS-like function names
  'scss/at-function-pattern': [
    '^[a-z][a-z0-9-]+$',
    {
      message: () => `Expected function name to be kebab-case`,
    },
  ],
  // Require or disallow a newline after the closing brace of @if statements
  'scss/at-if-closing-brace-newline-after': 'always-last-in-chain',
  // Require a single space or disallow whitespace after the closing brace of @if statements
  'scss/at-if-closing-brace-space-after': 'always-intermediate',
  // Specify list of disallowed file extensions for partial names in @import commands
  'scss/at-import-partial-extension-disallowed-list': ['scss'],
  // Specify list of allowed file extensions for partial names in @import commands
  'scss/at-import-partial-extension-allowed-list': null,
  // Disallow parentheses in argumentless @mixin calls
  'scss/at-mixin-argumentless-call-parentheses': 'never',
  // Specify a pattern for Sass/SCSS-like mixin names
  'scss/at-mixin-pattern': [
    '^[a-z][a-z0-9-]+$',
    {
      message: () => `Expected mixin name to be kebab-case`,
    },
  ],
  // Disable empty comments
  'scss/comment-no-empty': true,
  // Require a newline after the colon in $-variable declarations
  'scss/dollar-variable-colon-newline-after': null,
  // Require a single space or disallow whitespace after the colon in $-variable declarations
  'scss/dollar-variable-colon-space-after': 'always-single-line',
  // Require a single space or disallow whitespace before the colon in $-variable declarations
  'scss/dollar-variable-colon-space-before': 'never',
  // Enforce no empty lines before $variables
  'scss/dollar-variable-empty-line-before': 'never',
  // Disallow Sass variables that are used without interpolation with CSS features that use custom identifiers
  'scss/dollar-variable-no-missing-interpolation': true,
  // Specify a pattern for Sass-like variables
  'scss/dollar-variable-pattern': [
    '^[a-z][a-z0-9-]+$',
    {
      message: () => `Expected $variable name to be kebab-case`,
    },
  ],
  // Specify a pattern for %-placeholders
  'scss/percent-placeholder-pattern': null,
  // Require or disallow an empty line before //-comments
  'scss/double-slash-comment-empty-line-before': null,
  // Require or disallow //-comments to be inline comments
  'scss/double-slash-comment-inline': 'never',
  // Require or disallow whitespace after the // in //-comment
  'scss/double-slash-comment-whitespace-inside': 'always',
  // Require or disallow properties with - in their names to be in a form of a nested group
  'scss/declaration-nested-properties': 'never',
  // Disallow nested properties of the same "namespace" be divided into multiple groups
  'scss/declaration-nested-properties-no-divided-groups': true,
  // Disallow leading underscore in partial names in @import
  'scss/load-no-partial-leading-underscore': true,
  // Require a media feature value be a $-variable or disallow $-variables in media feature values
  'scss/media-feature-value-dollar-variable': null,
  // Disallow dollar variables within a stylesheet
  'scss/no-dollar-variables': null,
  // Disallow duplicate dollar variables within a stylesheet
  'scss/no-duplicate-dollar-variables': null,
  // Disallow linebreaks after Sass operators
  'scss/operator-no-newline-after': true,
  // Disallow linebreaks before Sass operators
  'scss/operator-no-newline-before': true,
  // Disallow unspaced operators in Sass operations
  'scss/operator-no-unspaced': true,
  // Disallow non-CSS `@imports` in partial files
  'scss/partial-no-import': true,
  // Disallow redundant nesting selectors (`&`)
  'scss/selector-no-redundant-nesting-selector': true,
}
