# 🗃️ File Sync

Node helper function to find all filepaths inside a folder and its sub-folders, also supports filtering filepaths based on filetype.

## 👩‍💻 Usage

`fileSync(folder, filetypes, config)`

* `folder` - String - Path to folder to search in
* `filetypes` - Array - Filetypes to filter by, e.g. `['liquid']`
* `config` - Object - Configuration object
* `config.filenames` - Boolean - Returns only the filenames (and their extensions) instead of full paths

The function is asynchronous but does not require an `await`.


```js
const fileSync = require('@we-make-websites/file-sync')

const filepaths = fileSync('folder/path', ['liquid'])

for (const filepath of filepaths) {
  console.log(filepath)
  // Expected output is the full filepath
}
```

To use the returned values using an array function (e.g. `map`, `filter`, etc.) you will need to de-structure it into an array

```js
const fileSync = require('@we-make-websites/file-sync')

const filepaths = fileSync('folder/path', ['liquid'])
const array = [...filepaths]
```

## 📅 Changelog

See *CHANGELOG.md* for a history of changes.

## 🤝 Contribution

Before making any updates to File Sync please talk to Craig Baldwin (craig@wemakewebsites.com)

Once any work is completed send a pull request to Craig for review.