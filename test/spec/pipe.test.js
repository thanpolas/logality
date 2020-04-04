/**
 * @fileoverview Test the pipe interface.
 */

const Logality = require('../..');
const { stubLogality, cooldown } = require('../lib/tester.lib');

describe('pipe interface', () => {
  stubLogality();
  test('Will pipe one logality instance to another', () => {
    const output = jest.fn();
    const logalityChild = new Logality({
      appName: 'child',
    });
    const logalityParent = new Logality({
      appName: 'parent',
      output,
    });

    logalityParent.pipe(logalityChild);
    logalityChild.get()('info', 'hello world');
    expect(output).toHaveBeenCalledTimes(1);
    expect(output.mock.calls[0][0]).toMatchSnapshot();
    // Second argument "isPiped" should be true
    expect(output.mock.calls[0][1]).toBeTrue();
  });

  test('Will pipe multiple logality instances to a single one', () => {
    const logalityChild1 = new Logality({ appName: 'child1' });
    const logalityChild2 = new Logality({ appName: 'child2' });
    const logalityChild3 = new Logality({ appName: 'child3' });

    const output = jest.fn();

    const logalityParent = new Logality({
      appName: 'parent',
      output,
    });

    logalityParent.pipe([logalityChild1, logalityChild2, logalityChild3]);
    logalityChild1.get()('info', 'hello world 1');
    logalityChild2.get()('info', 'hello world 2');
    logalityChild3.get()('info', 'hello world 3');

    expect(output).toHaveBeenCalledTimes(3);
  });
  test('Piped async child with string custom output will go through parent custom output', async () => {
    const logalityChild = new Logality({
      appName: 'child',
      async: true,
      output: async (logContext) => {
        await cooldown();
        return JSON.stringify(logContext);
      },
    });

    const output = jest.fn((logContext) => logContext);
    const logalityParent = new Logality({
      appName: 'parent',
      output,
    });

    logalityParent.pipe(logalityChild);

    const spy = jest.spyOn(process.stdout, 'write');

    await logalityChild.get()('info', 'hello loki world');

    expect(output).toHaveBeenCalledTimes(1);
    expect(output.mock.calls[0][0]).toBeString();
    expect(output.mock.calls[0][1]).toBeTrue();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toMatchSnapshot();
    spy.mockRestore();
  });
  test('Piped async child with object custom output will go through synch parent custom output', async () => {
    const logalityChild = new Logality({
      appName: 'child',
      async: true,
      output: async (logContext) => {
        await cooldown();
        return logContext;
      },
    });

    const output = jest.fn((logContext) => logContext);
    const logalityParent = new Logality({
      appName: 'parent',
      output,
    });

    logalityParent.pipe(logalityChild);

    const spy = jest.spyOn(process.stdout, 'write');

    await logalityChild.get()('info', 'hello world');

    expect(output).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(output.mock.calls[0][0]).toMatchSnapshot();
    // Second argument "isPiped" should be true
    expect(output.mock.calls[0][1]).toBeTrue();
    expect(spy.mock.calls[0][0]).toMatchSnapshot();
    spy.mockRestore();
  });
  test('Piped async child with no return custom output will not go through synch parent custom output', async () => {
    const logalityChild = new Logality({
      appName: 'child',
      async: true,
      output: async () => {
        await cooldown();
      },
    });

    const output = jest.fn((logContext) => logContext);
    const logalityParent = new Logality({
      appName: 'parent',
      output,
    });

    logalityParent.pipe(logalityChild);

    const spy = jest.spyOn(process.stdout, 'write');

    await logalityChild.get()('info', 'hello piko world');

    expect(output).toHaveBeenCalledTimes(0);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test("Parent's middleware will receive the piped child messages", () => {
    const output = jest.fn((logContext) => logContext);
    const middleware = jest.fn();
    const logalityChild = new Logality({ appName: 'child' });
    const logalityParent = new Logality({
      appName: 'parent',
      output,
    });

    logalityParent.pipe(logalityChild);
    logalityParent.use(middleware);

    logalityChild.get()('info', 'hello world');

    expect(output).toHaveBeenCalledTimes(1);
    expect(middleware).toHaveBeenCalledTimes(1);
    const logContext = middleware.mock.calls[0][0];
    expect(logContext.context.runtime.application).toEqual('child');
    expect(logContext).toMatchSnapshot();
    // Second argument "isPiped" should be true
    expect(output.mock.calls[0][1]).toBeTrue();
  });

  test('Will pipe three logality instances to another in chain', () => {
    const output = jest.fn((logContext) => logContext);
    const outputGrand = jest.fn((logContext) => logContext);
    const logalityChild = new Logality({
      appName: 'child',
    });
    const logalityParent = new Logality({
      appName: 'parent',
      output,
    });
    const logalityGrandParent = new Logality({
      appName: 'grandParent',
      output: outputGrand,
    });

    logalityParent.pipe(logalityChild);
    logalityGrandParent.pipe(logalityParent);

    logalityChild.get()('info', 'hello world');

    expect(output).toHaveBeenCalledTimes(1);
    expect(outputGrand).toHaveBeenCalledTimes(1);
    expect(output.mock.calls[0][0]).toMatchSnapshot();
    expect(outputGrand.mock.calls[0][0]).toMatchSnapshot();
    // Second argument "isPiped" should be true
    expect(output.mock.calls[0][1]).toBeTrue();
    // Second argument "isPiped" should be true
    expect(outputGrand.mock.calls[0][1]).toBeTrue();
  });
});
