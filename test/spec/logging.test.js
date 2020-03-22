/**
 * @fileoverview Test normal logging.
 */
const Logality = require('../..');
const { stubLogality } = require('../lib/tester.lib');

describe('Normal Logging', () => {
  stubLogality();

  test('Will log expected JSON properties', () => {
    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      output: (logMessage) => {
        expect(logMessage).toBeString();
        expect(logMessage).toMatchSnapshot();
        outputDone = true;
      },
    });

    const log = logality.get();

    log('info', 'hello world');
    expect(outputDone).toBeTrue();
  });

  test('Will log a custom object in context', () => {
    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      output: (logMessage) => {
        expect(logMessage).toBeString();
        expect(logMessage).toMatchSnapshot();
        outputDone = true;
      },
    });

    const log = logality.get();

    log('info', 'hello world', { custom: { a: 1, b: 2 } });
    expect(outputDone).toBeTrue();
  });

  test('objectMode config will provide object as argument on output fn', () => {
    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      objectMode: true,
      output: (logObject) => {
        expect(logObject).toBeObject();
        expect(logObject).toMatchSnapshot();
        outputDone = true;
      },
    });

    const log = logality.get();

    log('info', 'hello world', { custom: { a: 1, b: 2 } });
    expect(outputDone).toBeTrue();
  });
});
