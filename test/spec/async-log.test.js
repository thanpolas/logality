/**
 * @fileoverview Test asynchronous logging.
 */
const Logality = require('../..');
const { stubLogality, cooldown } = require('../lib/tester.lib');

describe('Asynchronous Logging', () => {
  stubLogality();

  test('Async Logging', async () => {
    const logality = new Logality({
      appName: 'testLogality',
      async: true,
      output: async (logMessage) => {
        expect(logMessage).toBeObject();
        expect(logMessage).toMatchSnapshot();
        await cooldown();
      },
    });

    const log = logality.get();

    await log('info', 'hello world', { custom: { a: 1, b: 2 } });
  });

  test('Async Logging will return a promise.', async () => {
    const logality = new Logality({
      appName: 'testLogality',
      async: true,
    });

    const log = logality.get();

    const promise = log('info', 'hello world', { custom: { a: 1, b: 2 } });

    expect(typeof promise).toEqual('object');
    expect(typeof promise.then).toEqual('function');
    expect(typeof promise.catch).toEqual('function');
    await promise;
  });

  test('Test API helpers with Async Logging', async () => {
    const logality = new Logality({
      appName: 'testLogality',
      async: true,
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

  test('Async Logging output Error Propagates', async () => {
    const logality = new Logality({
      appName: 'testLogality',
      async: true,
      output: (logMessage) => {
        expect(logMessage).toMatchSnapshot();
        throw new Error('420');
      },
    });

    const log = logality.get();

    let errorThrown = false;

    try {
      await log('info', 'hello world', { custom: { a: 1, b: 2 } });
    } catch (ex) {
      expect(ex.message).toEqual('420');
      errorThrown = true;
    }

    expect(errorThrown).toEqual(true);
  });
});
