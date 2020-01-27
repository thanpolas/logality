/**
 * Logality
 * Alacrity custom logger for Node.js
 * https://github.com/alacrity-law/logality
 *
 * Copyright © Alacrity Law Limited
 * All rights reserved.
 */

/**
 * @fileOverview bootstrap and master exporting module.
 */

const os = require('os');

const assign = require('lodash.assign');

const writePretty = require('./pretty-print');
const utils = require('./utils');

const userSerializer = require('./serializers/user.serializer');
const errorSerializer = require('./serializers/error.serializer');
const reqSerializer = require('./serializers/express-request.serializer');
const customSerializer = require('./serializers/custom.serializer');

/** @constant {Array.<string>} ALLOWED_LEVELS All levels, sequence MATTERS */
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
 *   @param {string} appName The application name to log.
 *   @param {Function} wstream Writable stream to output logs to, default stdout.
 */
const Logality = module.exports = function (opts = {}) {
  // Force instantiation
  if (!(this instanceof Logality)) {
    return new Logality(opts);
  }

  /** @type {Object} Logality configuration */
  this._opts = {
    appName: opts.appName || 'Logality',
    prettyPrint: opts.prettyPrint || false,
  };

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

  /** @type {Stream} The output writable stream */
  this._stream = opts.wstream || process.stdout;
};

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
 * @param {string} filePath The path to the logging module.
 * @param {enum} level The level of the log.
 * @param {string} message Human readable log message.
 * @param {Object|null} context Extra data to log.
 */
Logality.prototype.log = function (filePath, level, message, context) {
  const levelSeverity = ALLOWED_LEVELS.indexOf(level);
  if (levelSeverity === -1) {
    throw new Error('Invalid log level');
  }

  const logContext = {
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

  this._assignSystem(logContext);

  this._applySerializers(logContext, context);

  this._write(logContext);
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
      utils.assignPath(res.path, logContext, res.value);
    }
  }, this);
};

/**
 * Return an ISO8601 formated date.
 *
 * @return {string}
 * @private
 */
Logality.prototype._getDt = function () {
  const dt = new Date();
  return dt.toISOString();
};

/**
 * Write raw log to selected output.
 *
 * @param {Object} logContext The log context to write.
 * @private
 */
Logality.prototype._writeRaw = function (logContext) {
  let strLogContext = JSON.stringify(logContext);
  strLogContext += '\n';
  this._stream.write(strLogContext);
};

/**
 * Write log to selected output.
 *
 * @param {Object} logContext The log context to write.
 * @private
 */
Logality.prototype._write = function (logContext) {
  if (this._opts.prettyPrint) {
    const output = writePretty(logContext);
    this._stream.write(output);
  } else {
    this._writeRaw(logContext);
  }
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
