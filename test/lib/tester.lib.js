/**
 * @fileOverview Main testing helper lib.
 *
 */
const writeStream = require('flush-write-stream');
const split = require('split2');

const tester = module.exports = {};

/**
 * Have a Cooldown period between tests.
 *
 * @param {number} seconds cooldown in seconds.
 * @return {Function} use is beforeEach().
 */
tester.cooldown = function (seconds) {
  return function (done) {
    setTimeout(done, seconds);
  };
};

/**
 * Writable stream helper for capturing logging output.
 *
 * @param {Function} func Callback with the logging streams.
 * @return {Writable Stream}
 */
tester.sink = function (func) {
  const result = split(JSON.parse);
  result.pipe(writeStream.obj(func));
  return result;
};

/** @type {Regex} Regex to test ISO 8601 Dates */
tester.reISO8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
