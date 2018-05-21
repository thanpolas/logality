/**
 * @fileOverview Test normal logging.
 */
const sinon = require('sinon');

const Logality = require('../..');
const { sink } = require('../lib/tester.lib');

describe('Normal Logging', () => {
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

  test('Will log expected JSON properties', (done) => {
    const logality = new Logality({
      appName: 'testLogality',
      wstream: sink((chunk) => {
        expect(chunk).toMatchSnapshot();
        done();
      }),
    });

    const log = logality.get();

    log('info', 'hello world');
  });

  test('Will log an object in context', (done) => {
    const logality = new Logality({
      appName: 'testLogality',
      wstream: sink((chunk) => {
        expect(chunk).toMatchSnapshot();
        done();
      }),
    });

    const log = logality.get();

    log('info', 'hello world', { custom: { a: 1, b: 2 } });
  });
});
