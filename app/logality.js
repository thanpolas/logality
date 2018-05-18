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

const pino = require('pino');

const ALLOWED_LEVELS = [
  'debug',
  'info',
  'notice',
  'warn',
  'error',
  'critical',
  'alert',
  'emergency',
];

/** @type {string} Get the Current Working Directory of the app */
const CWD = process.cwd();

/**
 * Initialize the logging service, configures pino.
 *
 * @param {Object} opts Set of options to configure Logality:
 *   @param {string} appName The application name to log.
 *   @param {string} hostname The application's hostname to log.
 *   @param {Function} wstream Writable stream to output logs to, default stdout.
 */
const Logality = module.exports = function (opts = {}) {
  // Force instantiation
  if (!(this instanceof Logality)) {
    return new Logality(opts);
  }

  /** @type {?pino} pino library instance */
  this._pinoLogger = null;

  /** @type {Object} Logality configuration */
  this._opts = {
    appName: opts.appName || 'Logality',
    hostname: opts.hostname || 'localhost',
    wstream: opts.wstream || null,
  };


  // Instantiate pino
  this._pinoLogger = pino({
    // convert timestamp to ISO8061
    timestamp() {
      const dt = new Date();
      return `, "dt": "${dt.toISOString()}"`;
    },
  }, this._opts.wstream);

  // Add new log levels
  this._pinoLogger.addLevel('notice', 35);
  this._pinoLogger.addLevel('critical', 61);
  this._pinoLogger.addLevel('alert', 70);
  this._pinoLogger.addLevel('emergency', 80);


  //
  // hack pino event output.
  //
  // By default pino will output "level" as an integer and there is no way
  // to change that, with this hack we alter the
  // "log level string cache" that pino uses to produce the level output
  Object.defineProperty(this._pinoLogger, '_lscache', {
    value: {
      10: '{"level": "trace"',
      20: '{"level": "debug"',
      30: '{"level": "info"',
      35: '{"level": "notice"',
      40: '{"level": "warn"',
      50: '{"level": "error"',
      60: '{"level": "fatal"',
      61: '{"level": "critical"',
      70: '{"level": "alert"',
      80: '{"level": "emergency"',
    },
  });

  // similarly, overwrite the "end" string that gets appended on all logs
  // and adds the: "v": 1 string which we do not need.
  this._pinoLogger.end = '}\n';

  // Reset the pino "chindings" which contain duplicated info about
  // "pid" and "hostname"
  this._pinoLogger.chindings = '';
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
  return this.log.bind(this, filePath);
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
  if (ALLOWED_LEVELS.indexOf(level) === -1) {
    throw new Error('Invalid log level');
  }

  const logContext = {
    message,
    context: {
      runtime: {
        application: this._opts.appName,
        file: filePath,
      },
      source: {
        file_name: filePath,
      },
    },
    event: {},
  };

  this._assignSystem(logContext);

  if (context && context.user) {
    this._assignUser(logContext, context.user);
  }

  if (context && context.error) {
    this._assignError(logContext, context.error);
  }

  if (context && context.req) {
    this._assignRequest(logContext, context.req);
  }

  if (context && context.custom) {
    logContext.context.custom = context.custom;
  }

  this._pinoLogger[level](logContext);
};

/**
 * Assign system-wide details.
 *
 * @param {Object} logContext The log record context.
 * @private
 */
Logality.prototype._assignSystem = function (logContext) {
  logContext.context.system = {
    hostname: this._opts.hostname,
    pid: this._getPid(),
    process_name: process.argv[0],
  };
};

/**
 * Returns the current process id, made a method for easier stubing while testing.
 *
 * @return {number} The pid.
 * @private
 */
Logality.prototype._getPid = function () {
  return process.pid;
};

/**
 * Assigns log-schema properties to the logContext for the given UDO.
 *
 * @param {Object} logContext The log record context.
 * @param {Object} user The UDO.
 * @private
 */
Logality.prototype._assignUser = function (logContext, user) {
  logContext.context.user = {
    id: user.id,
    email: user.email,
    type: null, // User type
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

/**
 * Assigns a JS native Error Object into log-schema.
 *
 * @param {Object} logContext The log record context.
 * @param {Error} error Javascript Error Object.
 * @private
 */
Logality.prototype._assignError = function (logContext, error) {
  logContext.event.error = {
    name: error.name,
    message: error.message,
    backtrace: [],
  };

  // go through the stack
  if (!error.stack) {
    return;
  }

  error.stack.split('\n').forEach(function (stackLine, index) {
    // ignore first line
    if (index === 0) {
      return;
    }
    // split each stack trace line into parts based on space
    const stackParts = stackLine.trim().split(' ');
    if (!stackParts[1]) {
      return;
    }

    // Check for edge cases were function name is not set
    if (!stackParts[2]) {
      logContext.event.error.backtrace.push(stackParts[1]);
      return;
    }

    // remove leading and trailing parentheses
    const fileRaw = stackParts[2].substr(1, stackParts[2].length - 2);
    const fileParts = fileRaw.split(':');

    const traceLogItem = {
      file: fileParts[0],
      function: stackParts[1],
      line: `${fileParts[1]}:${fileParts[2]}`, // combine line and charpos
    };

    logContext.event.error.backtrace.push(traceLogItem);
  });
};

/**
 * Assign Express Request values and properties.
 *
 * @param {Object} logContext The log record context.
 * @param {Express.req} req Express Request Object.
 * @private
 */
Logality.prototype._assignRequest = function (logContext, req) {
  logContext.event.http_request = {
    headers: req.header,
    host: req.hostname,
    method: req.method,
    path: req.path,
    query_string: JSON.stringify(req.query),
    scheme: req.secure ? 'https' : 'http',
  };
};

