/**
 * Tannoy (tny)
 * -----------------------------------------------------------------------------
 * Handles BASIS and CANVAS console logging, replacing Ora and Chalk.
 *
 * - Reference:
 * - https://www.lihaoyi.com/post/BuildyourownCommandLinewithANSIescapecodes.html
 *
 */
/* eslint-disable default-case-last */
const consoleClear = require('console-clear')
const fs = require('fs')
const path = require('path')

/**
 * Set variables
 */
// eslint-disable-next-line no-console
const log = console.log
let spinnerState = false
let waitingForSpinner = false

/**
 * Printing messages
 * -----------------------------------------------------------------------------
 * Functions to output messages in terminal.
 *
 */

/**
 * Output message with options.
 * @param {Array|String} messages - Array of message lines.
 * @param {Boolean} after - Append newline after message.
 * @param {Boolean} before - Append newline before message.
 * @param {Boolean} empty - Clear terminal before printing message.
 * @param {Boolean} newline - Set to false to prevent moving cursor to newline,
 * overrides after when false.
 */
async function message(messages, {
  after = true,
  before = false,
  empty = false,
  newline = true,
} = {}) {
  if (process.env.DEBUG === 'true') {
    return
  }

  if (waitingForSpinner) {
    await waitForSpinner()
  }

  if (empty) {
    consoleClear()
  }

  if (!after && !before) {
    outputMessage(messages)
    return
  }

  const formattedMessage = Array.isArray(messages) ? messages : [messages]

  if (before) {
    formattedMessage.unshift('')
  }

  if (after && newline) {
    formattedMessage.push('')
  }

  outputMessage(formattedMessage, newline)
}

/**
 * Waits for spinner state message to be printed before printing.
 * @returns {Promise}
 */
function waitForSpinner() {
  return new Promise((resolve) => {
    if (!waitingForSpinner) {
      resolve()
    }

    const spinnerInterval = setInterval(() => {
      if (waitingForSpinner) {
        return
      }

      resolve()
      clearInterval(spinnerInterval)
    }, 100)
  })
}

/**
 * Output message.
 * @param {Array|String} messages - Array of message lines or single string.
 * @param {Boolean} newline - Set to false to prevent moving cursor to newline,
 * overrides after when false.
 * @returns {String}
 */
function outputMessage(messages, newline = true) {
  const basisPackagePath = path.resolve('node_modules', '@we-make-websites/basis/package.json')
  const docsPackagePath = path.resolve('node_modules', '@we-make-websites/basis-schema-docs/package.json')
  const canvasPackagePath = path.resolve('./', 'package.json')
  const libraryPackagePath = path.resolve('node_modules', '@we-make-websites/canvas-library-tools/package.json')
  const storybookPackagePath = path.resolve('node_modules', '@we-make-websites/canvas-storybook-tools/package.json')

  let basisPackage = false
  let docsPackage = false
  let canvasPackage = false
  let libraryPackage = false
  let storybookPackage = false

  if (fs.existsSync(basisPackagePath)) {
    basisPackage = require(basisPackagePath)
  }

  if (fs.existsSync(docsPackagePath)) {
    docsPackage = require(docsPackagePath)
  }

  if (fs.existsSync(canvasPackagePath)) {
    canvasPackage = require(canvasPackagePath)
  }

  if (fs.existsSync(libraryPackagePath)) {
    libraryPackage = require(libraryPackagePath)
  }

  if (fs.existsSync(storybookPackagePath)) {
    storybookPackage = require(storybookPackagePath)
  }

  const packages = {
    basisPackage,
    docsPackage,
    canvasPackage,
    libraryPackage,
    storybookPackage,
  }

  /**
   * Return message.
   */
  if (Array.isArray(messages)) {
    return messages.forEach((line, index) => {
      if (!newline && index === (messages.length - 1)) {
        process.stdout.write(replaceShortcodes(line, packages))
        return
      }

      log(replaceShortcodes(line, packages))
    })
  }

  if (!newline) {
    return process.stdout.write(replaceShortcodes(messages, packages))
  }

  return log(replaceShortcodes(messages, packages))
}

/**
 * Replace shortcodes.
 * @param {String} line - Message line.
 * @param {Object} packages - Package JSON files.
 * @return {String}
 */
