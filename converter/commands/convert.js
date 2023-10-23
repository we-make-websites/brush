#!/usr/bin/env node
/**
 * Converter: Convert
 * -----------------------------------------------------------------------------
 * Converts Vue template into Liquid
 *
 */
const Tny = require('@we-make-websites/tannoy')

/**
 * Initialises the convert functionality.
 */
function init() {
  logBanner()
}

/**
 * Log banner to console.
 */
function logBanner() {
  Tny.message([
    Tny.colour('bgCyan', `Convertor v1`),
    Tny.colour('bgCyan', 'Convert command'),
  ], { empty: true })
}

/**
 * Run convert command.
 */
init()
