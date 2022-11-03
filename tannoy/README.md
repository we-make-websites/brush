# 📢 Tannoy (Tny)

Simple terminal message outputting tool.

## 🖨 Printing messages

### `Tny.message(message, options)`

Prints a message to the terminal.

`{Array|String} message` - Message to output, each item in the array is printed on a newline.

#### `options`

* `{Boolean} after` - Add empty newline after message, defaults to `true`
* `{Boolean} before` - Add empty newline before message, defaults to `false`
* `{Boolean} empty` - Clear terminal, defaults to `false`
* `{Boolean} newline` - Set to `false` to prevent moving cursor to newline, overrides `after` when `false`

### Shortcodes

These are tags which are dynamically replaced when generating the terminal message.

* `{{basis version}}` - Replaced with current Basis version in its _package.json_
* `{{canvas version}}` - Replaced with current Canvas version in its _package.json_
* `{{library version}}` - Replaced with current Canvas Library Tools version in its _package.json_
* `{{storybook version}}` - Replaced with current Canvas Storybook Tools version in its _package.json_

### `Tny.clear({ clear, move })`

Moves the cursor and clears the terminal.

#### `clear`

 * `{String} clear.direction` - Direction to clear in, accepts `all`, `before`, or `after`.
 * `{String} clear.type` - Type of clear, accepts `screen` or `line`.

#### `move`

 * `{String} move.direction` - Direction to move, accepts `up`, `down`, `right`, or `left`.
 * `{Number} move.lines` - Number of lines to move.

## 🎨 Formatting messages

### `Tny.colour(colour, string)`

Returns provided `string` with selected colour based on value of `colour`. Does not output the `string`, you must use `message()` or `add()` for this.

`colour` supports the following strings as values:

| Text | Text (bright) | Background |
| --- | --- | --- |
| black | brightBlack | bgBlack |
| red | brightRed | bgRed |
| green | brightGreen | bgGreen |
| yellow | brightYellow | bgYellow |
| blue | brightBlue | bgBlue |
| magenta | brightMagenta | bgMagenta |
| cyan | brightCyan | bgCyan |
| white | brightWhite | bgWhite |

> **Note:** When using background colour values the text colour is automatically set to the most contrasting (usually black).

## ⏳ Loading spinner

### `Tny.spinner.start(options)`

Starts a spinner that shows each frame with a message.

#### `options`

* `{Array} frames` - Each item in array is used as a frame in the animation
* `{Number} interval` - Time in ms between each frame, defaults to `100`
* `{String} message` - Message to display after animation frame
* `{Object} states` - Contains the messages for various states which are accessed by the value of `state` in `Tny.spinner.stop(state)`

### `Tny.spinner.stop(state)`

Stops the spinner and replaces it with the message defined in `states` using `state` as the key to find it.

E.g. if `states` contained values for `success` and `error` then using `Tny.spinner.stop('success')` would display the `success` message.

## 🕑 Time

### `Tny.time(start, end)`

Returns time taken with appropriate clock emoji where `start` is start time (or time taken in ms) and `end` is end time, both times should be ms from unix epoch.

###

## 📅 Changelog

See *CHANGELOG.md* for a history of changes.

## 🤝 Contribution

Before making any updates to Tannoy please talk to Craig Baldwin (craig@wemakewebsites.com)

Once any work is completed send a pull request to Craig for review.