function replaceShortcodes(line, packages) {
  if (!line || typeof line !== 'string') {
    return line
  }

  return line
    .replaceAll('{{basis version}}', packages.basisPackage.version)
    .replaceAll('{{docs version}}', packages.docsPackage.version)
    .replaceAll('{{canvas version}}', packages.canvasPackage.version)
    .replaceAll('{{library version}}', packages.libraryPackage.version)
    .replaceAll('{{storybook version}}', packages.storybookPackage.version)
}

/**
 * Moves cursor and clears based on settings.
 * - Defaults to clearing entire screen.
 * - Moves cursor before clearing.
 * @param {Object} clear - Clear instructions.
 * @param {String} clear.direction - Direction to clear in, accepts `all`,
 * `before`, or `after`.
 * @param {String} clear.type - Type of clear, accepts `screen` or `line`.
 * @param {Object} move - Move instructions.
 * @param {String} move.direction - Direction to move, accepts `up`, `down`,
 * `right`, or `left`.
 * @param {Number} move.lines - Number of lines to move.
 */
function clear({ clear: clearObject = false, move = false } = {}) {
  let clearDirectionCode = '2'
  let clearTypeCode = 'J'
  let moveCode = 'A'

  /**
   * \u001b[{n}{Direction} - Move {direction} {n} lines.
   */
  switch (move.direction) {
    case 'up':
    default:
      moveCode = 'A'
      break

    case 'down':
      moveCode = 'B'
      break

    case 'right':
      moveCode = 'C'
      break

    case 'left':
      moveCode = 'D'
      break
  }

  /**
   * \u001b[{Direction}{Type}.
   *
   * - Type = J - Clears screen.
   * - Direction = 0 Clears from cursor until end of screen,
   * - Direction = 1 Clears from cursor to beginning of screen.
   * - Direction = 2 Clears entire screen.
   *
   * - Type = K - Clears line.
   * - Direction = 0 Clears from cursor to end of line.
   * - Direction = 1 Clears from cursor to start of line.
   * - Direction = 2 Clears entire line.
   */
  switch (clearObject.direction) {
    case 'after':
      clearDirectionCode = '0'
      break

    case 'before':
      clearDirectionCode = '0'
      break

    case 'all':
    default:
      clearDirectionCode = '2'
      break
  }

  switch (clearObject.type) {
    case 'screen':
    default:
      clearTypeCode = 'J'
      break

    case 'line':
      clearTypeCode = 'K'
      break
  }

  const clearCommand = `\u001b[${clearDirectionCode}${clearTypeCode}`
  const moveCommand = `\u001b[${move.lines}${moveCode}`

  if (move) {
    process.stdout.write(moveCommand)
  }

  if (clearObject) {
    process.stdout.write(clearCommand)
  }
}

/**
 * Formatting messages
 * -----------------------------------------------------------------------------
 * Functions to format the message in the terminal
 * - Entries in colours object are organised by ANSI code.
 *
 */
const colours = {
  black: '\u001b[30m',
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  magenta: '\u001b[35m',
  cyan: '\u001b[36m',
  white: '\u001b[37m',
  brightBlack: '\u001b[30;1m',
  brightRed: '\u001b[31;1m',
  brightGreen: '\u001b[32;1m',
  brightYellow: '\u001b[33;1m',
  brightBlue: '\u001b[34;1m',
  brightMagenta: '\u001b[35;1m',
  brightCyan: '\u001b[36;1m',
  brightWhite: '\u001b[37;1m',
  bgBlack: '\u001b[40m\u001b[37m',
  bgRed: '\u001b[41m\u001b[30m',
  bgGreen: '\u001b[42m\u001b[30m',
  bgYellow: '\u001b[43m\u001b[30m',
  bgBlue: '\u001b[44m\u001b[30m',
  bgMagenta: '\u001b[45m\u001b[30m',
  bgCyan: '\u001b[46m\u001b[30m',
  bgWhite: '\u001b[47m\u001b[30m',
}

const reset = '\u001b[0m'

/**
 * Set colour of text and its background.
 * - Automatically pads line with spacing when background colour is set.
 * @param {String} colourCode - Colour or background colour.
 * @param {String} line - Message line.
 * @returns {String}
 */
