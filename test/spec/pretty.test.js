/**
 * @fileoverview Test normal logging.
 */
const Logality = require('../..');
const { stubLogality } = require('../lib/tester.lib');

describe('Pretty Logging', () => {
  stubLogality();

  test('Will pretty log expected JSON properties', () => {
    const spy = jest.spyOn(process.stdout, 'write');
    const logality = new Logality({
      prettyPrint: true,
      appName: 'testLogality',
    });

    const log = logality.get();

    log('info', 'hello pretty world');
    expect(spy.mock.calls[0][0]).toMatchSnapshot();
    spy.mockRestore();
  });

  test('Will pretty log an object in context', () => {
    const spy = jest.spyOn(process.stdout, 'write');
    const logality = new Logality({
      prettyPrint: true,
      appName: 'testLogality',
    });

    const log = logality.get();

    log('info', 'hello prettier world', { custom: { a: 1, b: 2 } });
    expect(spy.mock.calls[0][0]).toMatchSnapshot();
    spy.mockRestore();
  });

  test('Will pretty log an object with noTimestamp', () => {
    const spy = jest.spyOn(process.stdout, 'write');
    const logality = new Logality({
      prettyPrint: {
        noTimestamp: true,
      },
      appName: 'testLogality',
    });

    const log = logality.get();

    log('info', 'hello prettier world', { custom: { a: 1, b: 2 } });
    expect(spy.mock.calls[0][0]).toMatchSnapshot();
    spy.mockRestore();
  });
  test('Will pretty log an object with noFilename', () => {
    const spy = jest.spyOn(process.stdout, 'write');
    const logality = new Logality({
      prettyPrint: {
        noFilename: true,
      },
      appName: 'testLogality',
    });

    const log = logality.get();

    log('info', 'hello prettier world', { custom: { a: 1, b: 2 } });
    expect(spy.mock.calls[0][0]).toMatchSnapshot();
    spy.mockRestore();
  });

  test('Will pretty log an object with noTimestamp and noFilename', () => {
    const spy = jest.spyOn(process.stdout, 'write');
    const logality = new Logality({
      prettyPrint: {
        noTimestamp: true,
        noFilename: true,
      },
      appName: 'testLogality',
    });

    const log = logality.get();

    log('info', 'hello prettier world', { custom: { a: 1, b: 2 } });
    expect(spy.mock.calls[0][0]).toMatchSnapshot();
    spy.mockRestore();
  });

  test('Will pretty log an object with noTimestamp, noFilename and onlyMessage', () => {
    const spy = jest.spyOn(process.stdout, 'write');
    const logality = new Logality({
      prettyPrint: {
        noTimestamp: true,
        noFilename: true,
        onlyMessage: true,
      },
      appName: 'testLogality',
    });

    const log = logality.get();

    log('info', 'hello prettier world', { custom: { a: 1, b: 2 } });
    expect(spy.mock.calls[0][0]).toMatchSnapshot();
    spy.mockRestore();
  });
});
