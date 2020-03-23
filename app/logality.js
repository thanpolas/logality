/* eslint-disable security/detect-object-injection */
/**
 * Logality
 * Extensible JSON Logger.
 * https://github.com/thanpolas/logality
 *
 * Copyright © Thanasis Polychronakis
 * All rights reserved. Licensed under the ISC license.
 */

/**
 * @fileoverview bootstrap and master exporting module.
 */

/**
 * Custom JSDoc Type definitions
 */

/**
 * The logality instance.
 *
 * @typedef {(Object)} Logality
 */

/**
 * A writable stream.
 *
 * @typedef {(Object)} WriteStream
 */

const os = require('os');

const assign = require('lodash.assign');
const middlewarify = require('middlewarify');

const fn = require('./functions');
const prettyPrint = require('./pretty-print');
const utils = require('./utils');
const { version } = require('../package.json');

const userSerializer = require('./serializers/user.serializer');
const errorSerializer = require('./serializers/error.serializer');
const reqSerializer = require('./serializers/express-request.serializer');
const customSerializer = require('./serializers/custom.serializer');

/** @const {Array.<string>} ALLOWED_LEVELS All levels, sequence MATTERS */
const ALLOWED_LEVELS = [
  'emergency', // Syslog level 0
  'alert', // Syslog level 1
  'critical', // Syslog level 2
  'error', // Syslog level 3
  'warn', // Syslog level 4
  'notice', // Syslog level 5
  'info', // Syslog level 6
  'debug', // Syslog level 7
];

/** @type {string} Get the Current Working Directory of the app */
const CWD = process.cwd();

/**
 * The Logality Class
 *
 */
class Logality {
  /**
   * Initialize the logging service
   *
   * @param {Object} opts Set of options to configure Logality:
   * @param {string=} opts.appName The application name to log.
   * @param {function=} opts.output Overwrite the final output operation.
   * @param {boolean=} opts.async Use Asynchronous API returning a promise
   *    on writes.
   * @param {boolean=} opts.prettyPrint Enable pretty print to stdout,
   *    default false.
   * @return {Logality} Logality instance.
   */
  constructor(opts = {}) {
    // Force instantiation
    if (!(this instanceof Logality)) {
      return new Logality(opts);
    }

    /** @type {string} Store the current logality version */
    this._version = version;

    /** @type {boolean} indicates if the current instance is piped to a parent */
    this._isPiped = false;

    /** @type {?Logality} stores the parent logality instance when piped */
    this._parentLogality = null;

    const outputHandler = opts.output || fn.returnArg;

    /** @type {Object} Logality configuration */
    this._opts = {
      appName: opts.appName || 'Logality',
      prettyPrint: opts.prettyPrint || false,
      async: opts.async || false,
    };

    // Create Middleware functionality
    middlewarify.make(this, '_middleware', outputHandler, {
      async: this._opts.async,
    });
    this.use = this._middleware.use;

    /** @type {Object} Logality serializers */
    this._serializers = {
      user: userSerializer,
      error: errorSerializer,
      req: reqSerializer,
      custom: customSerializer,
    };

    if (opts.serializers) {
      this._serializers = assign(this._serializers, opts.serializers);
    }

    /** @type {string} Cache the hostname */
    this._hostname = os.hostname();
  }

  /**
   * Get a logger and hard-assign the filepath location of the invoking
   * module to populate with the rest of the log data.
   *
   * Do not reuse loggers returned from this function in multiple modules.
   *
   * @return {Logality.log} The log method partialed with the filePath of the
   *   invoking module.
   */
  get() {
    const filePath = this._getFilePath();

    // Do a partial application on log and return it.
    const partialedLog = this.log.bind(this, filePath);

    // Attach log levels as methods
    ALLOWED_LEVELS.forEach((level) => {
      partialedLog[level] = this.log.bind(this, filePath, level);
    });

    return partialedLog;
  }

  /**
   * The main logging method.
   *
   * @param {string} filePath Path of module that the log originated from.
   * @param {string} level The level of the log.
   * @param {string} message Human readable log message.
   * @param {Object|null} context Extra data to log.
   * @return {Promise|void} Returns promise when async opt is enabled.
   */
  log(filePath, level, message, context) {
    const levelSeverity = ALLOWED_LEVELS.indexOf(level);
    if (levelSeverity === -1) {
      throw new Error('Invalid log level');
    }

    const logContext = fn.getContext(
      level,
      levelSeverity,
      message,
      filePath,
      this._opts.appName,
    );

    fn.assignSystem(logContext, this._hostname);

    this._applySerializers(logContext, context);
    return this.invokeOutput(logContext);
  }

