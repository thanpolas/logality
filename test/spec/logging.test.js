/**
 * @fileoverview Test normal logging.
 */
const Logality = require('../..');
const { stubLogality, DT_VAL, PID_VAL } = require('../lib/tester.lib');

function assertContext(logContext) {
  expect(logContext).toBeObject();
  expect(logContext).toContainAllKeys([
    'level',
    'severity',
    'dt',
    'message',
    'context',
    'event',
  ]);
  expect(logContext.context).toContainAllKeys(['runtime', 'source', 'system']);
  expect(logContext.context.runtime).toContainAllKeys(['application']);
  expect(logContext.context.source).toContainAllKeys(['file_name']);
  expect(logContext.context.system).toContainAllKeys([
    'hostname',
    'pid',
    'process_name',
  ]);
  expect(logContext.event).toContainAllKeys([]);

  expect(logContext.level).toEqual('info');
  expect(logContext.severity).toEqual(6);
  expect(logContext.dt).toEqual(DT_VAL);
  expect(logContext.message).toEqual('hello world');
  expect(logContext.context.runtime.application).toEqual('testLogality');
  expect(logContext.context.source.file_name).toEqual(
    '/test/spec/logging.test.js',
  );
  expect(logContext.context.system.hostname).toEqual('localhost');
  expect(logContext.context.system.pid).toEqual(PID_VAL);
  expect(logContext.context.system.process_name).toEqual('node .');
}

describe('Normal Logging', () => {
  stubLogality();

  test('Custom output will receive expected logContext object', () => {
    const output = jest.fn();

    const logality = new Logality({
      appName: 'testLogality',
      output,
    });

    const log = logality.get();

    log('info', 'hello world');
    expect(output).toHaveBeenCalledTimes(1);
    assertContext(output.mock.calls[0][0]);
  });
  test('Will output to standard out', () => {
    const spy = jest.spyOn(process.stdout, 'write');

    const logality = new Logality({
      appName: 'testLogality',
    });
    const log = logality.get();

    log('info', 'Good sleep now...');

    expect(spy.mock.calls[0][0]).toMatchSnapshot();

    spy.mockRestore();
  });
  describe('Filter Logging', () => {
    test('Will filter out debug level with string key', () => {
      const spy = jest.spyOn(process.stdout, 'write');

      const logality = new Logality({
        appName: 'testLogality',
        minLevel: 'info',
      });
      const log = logality.get();

      log('debug', 'Good sleep now...');

      expect(spy).toHaveBeenCalledTimes(0);

      spy.mockRestore();
    });
    test('Will filter out debug level with nunber', () => {
      const spy = jest.spyOn(process.stdout, 'write');

      const logality = new Logality({
        appName: 'testLogality',
        minLevel: 6,
      });
      const log = logality.get();

      log('debug', 'Good sleep now...');

      expect(spy).toHaveBeenCalledTimes(0);

      spy.mockRestore();
    });
  });
});
