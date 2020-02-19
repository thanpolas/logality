/**
 * @fileoverview Test object mode of logging.
 */

const writeStream = require('flush-write-stream');

const Logality = require('../..');
const { stubLogality } = require('../lib/tester.lib');

describe('objectMode Logging', () => {
  stubLogality();

  test('Will return the Logging object', done => {
    const logality = new Logality({
      appName: 'testLogality',
      objectMode: true,
      wstream: writeStream.obj(chunk => {
        expect(typeof chunk).toEqual('object');
        expect(chunk).toMatchSnapshot();
        done();
      }),
    });

    const log = logality.get();

    log('info', 'hello world');
  });
});
