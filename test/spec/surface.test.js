/**
 * @fileoverview Test the API surface, library properly exporting methods.
 */
const Logality = require('../..');
const { stubLogality } = require('../lib/tester.lib');

describe('API Surface', () => {
  test('Logality is a function', () => {
    expect(Logality).toBeFunction();
  });
  test('Logality instantiates properly', () => {
    const logality = new Logality();
    expect(logality.get).toBeFunction();
  });
  test('Logality instantiates without the "new" keyword', () => {
    const logality = Logality();
    expect(logality.get).toBeFunction();
  });
  test('Logality instance has expected methods exported', () => {
    const logality = Logality();
    expect(logality.get).toBeFunction();
    expect(logality.log).toBeFunction();
    expect(logality.pipe).toBeFunction();
    expect(logality.use).toBeFunction();
  });
  test('Will throw error if objectMode is enabled without output defined', () => {
    const options = {
      objectMode: true,
    };

    expect(Logality.bind(null, options)).toThrowError();
  });

  describe('Logging Function Levels', () => {
    stubLogality();

    test('Testing log level: debug', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        output: (logMessage) => {
          expect(logMessage).toMatchSnapshot();
          done();
        },
      });

      const log = logality.get();

      log.debug('hello world');
    });
    test('Testing log level: info', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        output: (logMessage) => {
          expect(logMessage).toMatchSnapshot();
          done();
        },
      });

      const log = logality.get();

      log.info('hello world');
    });
    test('Testing log level: notice', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        output: (logMessage) => {
          expect(logMessage).toMatchSnapshot();
          done();
        },
      });

      const log = logality.get();

      log.notice('hello world');
    });
    test('Testing log level: warn', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        output: (logMessage) => {
          expect(logMessage).toMatchSnapshot();
          done();
        },
      });

      const log = logality.get();

      log.warn('hello world');
    });
    test('Testing log level: error', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        output: (logMessage) => {
          expect(logMessage).toMatchSnapshot();
          done();
        },
      });

      const log = logality.get();

      log.error('hello world');
    });
    test('Testing log level: critical', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        output: (logMessage) => {
          expect(logMessage).toMatchSnapshot();
          done();
        },
      });

      const log = logality.get();

      log.critical('hello world');
    });
    test('Testing log level: alert', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        output: (logMessage) => {
          expect(logMessage).toMatchSnapshot();
          done();
        },
      });

      const log = logality.get();

      log.alert('hello world');
    });
    test('Testing log level: emergency', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        output: (logMessage) => {
          expect(logMessage).toMatchSnapshot();
          done();
        },
      });

      const log = logality.get();

      log.emergency('hello world');
    });
  });
});
