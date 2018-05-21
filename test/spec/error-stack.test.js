/**
 * @fileOverview Test logging a JS error with error stack.
 */

const sinon = require('sinon');

const Logality = require('../..');
const { sink } = require('../lib/tester.lib');

describe('Error Stack Testing', () => {
  let dateStub;
  let processStub;
  beforeEach(() => {
    dateStub = sinon.stub(Date.prototype, 'toISOString');
    processStub = sinon.stub(Logality.prototype, '_getPid');
    dateStub.returns('2018-05-18T16:25:57.815Z');
    processStub.returns(36255);
  });

  afterEach(() => {
    dateStub.restore();
    processStub.restore();
  });

  test('Will properly figure out invoking function module on error', (done) => {
    const logality = new Logality({
      appName: 'testLogality',
      hostname: '127.0.0.1',
      wstream: sink((chunk) => {
        expect(chunk).toMatchSnapshot();
        done();
      }),
    });

    const log = logality.get();

    try {
      throw new Error('An error did not occur');
    } catch (ex) {

      log('error', 'An error happened, maybe?', {
        error: ex,
      });
    }
  });
});