function colour(colourCode, line) {
  return colourCode.includes('bg') && !process.env.BUDDY
    ? `${colours[colourCode]} ${line} ${reset}`
    : `${colours[colourCode]}${line}${reset}`
}

/**
 * Spinner.
 * -----------------------------------------------------------------------------
 * Functions for controlling the spinner.
 *
 */

/**
 * Start spinner.
 * @param {Object} data - Data object.
 * @param {Array} data.frames - Frames in animation.
 * @param {Number} data.interval - Time between frames in ms.
 * @param {String} data.message - Message line.
 * @param {Object} data.states - Messages to print on different states.
 */
async function spinnerStart({ frames, interval = 100, message: messageString, states }) {
  if (process.env.DEBUG === 'true') {
    return
  }

  if (process.env.BUDDY) {
    process.stdout.write(`${frames[0]} ${messageString}\n`)
  }

  let firstLoop = true
  const queue = frames
  spinnerState = 'spinning'

  for (const [index, frame] of queue.entries()) {
    if (spinnerState !== 'spinning') {
      if (
        !process.env.BUDDY ||
        (process.env.BUDDY && spinnerState !== 'success')
      ) {
        clear({
          clear: { direction: 'all', type: 'line' },
          move: { direction: 'up', lines: 1 },
        })

        outputMessage(states[spinnerState])
      }

      waitingForSpinner = false
      break
    }

    if (!process.env.BUDDY) {
      if (!firstLoop || index !== 0) {
        clear({
          clear: { direction: 'all', type: 'line' },
          move: { direction: 'up', lines: 1 },
        })
      }

      process.stdout.write(`${frame} ${messageString}\n`)
    }

    if (index === (queue.length - 1)) {
      firstLoop = false
      queue.push(...frames)
    }

    // eslint-disable-next-line no-await-in-loop
    await wait(interval)
  }
}

/**
 * Stop spinner.
 * @param {String} state - State message to display.
 */
function spinnerStop(state) {
  spinnerState = state
  waitingForSpinner = true
}

/**
 * Wait for certain period of time.
 * @param {Number} duration - Duration to wait in ms.
 * @returns {Promise}
 */
function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

/**
 * Time
 * -----------------------------------------------------------------------------
 * Time taken utility.
 *
 */

/**
 * Outputs time taken between two values.
 * @param {Number} start - Start time or time taken in ms.
 * @param {Number} end - End time.
 * @returns {String}
 */
function time(start, end) {
  let duration = end ? Math.floor(end - start) : start
  let unit = 'ms'

  /**
   * Convert to seconds if greater than 1000ms.
   */
  if (duration > 1000) {
    duration = (duration / 1000).toFixed(1)
    unit = 's'
  }

  /**
   * Calculate clock emoji to show.
   */
  const clock = getClock(duration, unit)

  /**
   * Return string.
   */
  return `${clock} Took ${duration}${unit}`
}

/**
 * Get correct clock emoji.
 * @param {Number} duration - Time in unit.
 * @param {String} unit - Time unit.
 * @returns {String}
 */
function getClock(duration, unit) {
  if (unit === 'ms') {
    return (duration / 1000).toFixed(1) > 0.4 ? '🕧' : '🕛'
  }

  /**
   * Use first digit of time as index of clocks array.
   * - If decimal is between 0.5 and 0.7 then show half past emojis.
   * - If decimal is 0.8 or greater than show next hour emoji.
   * - First item in array is false as first digit will never be zero as that
   *   would mean the unit is ms and use early return above.
   */
  const firstDigit = Math.floor(duration)
  const decimal = duration % 1

  if (firstDigit > 12 || (firstDigit === 12 && decimal >= 0.8)) {
    return '🕛'
  }

  const clocks = decimal >= 0.5 && decimal <= 0.7
    // eslint-disable-next-line
    ? [false, '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
    // eslint-disable-next-line
    : [false, '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛']

  const index = decimal >= 0.8 ? firstDigit + 1 : firstDigit

  return clocks[index]
}

/**
 * Export tannoy CLI.
 */
module.exports = {
  clear,
  colour,
  message,
  spinner: {
    start: spinnerStart,
    stop: spinnerStop,
  },
  time,
}
