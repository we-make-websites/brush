module.exports = {
  // Specify lowercase or uppercase for hex colors
  'color-hex-case': 'lower',
  // Specify short or long notation for hex colors
  'color-hex-length': 'short',
  // Require (where possible) or disallow named colors
  'color-named': 'never',
  // Disallow hex colors
  'color-no-hex': [
    true, {
      message: 'Do not use hexadecimal values, instead use "rgb" or "rgba"',
    },
  ],
  // Disallow invalid hex colors
  'color-no-invalid-hex': true,
}
