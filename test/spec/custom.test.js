/**
 * @fileoverview Test logging of custom data objects.
 */
const Logality = require('../..');
const { sink, stubLogality } = require('../lib/tester.lib');

const DATA = {
  id: 10,
  email: 'one@go.com',
};

describe('Custom Serializer', () => {
  stubLogality();

  test('Will log custom data properly', done => {
    const logality = new Logality({
      appName: 'testLogality',
      wstream: sink(chunk => {
        expect(chunk).toMatchSnapshot();
        done();
      }),
    });

    const log = logality.get();

    log('info', 'hello world', { custom: DATA });
  });
});
