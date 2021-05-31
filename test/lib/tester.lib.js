/**
 * @fileoverview Main testing helper lib.
 *
 */
const os = require('os');

const sinon = require('sinon');

const utils = require('../../app/utils');

const tester = (module.exports = {});

tester.DT_VAL = '2018-05-18T16:25:57.815Z';
tester.PID_VAL = 36255;

/**
 * Have a Cooldown period between tests.
 *
 * @param {number} seconds cooldown in seconds.
 * @return {function} use is beforeEach().
 */
tester.cooldown = function (seconds = 0) {
  return function (done) {
    setTimeout(done, seconds);
  };
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
    dateStub.returns(tester.DT_VAL);
    hostnameStub = sinon.stub(os, 'hostname');
    hostnameStub.returns('localhost');
    processStub = sinon.stub(utils, 'getProcessId');
    processStub.returns(tester.PID_VAL);
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
