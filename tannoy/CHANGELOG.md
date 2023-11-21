# 📅 Tannoy Changelog

Tannoy uses [semantic versioning](https://semver.org/).

## 1.14.1 - 2023-11-01

* Fixed Node version issues by removing `engines` property

## 1.14.0 - 2023-10-16

* Updated Node version
* Removed `engineStrict` setting

## 1.13.0 - 2023-05-18

* Added `Tny.write()` function
* Updated documentation
* Removed support for `{{library version}}` shortcode

## 1.12.0 - 2022-10-03

* Updated dependencies

## 1.11.2 - 2022-08-15

* Fixed time returning in ms when it should be in seconds

## 1.11.1 - 2022-08-15

* Fixed time returning in ms when it should be in seconds

## 1.11.0 - 2022-08-03

* Linted all files to pass new eslint rules
* Added support for Basis Schema Docs package JSON version
* Updated dependencies

## 1.10.0 - 2022-07-06

* Updated spinner to use `Tny.clear()` function
* Updated spinner to add a newline in case process errors whilst spinning

## 1.9.0 - 2022-07-05

* Added debug variable to prevent outputting messages

## 1.8.0 - 2022-06-20

* Updated dependencies

## 1.7.0 - 2022-05-26

* Added support for Canvas Library Tools package JSON version

## 1.6.0 - 2022-05-26

* Updated output message to use new Canvas Storybook dependency
* Fixed `Tny.clear()` documentation

## 1.5.0 - 2022-05-23

* Added `Tny.clear()` function
* Refactored to use functions instead of `const`
* Fixed `after` config being ignored when outputting array of messages

## 1.4.0 - 2022-05-23

* Added `newline` config option to `Tny.message()` function
* Added linting checks
* Moved _index.js_ into _tannoy/index.js_

## 1.3.0 - 2022-03-28

* Replaced library version shortcode with storybook shortcode

## 1.2.0 - 2022-03-23

* Added `Tny.time()` function to output time taken
* Added library version shortcode support
* Updated readme

## 1.1.3 - 2022-03-23

* Fixed messaging output in Buddy pipeline

## 1.1.2 - 2022-02-07

* Fixed shortcode function causing errors when provided an object

## 1.1.1 - 2022-02-07

* Fixed shortcode function causing errors when provided an empty string

## 1.1.0 - 2022-02-07

* Combined `Tny.message()` and `Tny.add()` functions into `Tny.message()` with additional options

## 1.0.1 - 2022-02-03

* Fixed `Tny.message()` not outputting when no spinner is defined

## 1.0.0 - 2022-02-03

* Initial release
