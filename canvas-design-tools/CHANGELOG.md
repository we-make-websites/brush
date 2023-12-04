# 📅 Canvas Design Tools Changelog

Canvas Design Tools uses [semantic versioning](https://semver.org/).

## 2.6.0 - 2023-12-??

* Added support for the `sassColorVariables` config setting

## 2.5.0 - 2023-11-28

* Updated styles template
* Updated dependencies

## 2.4.1 - 2023-11-01

* Fixed Node version issues by removing `engines` property

## 2.4.0 - 2023-10-16

* Updated Node version
* Updated dependencies
* Removed `engineStrict` setting

## 2.3.0 - 2023-09-19

* Added tracking for logging commands and error analytics

## 2.2.0 - 2023-08-23

* Updated dependencies

## 2.1.2 - 2023-06-26

* Fixed ordinals not being updated to the correct naming convention

## 2.1.1 - 2023-05-03

* Fixed alpha channel formatting in `rgb()`

## 2.1.0 - 2023-05-02

* Added responsive layout variables to grid page
* Updated styleguide styles to follow new stylelint rules
* Updated design tokens conversion to use `rgb(R G B / A%)` notation
* Updated dependencies

## 2.0.0 - 2023-04-11

* Added `-hover` text classes
* Updated to support new design tokens
* Updated forms styleguide template

## 1.4.0 - 2023-02-28

* Added support for utility stylesheets
* Added `--no-js` and `--no-storybook` flags

## 1.3.1 - 2023-02-01

* Fixed Storybook text styles being affected by tokens
* Fixed `include` array setting in critical stylesheet overriding default text classes

## 1.3.0 - 2023-01-31

* Updated command to output version of the tool instead of Canvas
* Updated dependencies
* Fixed token names starting with numbers causing issues in breakpoints and mq-breakpoints templates

## 1.2.0 - 2022-11-17

* Added support for all previous project locations of _design.config.js_
* Updated so that typography classes are sorted based on `sorting` config
* Fixed default config not supporting paragraph indent tokens
* Fixed design config trying to use Basis paths helper

## 1.1.0 - 2022-11-16

* Added support for default styles using the same class
* Updated defaults config to use class names to match instead of descriptions
* Updated to automatically add `line-height.baseline` token if missing

## 1.0.0 - 2022-11-03

* Initial release
