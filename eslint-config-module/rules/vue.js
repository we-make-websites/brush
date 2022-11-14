module.exports = {
  // v-html is useful
  'vue/no-v-html': 'off',
  'vue/block-lang': [
    'error', {
      script: {
        allowNoLang: true,
      },
    },
  ],
  'vue/block-tag-newline': [
    'error', {
      maxEmptyLines: 1,
      multiline: 'consistent',
      singleline: 'consistent',
    },
  ],
  'vue/component-name-in-template-casing': [
    'error', 'kebab-case', {
      registeredComponentsOnly: true,
    },
  ],
  'vue/component-options-name-casing': ['error', 'PascalCase'],
  'vue/custom-event-name-casing': ['error', 'kebab-case'],
  // Caused issues in Basis?
  'vue/define-macros-order': 'off',
  'vue/html-button-has-type': 'error',
  'vue/html-comment-content-newline': [
    'error', {
      multiline: 'always',
      singleline: 'never',
    },
  ],
  'vue/html-comment-content-spacing': ['error', 'always'],
  'vue/html-comment-indent': ['error', 2],
  'vue/match-component-file-name': [
    'error', {
      extensions: ['vue'],
    },
  ],
  'vue/match-component-import-name': 'error',
  // Want props to be next to each other
  'vue/new-line-between-multi-line-property': 'off',
  'vue/next-tick-style': ['error', 'promise'],
  'vue/no-bare-strings-in-template': 'error',
  // Boolean can be whatever
  'vue/no-boolean-default': 'off',
  'vue/no-duplicate-attr-inheritance': 'error',
  'vue/no-empty-component-block': 'error',
  'vue/no-multiple-objects-in-class': 'error',
  'vue/no-potential-component-option-typo': 'warn',
  // Use whatever block names
  'vue/no-restricted-block': 'off',
  'vue/no-restricted-call-after-await': 'error',
  'vue/no-restricted-class': ['warn', 'is-active', 'is-hidden', 'is-disabled', 'is-visible', 'is-loading'],
  // No restrictions
  'vue/no-restricted-component-options': 'off',
  'vue/no-restricted-custom-event': 'off',
  'vue/no-restricted-html-elements': [
    'warn',
    {
      element: 'img',
      message: 'Use <art-direction> or <responsive-image> components',
    },
    {
      element: 'marquee',
      message: 'Seriously?',
    },
  ],
  'vue/no-restricted-props': 'off',
  'vue/no-restricted-static-attribute': 'off',
  'vue/no-restricted-v-bind': 'off',
  'vue/no-static-inline-styles': 'error',
  'vue/no-template-target-blank': 'error',
  'vue/no-this-in-before-route-enter': 'error',
  // Cannot check globally registered components
  'vue/no-undef-components': 'off',
  // Doesn't work with Vuex
  'vue/no-undef-properties': 'off',
  'vue/no-unsupported-features': [
    'error', {
      version: '^3.2.0',
    },
  ],
  'vue/no-unused-properties': 'error',
  'vue/no-unused-refs': 'error',
  'vue/no-useless-mustaches': 'error',
  'vue/no-useless-v-bind': 'error',
  // v-text is useful
  'vue/no-v-text': 'off',
  // Useful with <component is>
  'vue/no-v-text-v-html-on-component': 'off',
  'vue/padding-line-between-blocks': ['error', 'always'],
  'vue/prefer-prop-type-boolean-first': 'error',
  'vue/prefer-separate-static-class': 'error',
  'vue/prefer-true-attribute-shorthand': 'error',
  'vue/require-direct-export': 'error',
  'vue/require-emit-validator': 'warn',
  // Excess busywork
  'vue/require-expose': 'off',
  'vue/require-name-property': 'error',
  'vue/script-indent': [
    'error', 2, {
      baseIndent: 0,
      switchCase: 1,
    },
  ],
  // Interferes with section schemas
  'vue/sort-keys': 'off',
  // Classes can be in any order
  'vue/static-class-names-order': 'off',
  'vue/v-for-delimiter-style': ['error', 'of'],
  'vue/v-on-function-call': ['error', 'never'],
}
