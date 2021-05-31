/**
 * @fileoverview Wraps and exports the Logality class.
 */

const Logality = require('./logality');

/**
 * Wraps and returns a new instance of Logality.
 *
 * @param  {...any} args Any argument[s].
 * @return {Logality} Logality instance.
 */
function LogalityWrapper(...args) {
  const logality = new Logality(...args);

  return logality;
}

module.exports = LogalityWrapper;
