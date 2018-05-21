/**
 * @fileOverview Test logging a JS error with error stack.
 */
const Logality = require('../..');
const { sink, stubLogality } = require('../lib/tester.lib');

describe('Error Stack Testing', () => {
  stubLogality();

  test('Will properly figure out invoking function module on error', (done) => {
    const logality = new Logality({
      appName: 'testLogality',
      wstream: sink((chunk) => {
        expect(chunk).toHaveProperty('severity', 3);
        expect(chunk).toHaveProperty('message', 'An error happened, maybe?');
        expect(chunk).toHaveProperty('level', 'error');
        expect(chunk).toHaveProperty('event');
        expect(chunk).toHaveProperty('dt', '2018-05-18T16:25:57.815Z');
        expect(chunk).toHaveProperty('context');

        expect(chunk.event).toHaveProperty('error');
        expect(chunk.event.error).toHaveProperty('backtrace');
        expect(chunk.event.error).toHaveProperty('message', 'An error did not occur');
        expect(chunk.event.error).toHaveProperty('name', 'Error');

        expect(chunk.event.error.backtrace.length).toBeGreaterThan(4);

        chunk.event.error.backtrace.forEach((traceItem) => {
          expect(traceItem).toHaveProperty('file');
          expect(traceItem).toHaveProperty('function');
          expect(traceItem).toHaveProperty('line');
        });
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
