module.exports = {
  // @click events already trigger on keyboard input?
  'vuejs-accessibility/click-events-have-key-events': 'off',
  'vuejs-accessibility/label-has-for': [
    'error',
    {
      required: {
        some: ['nesting', 'id'],
      },
    },
  ],
}
