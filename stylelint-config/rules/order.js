/* eslint-disable max-len */

module.exports = {
  // https://github.com/hudochenkov/stylelint-order/tree/master/rules/order
  'order/order': [
    [
      'at-rules',
      { type: 'at-rule', name: 'import' },
      { type: 'at-rule', name: 'extend' },
      'custom-properties',
      'dollar-variables',
      'declarations',
      { type: 'at-rule', name: 'media' },
      { type: 'at-rule', name: 'supports' },
      { type: 'at-rule', name: 'each' },
      { type: 'at-rule', name: 'include', parameter: 'has-hover' },
      { type: 'at-rule', name: 'include', parameter: 'mq' },
    ],
    { unspecified: 'ignore' },
  ],
  // https://github.com/hudochenkov/stylelint-order/tree/master/rules/properties-order
  'order/properties-order': null,
  // https://github.com/hudochenkov/stylelint-order/tree/master/rules/properties-alphabetical-order
  'order/properties-alphabetical-order': true,
}
