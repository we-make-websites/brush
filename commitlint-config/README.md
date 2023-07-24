# 💬 Commitlint Config

We Make Website's commitlint rules and config.

## Installation

Run the command:

```
yarn add commitlint-config @we-make-websites/commitlint-config --dev
```

## Usage
We Make Website's commitlint rules come bundled in `@we-make-websites/commitlint-config`.

To enable these rules add the following to your _.eslintrc_ root file:

```js
extends: [
  '@we-make-websites/commitlint-config',
],
```

## Versions

* `2.#.#` - [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (planned)
* `1.#.#` - [Original Canvas rules](https://www.notion.so/wemakewebsites/Naming-Conventions-3b426d0d1f414488a45dcf76e6d469b8?pvs=4#39baa06684a943849be83ab75dd8be6e)

## Rules

### Type

* Required
* All uppercase or lowercase
* One of the following enums:
  * BUILD - A code change not covered by one of the below
  * CHORE - Dependency update
  * CI - A change to the continuous integration (e.g. Buddy.yml)
  * DOCS - Update to documentation
  * FEAT - Adds a new feature to store/application
  * FEATURE - Adds a new feature to store/application
  * FIX - Patches a bug in your codebase
  * MERGE - A branch merge (use MERGE when syncing master branch, e.g. `MERGE: Syncing master`)
  * REFACTOR - Update to existing code (including removal)
  * RELEASE - A specific version release
  * REVERT - A git commit revert
  * PERF - Performance improvement
  * STYLE - Stylistic code change with no impact on functionality
  * SYNC - A live sync from Shopify theme
  * TEST - A change to the automated testing

### Scope

* Optional
* Lowercase

### Subject

* Required
* Sentence case
* At least 5 characters
* Must not end in a full stop

### Body

* Optional

### Footer

* Optional
