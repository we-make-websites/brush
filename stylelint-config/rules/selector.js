/* eslint-disable max-len */

module.exports = {
  // Specify a list of disallowed attribute operators.
  'selector-attribute-operator-disallowed-list': null,
  // Specify a list of allowed attribute operators
  'selector-attribute-operator-allowed-list': null,
  // Require or disallow quotes for attribute values
  'selector-attribute-quotes': 'never',
  // Specify a pattern for class selectors
  'selector-class-pattern': [
    '^([a-z][a-z0-9]*)([-_]{1,2}[a-z0-9]+)*$',
    {
      message: (selector) => `Expected class selector "${selector}" to follow BEM naming`,
    },
  ],
  // Specify a pattern for id selectors
  'selector-id-pattern': null,
  // Limit the number of attribute selectors in a selector
  'selector-max-attribute': null,
  // Limit the number of classes in a selector
  'selector-max-class': null,
  // Limit the number of combinators in a selector
  'selector-max-combinators': null,
  // Limit the number of id selectors in a selector
  'selector-max-id': 0,
  // Limit the number of type in a selector
  'selector-max-type': null,
  // Limit the number of universal selectors in a selector
  'selector-max-universal': 2,
  // Limit the number of compound selectors in a selector
  'selector-max-compound-selectors': 3,
  // Limit the specificity of selectors
  'selector-max-specificity': null,
  // Specify a pattern for the selectors of rules nested within rules
  'selector-nested-pattern': null,
  // Disallow qualifying a selector by type
  'selector-no-qualifying-type': null,
  // Disallow vendor prefixes for selectors
  'selector-no-vendor-prefix': true,
  // Specify a list of disallowed pseudo-class selectors
  'selector-pseudo-class-disallowed-list': null,
  // Disallow unknown pseudo-class selectors
  'selector-pseudo-class-no-unknown': true,
  // Specify a list of allowed pseudo-class selectors
  'selector-pseudo-class-allowed-list': null,
  // Specify single or double colon notation for applicable pseudo-elements
  'selector-pseudo-element-colon-notation': 'double',
  // Disallow unknown pseudo-element selectors
  'selector-pseudo-element-no-unknown': true,
  // Specify lowercase or uppercase for type selector
  'selector-type-case': 'lower',
  // Disallow unknown type selectors
  'selector-type-no-unknown': true,
}
