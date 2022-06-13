/**
 * @fileoverview Wraps and exports the Logality class.
 */

const Logality = require('./logality');
const { writePretty } = require('./pretty-print');

/**
 * Wraps and returns a new instance of Logality.
 *
 * @param  {...any} args Any argument[s].
 * @return {Logality} Logality instance.
 */
function LogalityWrapper(...args) {
  const logality = new Logality(...args);

  logality.writePretty = writePretty;

  return logality;
}

module.exports = LogalityWrapper;
