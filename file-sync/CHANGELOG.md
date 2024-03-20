# 🗃️ File Sync Changelog

File Sync uses [semantic versioning](https://semver.org/).

## 2.1.1 - 2023-03-??

* Fixed throwing an error when provided filepath doesn't exist

## 2.1.0 - 2023-11-28

* Updated dependencies

## 2.0.2 - 2023-11-20

* Fixed error when Webpack config is accessed through eslint

## 2.0.1 - 2023-11-15

* Fixed helper returning no files if `filter` isn't provided

## 2.0.0 - 2023-11-02

* Added `ignore` option to ignore filepaths
* Added `return` option to control returned data (filepath, filename, or parsed)
* Added `array` option to return data as an array or generator
* Updated `folderPaths` to support array of folder paths to find files in
* Replaced `filetypes` with `filter` option with support for full filename filtering
* Removed `filename` option (use `return: 'name'` instead)

## 1.2.1 - 2023-11-01

* Fixed Node version issues by removing `engines` property

## 1.2.0 - 2023-10-16

* Updated Node version
* Removed `engineStrict` setting

## 1.1.0 - 2023-05-24

* Updated `namesOnly` argument to be a `config` object

## 1.0.0 - 2023-05-11

* Initial release
