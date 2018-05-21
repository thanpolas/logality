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
