#!/usr/bin/env node
/**
 * Email: Preview
 * -----------------------------------------------------------------------------
 * Preview email notification templates.
 *
 */
const fs = require('fs-extra')
const { Liquid } = require('liquidjs')
const path = require('path')

const messagesApi = require('../apis/messages')

const Paths = require('../helpers/paths')

/**
 * Initialises the preview functionality.
 */
async function init() {
  messagesApi.logBanner()

  const engine = new Liquid()

  const filepath = path.join(Paths.emails.templates, 'order-confirmation.liquid')
  const template = await fs.readFile(filepath, 'utf-8')
  const context = require(Paths.context)

  const output = await engine.parseAndRender(template, context)

  // Replace image and CSS URLs

  await fs.ensureDir(Paths.dist)
  await fs.writeFile(
    path.join(Paths.dist, 'order-confirmation.html'),
    output,
    'utf-8',
  )
}

/**
 * Run preview command.
 */
init()
