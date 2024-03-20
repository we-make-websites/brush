# 🎨 Stylelint Config

We Make Website's stylelint rules and config.

This config supports up to stylelint 15.11.0.

## Installation

Run the command:

```
yarn add stylelint @we-make-websites/stylelint-config --dev
```

## Usage
We Make Website’s stylelint rules come bundled in `@we-make-websites/stylelint-config`.

To enable these rules add the following to your _.stylelintrc_ root file:

```js
extends: [
  '@we-make-websites/stylelint-config',
],
```

## Versions

* `4.#.#` - Stylelint 15
* `3.#.#` - Canvas projects
* `2.#.#` - Frame projects using stylelint 13 or older
* `1.#.#` - Do not use
