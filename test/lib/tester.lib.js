/**
 * @fileoverview Main testing helper lib.
 *
 */
const os = require('os');

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
