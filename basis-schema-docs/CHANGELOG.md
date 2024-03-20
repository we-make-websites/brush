# 📅 Basis Schema Docs Changelog

Basis Schema Docs uses [semantic versioning](https://semver.org/).

## 1.12.0 - 2024-03-??

* Updated internal folder structure

## 1.11.0 - 2024-02-14

* Updated dependencies

## 1.10.0 - 2023-11-28

* Updated dependencies

## 1.9.1 - 2023-11-01

* Fixed Node version issues by removing `engines` property

## 1.9.0 - 2023-10-16

* Updated Node version
* Updated dependencies
* Removed `engineStrict` property

## 1.8.0 - 2023-09-19

* Added tracking for logging commands and error analytics

## 1.7.0 - 2023-08-23

* Updated dependencies

## 1.6.1 - 2023-07-24

* Fixed `select` type setting causing errors

## 1.6.0 - 2023-06-06

* Updated boolean and number setting values to be wrapped in inline code tags
* Updated dependencies

## 1.5.1 - 2023-05-30

* Fixed markdown file not being generated for sections with `disabled_on`/`enabled_on` setting but no section settings

## 1.5.0 - 2023-05-22

* Added support for `disabled_on`/`enabled_on` section settings
* Updated dependencies
* Fixed heading settings template not nesting correctly

## 1.4.0 - 2023-05-18

* Replaced _get-files-in-folder.js_ helper with `@we-make-websites/file-sync`

## 1.3.0 - 2023-04-11

* Added support for _settings_schema.js_ schema file
* Fixed `<%= setting %>` being outputted for `paragraph` type setting objects

## 1.2.1 - 2023-03-01

* Removed escape characters from output

## 1.2.0 - 2022-10-03

* Updated dependencies

## 1.1.0 - 2022-08-04

* Expanded shortcode support
* Updated base templates
* Changed `--style` flag to `--template`
* Fixed maxBlocks shortcode not being removed if `max_blocks` is not set

## 1.0.0 - 2022-08-03

* Initial release
