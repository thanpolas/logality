/**
 * @fileoverview Test normal logging.
 */
const Logality = require('../..');
const { stubLogality } = require('../lib/tester.lib');

describe('Normal Logging', () => {
  stubLogality();

  test('Will log expected JSON properties', (done) => {
    const logality = new Logality({
      appName: 'testLogality',
      output: (logMessage) => {
        expect(logMessage).toBeString();
        expect(logMessage).toMatchSnapshot();
        done();
      },
    });

    const log = logality.get();

    log('info', 'hello world');
  });

  test('Will log a custom object in context', (done) => {
    const logality = new Logality({
      appName: 'testLogality',
      output: (logMessage) => {
        expect(logMessage).toBeString();
        expect(logMessage).toMatchSnapshot();
        done();
      },
    });

    const log = logality.get();

    log('info', 'hello world', { custom: { a: 1, b: 2 } });
  });

  test('objectMode config will provide object as argument on output fn', (done) => {
    const logality = new Logality({
      appName: 'testLogality',
      objectMode: true,
      output: (logObject) => {
        expect(logObject).toBeObject();
        expect(logObject).toMatchSnapshot();
        done();
      },
    });

    const log = logality.get();

    log('info', 'hello world', { custom: { a: 1, b: 2 } });
  });
});
