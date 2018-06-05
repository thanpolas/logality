/**
 * @fileOverview Test normal logging.
 */
const Logality = require('../..');
const { sinkPretty, stubLogality } = require('../lib/tester.lib');

describe('Pretty Logging', () => {
  stubLogality();

  test('Will pretty log expected JSON properties', (done) => {
    const logality = new Logality({
      prettyPrint: true,
      appName: 'testLogality',
      wstream: sinkPretty((chunk) => {
        expect(chunk).toMatchSnapshot();
        done();
      }),
    });

    const log = logality.get();

    log('info', 'hello world');
  });


  test('Will pretty log an object in context', (done) => {
    const logality = new Logality({
      prettyPrint: true,
      appName: 'testLogality',
      wstream: sinkPretty((chunk) => {
        expect(chunk).toMatchSnapshot();
        done();
      }),
    });

    const log = logality.get();

    log('info', 'hello world', { custom: { a: 1, b: 2 } });
  });
});
