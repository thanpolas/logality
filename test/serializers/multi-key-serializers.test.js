/**
 * @fileoverview Test multi-key serializers.
 */
const Logality = require('../../app/logality');
const { stubLogality } = require('../lib/tester.lib');

const DATA = {
  id: 12,
  property: 'zero',
  value: 0.23,
};

describe('Multi-Key Serializers', () => {
  stubLogality();

  test('Will log multi-key serializer on context', () => {
    const serializers = {
      zit: (data) => {
        return [
          {
            path: 'context.zit',
            value: data,
          },
          {
            path: 'context.nit',
            value: data,
          },
          {
            path: 'rootpath',
            value: data,
          },
        ];
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
