# 📚 Canvas Component Tools Changelog

Canvas Component Tools uses [semantic versioning](https://semver.org/).

## 2.4.0 - 2024-03-??

* Updated to not error if empty component folder already exists
* Updated internal folder structure

## 2.3.0 - 2024-02-14

* Updated dependencies

## 2.2.0 - 2023-11-28

* Updated dependencies

## 2.1.0 - 2023-11-09

* Added 25 character limit to name question due to Shopify settings schema limit
* Updated error messaging

## 2.0.4 - 2023-11-08

* Fixed observed attributes not triggering watchers when updated externally

## 2.0.3 - 2023-11-07

* Fixed data issues with web component template

## 2.0.2 - 2023-11-01

* Fixed Node version issues by removing `engines` property

## 2.0.1 - 2023-10-31

* Fixed broken templates

## 2.0.0 - 2023-10-18

* Added web component support

## 1.9.0 - 2023-10-16

* Updated Node version
* Updated dependencies
* Removed `engineStrict` setting

## 1.8.0 - 2023-09-19

* Added tracking for logging commands and error analytics

## 1.7.0 - 2023-08-23

* Updated dependencies

## 1.6.0 - 2023-08-22

* Removed `aria-labelledby` attributes from default template `<section>` elements
* Removed `id` attributes from default template titles

## 1.5.0 - 2023-07-18

* Updated Liquid templates to include _.min_ extension

## 1.4.1 - 2023-07-03

* Fixed global limited interactivity template causing compile errors

## 1.4.0 - 2023-05-30

* Updated `disabled_on` property to be disabled on all section groups
* Fixed description not wrapping in Vue template causing eslint errors
* Fixed description not being formatted correctly
* Updated dependencies

## 1.3.0 - 2023-04-11

* Added `disabled_on` property to async schema files to disable in header and footer section groups by default

## 1.2.1 - 2023-03-01

* Fixed limited interactivity Vue template failing eslint

## 1.2.0 - 2023-03-01

* Updated limited interactivity template to include class in template

## 1.1.0 - 2023-01-31

* Added limited interactivity to template options
* Added documentation links to footer as choices are made
* Updated template titles to not use 404 title to avoid confusion
* Updated command to output version of the tool instead of Canvas
* Updated dependencies
* Removed `presets` array from global schema template
* Fixed path to `getCanvasConfig()` helper function

## 1.0.0 - 2022-11-03

* Initial release
