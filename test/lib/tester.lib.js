/**
 * @fileOverview Main testing helper lib.
 *
 */

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
