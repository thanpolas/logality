/**
 * @fileoverview Launches logality manually for node debugger debugging.
 */

const logality = require('..');

function run() {
  const logInst = logality();

  const log = logInst.get();

  log.info('hello world');
}

run();
