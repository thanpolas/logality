/**
 * @fileoverview Test custom serializers.
 */
const Logality = require('../../app/logality');
const { sink, stubLogality } = require('../lib/tester.lib');

const DATA = {
  id: 12,
  property: 'zero',
  value: 0.23,
};

describe('Custom Serializers', () => {
  stubLogality();

  test('Will log custom serializer on context', done => {
    const serializers = {
      zit: data => {
        return {
          path: 'context.zit',
          value: data,
        };
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

  test('Will log custom serializer on root', done => {
    const serializers = {
      zit: data => {
        return {
          path: 'zit',
          value: data,
        };
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
