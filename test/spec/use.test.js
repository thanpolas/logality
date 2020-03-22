/**
 * @fileoverview Test the middleware interface.
 */

const Logality = require('../..');
const { stubLogality, cooldown } = require('../lib/tester.lib');

describe('Middleware interface', () => {
  stubLogality();
  test('Middleware will receive log context', () => {
    const logality = new Logality();

    let outputDone = false;
    logality.use((logContext) => {
      expect(logContext).toBeObject();
      expect(logContext).toMatchSnapshot();
      outputDone = true;
    });

    logality.get().log('hello world');
    expect(outputDone).toBeTrue();
  });
});
