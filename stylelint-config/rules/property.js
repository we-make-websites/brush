module.exports = {
  // Require or disallow an empty line before custom properties
  'custom-property-empty-line-before': 'never',
  // Specify pattern of custom properties
  'custom-property-pattern': null,
  // Specify a list of allowed properties
  'property-allowed-list': null,
  // Specify a list of disallowed properties
  'property-disallowed-list': [],
  // Disallow unknown properties
  'property-no-unknown': true,
  // Disallow vendor prefixes for properties
  'property-no-vendor-prefix': [
    true, {
      ignoreProperties: ['appearance'],
    },
  ],
  // Disallow redundant values in shorthand properties
  'shorthand-property-no-redundant-values': true,
}
