/**
 * @fileoverview Test multi-key serializers.
 */
const Logality = require('../../app/logality');
const { sink, stubLogality } = require('../lib/tester.lib');

const DATA = {
  id: 12,
  property: 'zero',
  value: 0.23,
};

describe('Multi-Key Serializers', () => {
  stubLogality();

  test('Will log multi-key serializer on context', done => {
    const serializers = {
      zit: data => {
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

    const logality = new Logality({
      appName: 'testLogality',
      serializers,
      wstream: sink(chunk => {
        expect(chunk).toMatchSnapshot();
        done();
      }),
    });

    const log = logality.get();

    log('info', 'hello world', { zit: DATA });
  });
});
