/**
 * @fileOverview Test the API surface, library properly exporting methods.
 */
const sinon = require('sinon');
const os = require('os');

const Logality = require('../..');
const { sink } = require('../lib/tester.lib');

describe('API Surface', () => {
  test('Logality is a function', () => {
    expect(typeof Logality).toBe('function');
  });
  test('Logality instantiates properly', () => {
    const logality = new Logality();
    expect(typeof logality.get).toBe('function');
  });
  test('Logality instantiates without the "new" keyword', () => {
    const logality = Logality();
    expect(typeof logality.get).toBe('function');
  });
  test('Logality instance has expected methods exported', () => {
    const logality = Logality();

    expect(typeof logality.get).toBe('function');
    expect(typeof logality.log).toBe('function');
  });

  describe('Logging Function Levels', () => {
    let dateStub;
    let processStub;
    let hostnameStub;

    beforeEach(() => {
      dateStub = sinon.stub(Date.prototype, 'toISOString');
      processStub = sinon.stub(Logality.prototype, '_getPid');
      hostnameStub = sinon.stub(os, 'hostname');
      hostnameStub.returns('localhost');
      dateStub.returns('2018-05-18T16:25:57.815Z');
      processStub.returns(36255);
    });

    afterEach(() => {
      hostnameStub.restore();
      dateStub.restore();
      processStub.restore();
    });

    test('Testing log level: debug', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        wstream: sink((chunk) => {
          expect(chunk).toMatchSnapshot();
          done();
        }),
      });

      const log = logality.get();

      log.debug('hello world');
    });
    test('Testing log level: info', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        wstream: sink((chunk) => {
          expect(chunk).toMatchSnapshot();
          done();
        }),
      });

      const log = logality.get();

      log.info('hello world');
    });
    test('Testing log level: notice', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        wstream: sink((chunk) => {
          expect(chunk).toMatchSnapshot();
          done();
        }),
      });

      const log = logality.get();

      log.notice('hello world');
    });
    test('Testing log level: warn', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        wstream: sink((chunk) => {
          expect(chunk).toMatchSnapshot();
          done();
        }),
      });

      const log = logality.get();

      log.warn('hello world');
    });
    test('Testing log level: error', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        wstream: sink((chunk) => {
          expect(chunk).toMatchSnapshot();
          done();
        }),
      });

      const log = logality.get();

      log.error('hello world');
    });
    test('Testing log level: critical', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        wstream: sink((chunk) => {
          expect(chunk).toMatchSnapshot();
          done();
        }),
      });

      const log = logality.get();

      log.critical('hello world');
    });
    test('Testing log level: alert', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        wstream: sink((chunk) => {
          expect(chunk).toMatchSnapshot();
          done();
        }),
      });

      const log = logality.get();

      log.alert('hello world');
    });
    test('Testing log level: emergency', (done) => {
      const logality = new Logality({
        appName: 'testLogality',
        wstream: sink((chunk) => {
          expect(chunk).toMatchSnapshot();
          done();
        }),
      });

      const log = logality.get();

      log.emergency('hello world');
    });
  });
});
