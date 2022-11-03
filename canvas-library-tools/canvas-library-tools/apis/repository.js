/**
 * API: Repository
 * -----------------------------------------------------------------------------
 * Functions to load, update, and read from local repository.
 *
 */
/* eslint-disable no-await-in-loop, prefer-promise-reject-errors */
const fs = require('fs-extra')
const nodegit = require('nodegit')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const Paths = require('../helpers/paths')

/**
 * Set variables.
 */
const argv = yargs(hideBin(process.argv)).argv

/**
 * Set repository variables.
 * - See paths for Library repo folder.
 */
const config = {
  branch: 'master',
  remote: {
    default: 'origin',
    ssh: 'origin-ssh',
  },
  repo: 'git@bitbucket.org:we-make-websites/canvas-library.git',
}

if (argv.branch) {
  config.branch = argv.branch
}

const messages = []

/**
 * Gets components from repository.
 * @returns {Promise}
 */
function getComponentsFromRepo() {
  return new Promise(async(resolve, reject) => {
    try {
      if (argv.components) {
        const repo = await openRepo()
        const branch = await repo.getBranch(config.branch)
        const components = await getComponents(repo, branch)
        resolve({ components, messages })
        return
      }

      const repo = fs.existsSync(Paths.library)
        ? await openRepo()
        : await cloneRepo()

      const remote = await createSshRemote(repo)
      const branch = await updateBranch(repo, remote)
      const components = await getComponents(repo, branch)
      resolve({ components, messages })

    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Open local copy of repo.
 * @returns {Promise}
 */
function openRepo() {
  return new Promise(async(resolve, reject) => {
    try {
      const repo = await nodegit.Repository.open(Paths.library)
      resolve(repo)

    } catch (error) {
      reject({ error, string: 'Failed to open Git repository' })
    }
  })
}

/**
 * Clones repo down to local folder and opens.
 * @returns {Promise}
 */
function cloneRepo() {
  return new Promise(async(resolve, reject) => {
    try {
      const repo = await nodegit.Clone(
        config.repo,
        Paths.library,
        {
          fetchOpts: {
            callbacks: {
              certificateCheck: () => {
                return 0
              },
              credentials: (_, userName) => {
                return nodegit.Credential.sshKeyNew(
                  userName,
                  Paths.credentials.publickey,
                  Paths.credentials.privatekey,
                  '',
                )
              },
            },
          },
        },
      )

      messages.push('🧪 Cloned copy of Library repository')
      resolve(repo)

    } catch (error) {
      reject({ error, string: 'Failed to clone Git repository' })
    }
  })
}

/**
 * Create SSH remote.
 * - HTTPS remotes are not supported.
 * @param {Repository} repo - Local repo.
 * @returns {Promise}
 */
function createSshRemote(repo) {
  return new Promise(async(resolve, reject) => {
    try {
      const remoteNames = await repo.getRemoteNames()

      /**
       * If `origin-ssh` already exists then use it.
       */
      if (remoteNames.includes(config.remote.ssh)) {
        const originSsh = await repo.getRemote(config.remote.ssh)
        messages.push(`🌲 Using existing \`${originSsh.name()}\` remote`)
        resolve(originSsh)
        return
      }

      const origin = await repo.getRemote(config.remote.default)
      const url = origin.url()

      /**
       * If `origin` already uses SSH then use it.
       */
      if (!url.includes('https')) {
        messages.push(`🌲 Using \`${origin.name()}\` remote`)
        resolve(origin)
        return
      }

      /**
       * Create `origin-ssh` if no SSH in `origin` and doesn't already exist.
       */
      const newOriginSsh = await nodegit.Remote.create(
        repo,
        config.remote.ssh,
        config.repo,
      )

      messages.push(`🌲 Created \`${newOriginSsh.name()}\` remote`)
      resolve(newOriginSsh)

    } catch (error) {
      reject({ error, string: 'Failed to load or create SSH remote' })
    }
  })
}

/**
 * Update branch specified in config.
 * @param {Repository} repo - Local repo.
 * @param {Remote} remote - Remote to fetch.
 * @returns {Promise}
 */
function updateBranch(repo, remote) {
  return new Promise(async(resolve, reject) => {

    /**
     * Fetch all branch changes from remote.
     */
    try {
      await repo.fetch(
        remote,
        {
          callbacks: {
            certificateCheck: () => {
              return 0
            },
            credentials: (_, userName) => {
              return nodegit.Credential.sshKeyNew(
                userName,
                Paths.credentials.publickey,
                Paths.credentials.privatekey,
                '',
              )
            },
          },
        },
      )

    } catch (error) {
      reject({ error, string: `Failed to fetch changes from ${remote.name()}` })
      return
    }

    /**
     * Create/update locale branch.
     */
    try {
      const remoteName = remote.name()
      const remoteBranch = await repo.getBranch(`${remoteName}/${config.branch}`)
      const remoteCommit = await repo.getBranchCommit(remoteBranch)

      /**
       * Check to see if local branch exists.
       * - If it does then merge in remote branch changes.
       * - If it doesn't then create local branch pointing to latest commit on
       *   remote branch so it's up-to-date.
       */
      let localBranch = false

      await repo.getBranch(config.branch)
        .then((reference) => {
          localBranch = reference
        })
        .catch(() => {
          localBranch = false
        })

      if (localBranch) {
        await repo.mergeBranches(localBranch, remoteBranch)

      } else {
        localBranch = await repo.createBranch(
          config.branch,
          remoteCommit,
          false,
        )

        await repo.checkoutBranch(localBranch)
      }

      /**
       * Ensure HEAD points to local branch.
       */
      await repo.setHead(localBranch.name())

      /**
       * Resolve and push message.
       */
      const remoteBranchName = remoteBranch.name().split('remotes/')[1]
      const localBranchName = localBranch.name().split('heads/')[1]

      messages.push(`➕ Merged ${remoteBranchName} into ${localBranchName}`)
      resolve(localBranch)

    } catch (error) {
      reject({ error, string: `Failed to fetch and pull changes to ${config.branch}` })
    }
  })
}

/**
 * Get latest commit and output list of folders which represent components.
 * - Filter out folders starting with `.` as they're config folders.
 * @param {Repository} repo - Local repo.
 * @param {Branch} branch - Current branch.
 * @returns {Promise}
 */
function getComponents(repo, branch) {
  return new Promise(async(resolve, reject) => {
    try {
      const commit = await repo.getBranchCommit(branch)
      const tree = await commit.getTree()
      const entries = tree.entries()
      const components = []

      messages.push(`📋 Checked out latest commit`)

      for (const entry of entries) {
        const name = entry.name()

        if (
          !entry.isTree() ||
          entry.isFile() ||
          name.slice(0, 1) === '.' ||
          name === 'example-entry'
        ) {
          continue
        }

        const componentTree = await entry.getTree()

        const hasPackageJson = componentTree.entries().some((subtree) => {
          return subtree.name().includes('package.json')
        })

        if (!hasPackageJson) {
          continue
        }

        const packageJsonPath = `${name}/package.json`
        let packageJson = await commit.getEntry(packageJsonPath)

        if (!packageJson.isBlob()) {
          continue
        }

        packageJson = await packageJson.getBlob()
        packageJson = JSON.parse(packageJson)

        components.push(packageJson)
      }

      resolve(components)

    } catch (error) {
      reject({ error, string: 'Failed to read latest commit' })
    }
  })
}

/**
 * Export API.
 */
module.exports = {
  getComponentsFromRepo,
}
