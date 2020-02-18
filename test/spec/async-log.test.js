/**
 * @fileoverview Test asynchronous logging.
 */
const Logality = require('../..');
const { sink, stubLogality } = require('../lib/tester.lib');

describe('Asynchronous Logging', () => {
  stubLogality();

  test('Async logging with default writestream to stdout', () => {
    const logality = new Logality({
      appName: 'testLogality',
      async: true,
    });

    const log = logality.get();

    log('info', 'hello world');
  });

  test('Async Logging with async writabble stream', async () => {
    const logality = new Logality({
      appName: 'testLogality',
      wstream: sink((chunk, enc, cb) => {
        expect(chunk).toMatchSnapshot();
        expect(enc).toEqual('utf8');
        cb();
      }),
    });

    const log = logality.get();

    await log('info', 'hello world', { custom: { a: 1, b: 2 } });
  });

  test('Async Logging Streamer Error Propagates', async () => {
    const logality = new Logality({
      appName: 'testLogality',
      wstream: sink((chunk, enc, cb) => {
        expect(chunk).toMatchSnapshot();
        expect(enc).toEqual('utf8');
        const err = new Error('420');
        cb(err);
      }),
    });

    const log = logality.get();

    let errorThrown = false;

    try {
      await log('info', 'hello world', { custom: { a: 1, b: 2 } });
    } catch (ex) {
      expect(ex.context.message).toEqual('420');
      errorThrown = true;
    }

    expect(errorThrown).toEqual(true);
  });
});
