/**
 * @fileoverview Test the pipe interface.
 */

const Logality = require('../..');
const { stubLogality, cooldown } = require('../lib/tester.lib');

describe('pipe interface', () => {
  stubLogality();
  test('Will pipe one logality instance to another', () => {
    let outputDone = false;
    const logalityChild = new Logality();
    const logalityParent = new Logality({
      output: (logMessage) => {
        expect(logMessage).toMatchSnapshot();
        outputDone = true;
      },
    });

    logalityParent.pipe(logalityChild);
    logalityChild.get().log('hello world');
    expect(outputDone).toBeTrue();
  });

  test('Will pipe multiple logality instances to a single one', () => {
    const logalityChild1 = new Logality();
    const logalityChild2 = new Logality();
    const logalityChild3 = new Logality();

    const mockOut = jest.fn();

    const logalityParent = new Logality({
      output: mockOut,
    });

    logalityParent.pipe([logalityChild1, logalityChild2, logalityChild3]);
    logalityChild1.get().log('hello world 1');
    logalityChild2.get().log('hello world 2');
    logalityChild3.get().log('hello world 3');

    expect(mockOut).toHaveBeenCalledTimes(3);
  });
  test('Will pipe logality instance with custom output and objectMode', () => {
    const logalityChild = new Logality({
      objectMode: true,
      output: (logMessage) => {
        return JSON.stringify(logMessage);
      },
    });

    const output = jest.fn();
    const logalityParent = new Logality({
      output,
    });

    logalityParent.pipe(logalityChild);

    logalityChild.get().log('hello world');

    expect(output).toHaveBeenCalled();
    expect(output).toHaveBeenLastCalledWith('');
  });
  test('Will pipe logality instance with async custom output and objectMode', async () => {
    const logalityChild = new Logality({
      objectMode: true,
      async: true,
      output: async (logMessage) => {
        await cooldown();
        return JSON.stringify(logMessage);
      },
    });

    const output = jest.fn();
    const logalityParent = new Logality({
      output,
    });

    logalityParent.pipe(logalityChild);

    await logalityChild.get().log('hello world');

    expect(output).toHaveBeenCalled();
    expect(output).toHaveBeenLastCalledWith('');
  });
});
