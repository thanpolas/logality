/**
 * @fileoverview Test logging a JS error with error stack.
 */
const Logality = require('../../app/logality');
const { stubLogality } = require('../lib/tester.lib');

describe('Error Stack Testing', () => {
  stubLogality();

  test('Will properly figure out invoking function module on error', () => {
    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      objectMode: true,
      output: (logContext) => {
        expect(logContext).toHaveProperty('severity', 3);
        expect(logContext).toHaveProperty(
          'message',
          'An error happened, maybe?',
        );
        expect(logContext).toHaveProperty('level', 'error');
        expect(logContext).toHaveProperty('event');
        expect(logContext).toHaveProperty('dt', '2018-05-18T16:25:57.815Z');
        expect(logContext).toHaveProperty('context');

        expect(logContext.event).toHaveProperty('error');
        expect(logContext.event.error).toHaveProperty('backtrace');
        expect(logContext.event.error).toHaveProperty(
          'message',
          'An error did not occur',
        );
        expect(logContext.event.error).toHaveProperty('name', 'Error');
        outputDone = true;
      },
    });

    const log = logality.get();

    const error = new Error('An error did not occur');
    log('error', 'An error happened, maybe?', {
      error,
    });

    expect(outputDone).toBeTrue();
  });
});
