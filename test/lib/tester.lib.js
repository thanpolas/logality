/**
 * @fileOverview Main testing helper lib.
 *
 */
const os = require('os');

const writeStream = require('flush-write-stream');
const split = require('split2');
const sinon = require('sinon');

const Logality = require('../..');

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

/**
 * Writable stream helper for capturing pretty logging output.
 *
 * @param {Function} func Callback with the logging streams.
 * @return {Writable Stream}
 */
tester.sinkPretty = function (func) {
  return writeStream.obj(func);
};

/**
 * Stub Logality so it can be properly tested with snapshots.
 *
 */
tester.stubLogality = function () {
  let dateStub;
  let processStub;
  let hostnameStub;
  let processNameStub;
  beforeEach(() => {
    dateStub = sinon.stub(Date.prototype, 'toISOString');
    dateStub.returns('2018-05-18T16:25:57.815Z');
    hostnameStub = sinon.stub(os, 'hostname');
    hostnameStub.returns('localhost');
    processStub = sinon.stub(process, 'pid');
    processStub.returns(36255);
    processNameStub = sinon.stub(process, 'argv');
    processNameStub.returns(['node .']);
  });

  afterEach(() => {
    hostnameStub.restore();
    dateStub.restore();
    processNameStub.restore();
    processStub.restore();
  });
};

/** @type {Regex} Regex to test ISO 8601 Dates */
tester.reISO8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
