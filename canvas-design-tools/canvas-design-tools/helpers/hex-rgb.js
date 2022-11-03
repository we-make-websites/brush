/**
 * Helper: Hex -> rgb
 * -----------------------------------------------------------------------------
 * Converts hexadecimal values to rgba.
 * - Copied from https://github.com/sindresorhus/hex-rgb to remove ES Module
 *   requirements.
 * - Removed extra options as they're not required.
 *
 */
/* eslint-disable no-bitwise */
module.exports = (hex) => {
  const hexCharacters = 'a-f\\d'
  const match3or4Hex = `#?[${hexCharacters}]{3}[${hexCharacters}]?`
  const match6or8Hex = `#?[${hexCharacters}]{6}([${hexCharacters}]{2})?`
  const nonHexChars = new RegExp(`[^#${hexCharacters}]`, 'giu')
  const validHexSize = new RegExp(`^${match3or4Hex}$|^${match6or8Hex}$`, 'iu')

  if (typeof hex !== 'string' || nonHexChars.test(hex) || !validHexSize.test(hex)) {
    throw new TypeError('Expected a valid hex string')
  }

  let hexValue = ''
  hexValue = hex.replace(/^#/u, '')
  let alphaFromHex = 1

  if (hexValue.length === 8) {
    alphaFromHex = Number.parseInt(hexValue.slice(6, 8), 16) / 255
    hexValue = hexValue.slice(0, 6)
  }

  if (hexValue.length === 4) {
    alphaFromHex = Number.parseInt(hexValue.slice(3, 4).repeat(2), 16) / 255
    hexValue = hexValue.slice(0, 3)
  }

  if (hexValue.length === 3) {
    hexValue = hexValue[0] + hexValue[0] + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2]
  }

  const number = Number.parseInt(hexValue, 16)
  const red = number >> 16
  const green = (number >> 8) & 255
  const blue = number & 255

  if (alphaFromHex === 1) {
    return `rgb(${red}, ${green}, ${blue})`
  }

  return `rgba(${red}, ${green}, ${blue}, ${alphaFromHex.toFixed(2)})`
}
