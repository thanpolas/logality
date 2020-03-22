/**
 * @fileoverview Test custom user serializer
 */
const Logality = require('../../app/logality');
const { stubLogality } = require('../lib/tester.lib');

const UDO_MOCK = {
  userId: 10,
  userEmail: 'one@go.com',
};

describe('Custom User Serializer', () => {
  stubLogality();

  test('Will log custom UDO', () => {
    const serializers = {
      user: (udo) => {
        return {
          path: 'context.user',
          value: {
            id: udo.userId,
            email: udo.userEmail,
          },
        };
      },
    };

    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      serializers,
      output: (chunk) => {
        expect(chunk).toMatchSnapshot();
        outputDone = true;
      },
    });

    const log = logality.get();

    log('info', 'hello world', { user: UDO_MOCK });
    expect(outputDone).toBeTrue();
  });

  test('Will log custom UDO on custom path', () => {
    const serializers = {
      user: (udo) => {
        return {
          path: 'user',
          value: {
            id: udo.userId,
            email: udo.userEmail,
          },
        };
      },
    };

    let outputDone = false;
    const logality = new Logality({
      appName: 'testLogality',
      serializers,
      output: (chunk) => {
        expect(chunk).toMatchSnapshot();
        outputDone = true;
      },
    });

    const log = logality.get();

    log('info', 'hello world', { user: UDO_MOCK });
    expect(outputDone).toBeTrue();
  });
});
