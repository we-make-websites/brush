const message = (rule) => {
  switch (rule) {
    case 'background':
    case 'font':
      return 'Do not use shorthand properties'
    case 'margin-bottom':
    case 'padding-bottom':
      return `Do not use "${rule}", instead use "${rule.split('-')[0]}-block-end"`
    case 'margin-left':
    case 'padding-left':
      return `Do not use "${rule}", instead use "${rule.split('-')[0]}-inline-start"`
    case 'margin-right':
    case 'padding-right':
      return `Do not use "${rule}", instead use "${rule.split('-')[0]}-inline-end"`
    case 'margin-top':
    case 'padding-top':
      return `Do not use "${rule}", instead use "${rule.split('-')[0]}-block-start"`
  }

  return 'Error'
}

module.exports = {
  // Require or disallow an empty line before custom properties
  'custom-property-empty-line-before': 'never',
  // Specify pattern of custom properties
  'custom-property-pattern': null,
  // Specify a list of allowed properties
  'property-allowed-list': null,
  // Specify a list of disallowed properties
  'property-disallowed-list': [
    [
      'background',
      'font',
      '/^(margin|padding)-(bottom|left|right|top)$/',
    ],
    { message },
  ],
  // Disallow unknown properties
  'property-no-unknown': true,
  // Disallow vendor prefixes for properties
  'property-no-vendor-prefix': [
    true,
    {
      ignoreProperties: ['appearance'],
    },
  ],
  // Disallow redundant values in shorthand properties
  'shorthand-property-no-redundant-values': true,
}
