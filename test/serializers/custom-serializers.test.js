/**
 * @fileoverview Test custom serializers.
 */
const Logality = require('../../app/logality');
const { stubLogality } = require('../lib/tester.lib');

const DATA = {
  id: 12,
  property: 'zero',
  value: 0.23,
};

describe('Custom Serializers', () => {
  stubLogality();

  test('The build-in custom serializer', () => {
    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      output: (logMessage) => {
        expect(logMessage).toBeObject();
        expect(logMessage).toMatchSnapshot();
        outputDone = true;
      },
    });

    const log = logality.get();

    log('info', 'hello world', { custom: { a: 1, b: 2 } });
    expect(outputDone).toBeTrue();
  });

  test('Will log custom serializer on context', () => {
    const serializers = {
      zit: (data) => {
        return {
          path: 'context.zit',
          value: data,
        };
      },
    };

    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      serializers,
      output: (logMessage) => {
        expect(logMessage).toMatchSnapshot();
        outputDone = true;
      },
    });

    const log = logality.get();

    log('info', 'hello world', { zit: DATA });
    expect(outputDone).toBeTrue();
  });

  test('Will log custom serializer on root', () => {
    const serializers = {
      zit: (data) => {
        return {
          path: 'zit',
          value: data,
        };
      },
    };

    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      serializers,
      output: (logMessage) => {
        expect(logMessage).toMatchSnapshot();
        outputDone = true;
      },
    });

    const log = logality.get();

    log('info', 'hello world', { zit: DATA });
    expect(outputDone).toBeTrue();
  });
});
