# 🧵 Destringify

Destringify is a CLI tool for converting Dawn section setting locale strings into plain strings.

It expects the Dawn-based project to be in the same root folder as the Brush/Destringify repo.

Unlike other Brush packages, Destringify is not published to npm as Dawn projects do not come with a _package.json_ file.

## 👩‍💻 Usage

1. Clone down the Brush repo
2. Navigate to the _brush/destringify/_ folder in terminal
3. Run `yarn install`
4. Run `yarn destringify` and follow the prompts
5. Converted schema is exported to _brush/destringify/dist/_

### Flags

* `--path=[path/to/root]` - By default the tool looks in '../../' to build a list of project folders, use this flag to append a path onto '../../'
* `--all-sections` - Convert all sections settings at once instead of a single section
* `--project=[project-folder]` - Skip project folder question by providing project name
* `--section=[section-handle]` - Skip section question by providing section handle
* `--language=[language-prefix]` - By default Destringify uses _en.default.schema.json_, use this flag to use another language

## 📅 Changelog

See *CHANGELOG.md* for a history of changes.

## 🤝 Contribution

Before making any updates to Destringify please talk to Craig Baldwin (craig@wemakewebsites.com)

Once any work is completed send a pull request to Craig for review.
