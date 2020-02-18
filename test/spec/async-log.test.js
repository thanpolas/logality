/**
 * @fileoverview Test asynchronous logging.
 */
const Logality = require('../..');
const { sink, stubLogality } = require('../lib/tester.lib');

describe('Asynchronous Logging', () => {
  stubLogality();

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

  test('Test API helpers with Async Logging', async () => {
    const logality = new Logality({
      appName: 'testLogality',
      wstream: sink((chunk, enc, cb) => {
        expect(chunk).toMatchSnapshot();
        expect(enc).toEqual('utf8');
        cb();
      }),
    });

    const log = logality.get();

    await log.debug('This is message of level: Debug');
    await log.info('This is message of level: Info');
    await log.notice('This is message of level: Notice');
    await log.warn('This is message of level: warning');
    await log.error('This is message of level: Error');
    await log.critical('This is message of level: Critical');
    await log.alert('This is message of level: Alert');
    await log.emergency('This is message of level: Emergency');
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
