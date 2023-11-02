# 🗃️ File Sync

Node helper function to find all filepaths inside folders and their sub-folders. Supports filtering and ignoring files and multiple returned data formats.

## 👩‍💻 Usage

`fileSync(folderPaths, options)`

* `folderPaths` - Array/String - Paths of folders to look in.
* `options` - Object - Options object.
  * `array` - Boolean - Return data as an array instead of a generator.
  * `filter` - Array - Only return these files or types.
  * `ignore` - Array - Filepaths to ignore.
  * `return` - String - How to return data, either 'path', 'name', or 'parse' to use `path.parse()`.

The function is asynchronous but does not require an `await`.


```js
const fileSync = require('@we-make-websites/file-sync')

const filepaths = fileSync('folder/path', {
  filter: ['.liquid'],
  ignore: ['example.liquid'],
})

for (const filepath of filepaths) {
  // List of filepaths of all .liquid files in folder/path excluding example.liquid
}
```

To use an array function (e.g. `map`, `filter`, etc.) on the returned values you will need to set `options.array` to `true`.

```js
const fileSync = require('@we-make-websites/file-sync')

const filepaths = fileSync('folder/path', {
  array: true,
  filter: ['.liquid'],
  ignore: ['example.liquid', 'example/ignore/path/'],
})
```

### `options.filter`

* The filter only tests the filename (e.g. `package.json`)
* It does not support filtering based on the full filepath

### `options.ignore`

* `ignore` tests the full filepath so supports filtering by path
* Use `/` as a cross-platform path separator, this will be converted into the appropriate path separator

### `options.return`

* Use `options.return` to change the type of data returned.
* Note in the below examples the path separate (`\\`) will be different depending on your OS. Use `path.sep` for a cross-platform path separator.

```js
const filepaths = fileSync('folder/path', {
  return: 'path', // Default
})

// Returns ['C:\\Users\\craig\\Documents\\Websites\\library-monorepo\\packages\\animate-number\\package.json']
```

```js
const filepaths = fileSync('folder/path', {
  return: 'name',
})

// Returns ['package.json']
```

```js
const filepaths = fileSync('folder/path', {
  return: 'parse',
})

// Returns [
//   {
//     base: 'package.json',
//     dir: 'C:\\Users\\craig\\Documents\\Websites\\library-monorepo\\packages\\animate-number',
//     ext: '.json',
//     name: 'package'
//     root: 'C:\\',
//   },
// ]
```


## 📅 Changelog

See *CHANGELOG.md* for a history of changes.

## 🤝 Contribution

Before making any updates to File Sync please talk to Craig Baldwin (craig@wemakewebsites.com)

Once any work is completed send a pull request to Craig for review.