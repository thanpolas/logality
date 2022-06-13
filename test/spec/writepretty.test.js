/**
 * @fileoverview Test writePretty function.
 */
const Logality = require('../..');

const { infoLogFix, errorLogFix } = require('../fixtures/log-samples.fix');
const { stubLogality } = require('../lib/tester.lib');

describe('writePretty function', () => {
  stubLogality();

  test('Will convert log to pretty for into type', () => {
    const logality = new Logality({
      appName: 'testLogality',
    });

    const prettyLogInfo = logality.writePretty(infoLogFix());
    expect(prettyLogInfo).toMatchSnapshot();
  });

  test('Will convert log to pretty for into type without colors', () => {
    const logality = new Logality({
      appName: 'testLogality',
    });

    const prettyLogInfo = logality.writePretty(infoLogFix(), { noColor: true });
    expect(prettyLogInfo).toMatchSnapshot();
  });

  test('Will convert log to pretty for error type', () => {
    const logality = new Logality({
      appName: 'testLogality',
    });

    const prettyLogInfo = logality.writePretty(errorLogFix());
    expect(prettyLogInfo).toMatchSnapshot();
  });

  test('writePretty() should not mutate passed log context', () => {
    const logality = new Logality({
      appName: 'testLogality',
    });

    const errorLogContext = errorLogFix();
    logality.writePretty(errorLogContext);

    expect(errorLogContext).toEqual(errorLogFix());
  });

  test('Will convert log to pretty for error type without colors', () => {
    const logality = new Logality({
      appName: 'testLogality',
    });

    const prettyLogInfo = logality.writePretty(errorLogFix(), {
      noColor: true,
    });
    expect(prettyLogInfo).toMatchSnapshot();
  });
});
