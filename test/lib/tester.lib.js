/**
 * @fileoverview Main testing helper lib.
 *
 */
const os = require('os');

const writeStream = require('flush-write-stream');
const split = require('split2');
const sinon = require('sinon');

const utils = require('../../app/utils');

const tester = (module.exports = {});

/**
 * Have a Cooldown period between tests.
 *
 * @param {number} seconds cooldown in seconds.
 * @return {function} use is beforeEach().
 */
tester.cooldown = function(seconds) {
  return function(done) {
    setTimeout(done, seconds);
  };
};

/**
 * Writable stream helper for capturing logging output.
 *
 * @param {function} func Callback with the logging streams.
 * @return {Object} Writeable stream.
 */
tester.sink = function(func) {
  const result = split(JSON.parse);
  result.pipe(writeStream.obj(func));
  return result;
};

/**
 * Writable stream helper for capturing pretty logging output.
 *
 * @param {function} func Callback with the logging streams.
 * @return {Object} Custom writable stream.
 */
tester.sinkPretty = function(func) {
  return writeStream.obj(func);
};

/**
 * Stub Logality so it can be properly tested with snapshots.
 *
 */
tester.stubLogality = function() {
  let dateStub;
  let processStub;
  let hostnameStub;
  let processNameStub;
  beforeEach(() => {
    dateStub = sinon.stub(Date.prototype, 'toISOString');
    dateStub.returns('2018-05-18T16:25:57.815Z');
    hostnameStub = sinon.stub(os, 'hostname');
    hostnameStub.returns('localhost');
    processStub = sinon.stub(utils, 'getProcessId');
    processStub.returns(36255);
    processNameStub = sinon.stub(utils, 'getProcessName');
    processNameStub.returns('node .');
  });

  afterEach(() => {
    hostnameStub.restore();
    dateStub.restore();
    processNameStub.restore();
    processStub.restore();
  });
};

/** @type {RegExp} Regex to test ISO 8601 Dates */
// eslint-disable-next-line security/detect-unsafe-regex
tester.reISO8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/i;
