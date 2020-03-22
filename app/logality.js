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

const prettyPrint = require('./pretty-print');
const utils = require('./utils');

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
 * Initialize the logging service
 *
 * @param {Object} opts Set of options to configure Logality:
 * @param {string=} opts.appName The application name to log.
 * @param {function=} opts.output Overwrite the final output operation.
 * @param {boolean=} opts.async Use Asynchronous API returning a promise
 *    on writes.
 * @param {boolean=} opts.objectMode Set to true to have logality transmit
 *    the logging objects unserialized, as native JS Objects.
 * @return {Logality} Logality instance.
 */
const Logality = (module.exports = function (opts = {}) {
  // Force instantiation
  if (!(this instanceof Logality)) {
    return new Logality(opts);
  }

  if (opts.objectMode && typeof opts.output !== 'function') {
    throw new Error('Must defined "output" handler when objectMode is enabled');
  }

  const outputFn = opts.output || this._getOutput.bind(this);

  /** @type {Object} Logality configuration */
  this._opts = {
    appName: opts.appName || 'Logality',
    prettyPrint: opts.prettyPrint || false,
    async: opts.async || false,
    objectMode: opts.objectMode || false,
  };

  middlewarify.make(this._opts, 'output', outputFn, {
    async: this._opts.async,
  });

  this.use = this._opts.output.use;

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
});

/**
 * Get a logger and hard-assign the filepath location of the invoking
 * module to populate with the rest of the log data.
 *
 * Do not reuse loggers returned from this function in multiple modules.
 *
 * @return {Logality.log} The log method partialed with the filePath of the
 *   invoking module.
 */
Logality.prototype.get = function () {
  const filePath = this._getFilePath();

  // Do a partial application on log and return it.
  const partialedLog = this.log.bind(this, filePath);

  // Attach log levels as methods
  ALLOWED_LEVELS.forEach((level) => {
    partialedLog[level] = this.log.bind(this, filePath, level);
  });

  return partialedLog;
};

/**
 * The main logging method.
 *
 * @param {string} filePath Path of module that the log originated from.
 * @param {string} level The level of the log.
 * @param {string} message Human readable log message.
 * @param {Object|null} context Extra data to log.
 * @return {Promise|void} Returns promise when async opt is enabled.
 */
Logality.prototype.log = function (filePath, level, message, context) {
  const levelSeverity = ALLOWED_LEVELS.indexOf(level);
  if (levelSeverity === -1) {
    throw new Error('Invalid log level');
  }

  const logContext = this._getContext(level, levelSeverity, message, filePath);

  this._assignSystem(logContext);

  this._applySerializers(logContext, context);

  if (this._opts.async) {
    return this._handleAsync(logContext);
  }

  const logMessage = this._opts.output(logContext);

  if (typeof logMessage === 'string') {
    this._write(logMessage);
  }
};

/**
 * Handles asynchronous output of the log context.
 *
 * @param {Object} logContext The log context.
 * @return {Promise} A Promise.
 * @private
 */
Logality.prototype._handleAsync = async (logContext) => {
  const logMessage = await this._opts.output(logContext);

  if (typeof logMessage === 'string') {
    this._write(logMessage);
  }
};

/**
 * This is where Log Contexts are born, isn't that cute?
 *
 * @param {string} level The level of the log.
 * @param {number} levelSeverity The level expressed in an index.
 * @param {string} message Human readable log message.
 * @param {string} filePath Path of module that the log originated from.
 * @return {Object} The log Context.
 * @private
 */
Logality.prototype._getContext = (level, levelSeverity, message, filePath) => {
  return {
    level,
    severity: levelSeverity,
    dt: this._getDt(),
    message,
    context: {
      runtime: {
        application: this._opts.appName,
      },
      source: {
        file_name: filePath,
      },
    },
    event: {},
  };
};

/**
 * Apply serializers on context contents.
 *
 * @param {Object} logContext The log context to write.
 * @param {Object|null} context Extra data to log.
 */
Logality.prototype._applySerializers = function (logContext, context) {
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
};

/**
 * Return an ISO8601 formatted date.
 *
 * @return {string} The formatted date.
 * @private
 */
Logality.prototype._getDt = function () {
  const dt = new Date();
  return dt.toISOString();
};

/**
 * Write log to process standard out.
 *
 * @param {string} logMessage The log context to write.
 * @private
 */
Logality.prototype._write = function (logMessage) {
  this._stream.write(logMessage);
};

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
Logality.prototype._getOutput = function (logContext) {
  let stringOutput = '';
  if (this._opts.prettyPrint) {
    stringOutput = prettyPrint.writePretty(logContext);
  } else {
    stringOutput = this._masterSerialize(logContext);
  }

  return stringOutput;
};

/**
 * Master serializer of object to be written to the output stream, basically
 * stringifies to JSON and adds a newline at the end.
 *
 * @param {Object} logContext The log context to write.
 * @return {string} Serialized message to output.
 * @private
 */
Logality.prototype._masterSerialize = function (logContext) {
  let strLogContext = JSON.stringify(logContext);
  strLogContext += '\n';

  return strLogContext;
};

/**
 * Assign system-wide details.
 *
 * @param {Object} logContext The log record context.
 * @private
 */
Logality.prototype._assignSystem = function (logContext) {
  logContext.context.system = {
    hostname: this._hostname,
    pid: utils.getProcessId(),
    process_name: utils.getProcessName(),
  };
};

/**
 * Get the relative filepath to the invoking module.
 *
 * @return {string} Relative filepath of callee.
 * @private
 */
Logality.prototype._getFilePath = function () {
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
};
