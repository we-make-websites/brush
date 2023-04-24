#!/usr/bin/env node
/**
 * Email: Preview
 * -----------------------------------------------------------------------------
 * Preview email notification templates.
 *
 */
import messagesApi from '../apis/messages'

/**
 * Initialises the preview functionality.
 */
function init() {
  messagesApi.logBanner()
}

/**
 * Run preview command.
 */
init()
