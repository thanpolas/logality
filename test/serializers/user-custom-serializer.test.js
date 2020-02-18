/**
 * @fileoverview Test custom user serializer
 */
const Logality = require('../../app/logality');
const { sink, stubLogality } = require('../lib/tester.lib');

const UDO_MOCK = {
  userId: 10,
  userEmail: 'one@go.com',
};

describe('Custom User Serializer', () => {
  stubLogality();

  test('Will log custom UDO', done => {
    const serializers = {
      user: udo => {
        return {
          path: 'context.user',
          value: {
            id: udo.userId,
            email: udo.userEmail,
          },
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

    log('info', 'hello world', { user: UDO_MOCK });
  });

  test('Will log custom UDO on custom path', done => {
    const serializers = {
      user: udo => {
        return {
          path: 'user',
          value: {
            id: udo.userId,
            email: udo.userEmail,
          },
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

    log('info', 'hello world', { user: UDO_MOCK });
  });
});