  /**
   * Invokes any defined middleware and the output methods, custom or built-in
   * depending on configuration.
   *
   * @param {Object} logContext The log context.
   * @return {Promise|void} Returns promise when async opt is enabled.
   */
  invokeOutput(logContext) {
    // run Middleware, they can mutate the logContext.
    const result = this._middleware(logContext);

    if (this._opts.async) {
      return this._handleAsync(result);
    }

    this._handleOutput(result);
  }

  /**
   * Pipes output of other logality instances to this one.
   *
   * @param {Logality|Array<Logality>} logality Single or multiple logality
   *    instances.
   */
  pipe(logality) {
    let logalities = [];

    if (Array.isArray(logality)) {
      logalities = logality;
    } else {
      logalities.push(logality);
    }

    logalities.forEach((logalityInstance) => {
      if (!logalityInstance._version) {
        throw new Error('Argument passed not a Logality instance');
      }

      logalityInstance.youArePiped(this);
    });
  }

  /**
   * Internal method that's invoked by the parent logality instance when
   * pipe() method is used, instructs the current logality instance to pipe
   * the LogContext to the parent.
   *
   * @param {Logality} parentLogality The parent logality.
   */
  youArePiped(parentLogality) {
    if (!parentLogality._version) {
      throw new Error(
        'Argument passed for youArePiped() not a Logality instance',
      );
    }
    if (this._isPiped) {
      throw new Error('This instance is already piped to another parent');
    }
    this._isPiped = true;
    this._parentLogality = parentLogality;
  }

  /**
   * Handles asynchronous output of the log context.
   *
   * @param {Promise<Object|string|void>} prom Promise outcome of custom output
   *    or logContext.
   * @return {Promise} A Promise.
   * @private
   */
  async _handleAsync(prom) {
    this._handleOutput(await prom);
  }

  /**
   * Final output handler method, determines if the log message needs
   * further processing or output to standard out.
   *
   * @param {Object|string|void} result Outcome of custom output or logContext.
   */
  _handleOutput(result) {
    if (this._isPiped) {
      this.parentLogality.invokeOutput(result);
      return;
    }

    let logMessage;
    switch (typeof result) {
      case 'string':
        fn.output(result);
        break;
      case 'object':
        logMessage = this._getLogMessage(result);
        fn.output(logMessage);
        break;
      default:
        // no action
        break;
    }
  }

  /**
   * Apply serializers on context contents.
   *
   * @param {Object} logContext The log context to write.
   * @param {Object|null} context Extra data to log.
   */
  _applySerializers(logContext, context) {
    if (!context) {
      return;
    }

    const contextKeys = Object.keys(context);

    contextKeys.forEach(function (key) {
      if (this._serializers[key]) {
        const res = this._serializers[key](context[key]);

        if (Array.isArray(res)) {
          res.forEach(function (serial) {
            utils.assignPath(serial.path, logContext, serial.value);
          });
        } else {
          utils.assignPath(res.path, logContext, res.value);
        }
      }
    }, this);
  }

  /**
   * Determines the kind of output to be send downstream to the writable stream.
   *
   * If objectMode is enabled the log context is returned as is, otherwise
   * it gets serialized.
   *
   * @param {Object} logContext The log context to serialize to string.
   * @return {string} Log Message to be output.
   * @private
   */
  _getLogMessage(logContext) {
    let stringOutput = '';
    if (this._opts.prettyPrint) {
      stringOutput = prettyPrint.writePretty(logContext);
    } else {
      stringOutput = fn.masterSerialize(logContext);
    }

    return stringOutput;
  }

  /**
   * Get the relative filepath to the invoking module.
   *
   * @return {string} Relative filepath of callee.
   * @private
   */
  _getFilePath() {
    try {
      throw new Error();
    } catch (ex) {
      const stackLines = ex.stack.split('\n');

      // Select the invoking module from the stack trace lines.
      // This is highly arbitrary based on how / when this function
      // got invoked, however once set for a codebase it will remain constant.
      const invokerRaw = stackLines[3];

      const startSplit = invokerRaw.split('(');
      const finalSplit = startSplit[1].split(':');
      const invokerPath = finalSplit[0];

      // invokerPath now stores the full path, we need to extract the
      // relative path of the app which is the "root folder" of the app.
      const filePath = invokerPath.substr(CWD.length);

      return filePath;
    }
  }
}

module.exports = Logality;
