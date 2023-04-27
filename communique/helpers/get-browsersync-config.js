/**
 * Helper: Get Browsersync config
 * -----------------------------------------------------------------------------
 * Creates Browsersync instance.
 *
 */

/**
 * Export.
 * @param {Object} port - Browsersync and UI port.
 * @returns {Object}
 */
module.exports = (ports) => {
  return {
    logLevel: 'silent',
    notify: {
      styles: [
        'background-color: #000',
        'border-radius: 0',
        'bottom: 16px',
        'color: #fff',
        'display: none',
        'font-family: sans-serif',
        'font-weight: normal',
        'font-size: 10px',
        'letter-spacing: 0',
        'line-height: 100%',
        'margin: 0',
        'padding: 8px 12px',
        'position: fixed',
        'right: 16px',
        'text-align: center',
        'text-decoration: none',
        'text-indent: 0',
        'word-spacing: 0',
        'z-index: 9999',
      ],
    },
    open: 'local',
    port: ports.browsersync,
    server: 'emails/dist',
    ui: {
      port: ports.ui,
    },
  }
}
