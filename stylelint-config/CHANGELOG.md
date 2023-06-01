# 📅 Stylelint Config Changelog

## 4.1.0 - 2023-06-01

* Added `overflow: scroll` to disallowed property values list
* Updated dependencies

## 4.0.0 - 2023-05-02

* Added `stylelint-stylistic` to keep soon to be removed stylistic rules
* Added `stylelint-config-standard` and `stylelint-config-standard-scss` rulesets
* Added name patterns for classes, mixins, functions, and keyframes
* Updated rules so they're split between less separate files
* Updated disallowed properties list
* Updated declaration order to not autofix (properties will still be alphabetised)
* Updated declaration order
* Updated dependencies
* Fixed weird newline interaction between CSS and SASS variables
* Removed Shopify rule overrides

## 3.5.0 - 2022-11-14

* Added custom error messages to 'disallowed' rules
* Added `stylelint` to `peerDependencies`

## 3.4.0 - 2022-09-29

* Updated order rule to place `@each` query after media queries

## 3.3.0 - 2022-09-29

* Updated order rule to place `@supports` query before media queries
* Updated dependencies

## 3.2.0 - 2022-07-14

* Updated dependencies

## 3.1.0 - 2022-01-25

* Updated dependencies

## 3.0.1 - 2021-10-26

* Added `postcss-scss` and set stylelint to validate SCSS files

## 3.0.0 - 2021-10-25

* Updated stylelint to version 14
* Updated dependencies

## 2.0.3 - 2021-08-10

* Allowed unknown animations
* Never pushed to npm

## 2.0.2 - 2021-08-10

* Allowed data in URLs for CSS inline SVGs

## 2.0.1 - 2021-07-28

* Updated empty line before comment rule so first comment in declaration must have newline before it

## 2.0.0 - 2021-07-26

* Updated dependencies
* Updated rules to remove blacklist and whitelist references
* Updated project linting

## 1.0.4 - 2021-07-13

* Added use to supported @ variables

## 1.0.3 - 2020-04-25

* No visible changes

## 1.0.2 - 2019-03-12

* Continuing work on selector-class-pattern rule

## 1.0.1 - 2019-03-12

* Working on selector-class-pattern rule

## 1.0.0 - 2019-03-06

* Initial release forked from Shopify with WMW rules
