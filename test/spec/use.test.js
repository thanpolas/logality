/**
 * @fileoverview Test the middleware interface.
 */

const Logality = require('../..');
const { stubLogality, cooldown } = require('../lib/tester.lib');

describe('Middleware interface', () => {
  stubLogality();
  test('Middleware will receive log context', () => {
    const logality = new Logality();

    const middStub = jest.fn();
    logality.use(middStub);

    logality.get()('info', 'hello world');

    expect(middStub).toHaveBeenCalledTimes(1);
    const callArgs = middStub.mock.calls[0];

    expect(callArgs[0]).toBeObject();
    expect(callArgs[0]).toMatchSnapshot();
    expect(callArgs[1]).toBeFalse();
  });

  test('Async Middleware will receive log context', async () => {
    const logality = new Logality({ async: true });

    const middStub = jest.fn(async () => {
      await cooldown();
    });
    logality.use(middStub);

    logality.get()('info', 'hello async world');

    expect(middStub).toHaveBeenCalledTimes(1);
    const callArgs = middStub.mock.calls[0];

    expect(callArgs[0]).toBeObject();
    expect(callArgs[0]).toMatchSnapshot();
    expect(callArgs[1]).toBeFalse();
  });

  test('Middleware return value will be ignored', () => {
    const logality = new Logality();

    const middStub = jest.fn(() => 'bogus');
    logality.use(middStub);

    logality.get()('info', 'hello bogus world');

    expect(middStub).toHaveBeenCalledTimes(1);
    const callArgs = middStub.mock.calls[0];

    expect(callArgs[0]).toBeObject();
    expect(callArgs[0]).toMatchSnapshot();
    expect(callArgs[1]).toBeFalse();
  });

  test('Middleware can mutate the Log Context', () => {
    const output = jest.fn();
    const logality = new Logality({ output });

    const middStub = jest.fn((logContext) => {
      logContext.middleware = true;
      logContext.middleware2 = true;
    });
    logality.use(middStub);

    logality.get()('info', 'hello bogus world');

    expect(middStub).toHaveBeenCalledTimes(1);
    const callArgs = middStub.mock.calls[0];

    expect(callArgs[0]).toBeObject();
    expect(callArgs[0]).toMatchSnapshot();
    expect(callArgs[1]).toBeFalse();

    expect(output).toHaveBeenCalledTimes(1);
    const logContext = output.mock.calls[0][0];
    expect(logContext.middleware).toBeTrue();
    expect(logContext.middleware2).toBeTrue();
  });
});
