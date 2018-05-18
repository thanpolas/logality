/**
 * Logala
 * Alacrity custom logger for Node.js
 * https://github.com/alacrity-law/logala
 *
 * Copyright © Alacrity Law Limited
 * All rights reserved.
 */


/**
 * @fileOverview bootstrap and master exporting module.
 */

const pino = require('pino');

const logala = module.exports = {};

/** @type {?pino} pino library instance */
logala._pinoLogger = null;

/** @type {Object} Logala configuration */
logala._opts = {};

const allowedLevels = [
  'debug',
  'info',
  'notice',
  'warn',
  'error',
  'critical',
  'alert',
  'emergency',
];

/**
 * Initialize the logging service, configures pino.
 *
 * @param {Object} opts Set of options to configure logala:
 *   @param {string} appName The application name to log.
 */
logala.init = function (opts) {
  // Set options
  logala._opts.appName = opts.appName || 'logala';
  logala._opts.hostname = opts.hostname || 'localhost';

  // Instantiate pino
  logala._pinoLogger = pino({
    // convert timestamp to ISO8061
    timestamp() {
      const dt = new Date();
      return `, "dt": "${dt.toISOString()}"`;
    },
  });

  // Add new log levels
  logala._pinoLogger.addLevel('notice', 35);
  logala._pinoLogger.addLevel('critical', 61);
  logala._pinoLogger.addLevel('alert', 70);
  logala._pinoLogger.addLevel('emergency', 80);


  //
  // hack pino event output.
  //
  // By default pino will output "level" as an integer and there is no way
  // to change that, with this hack we alter the
  // "log level string cache" that pino uses to produce the level output
  Object.defineProperty(logala._pinoLogger, '_lscache', {
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
  logala._pinoLogger.end = '}\n';

  // Reset the pino "chindings" which contain duplicated info about
  // "pid" and "hostname"
  logala._pinoLogger.chindings = '';
};

/**
 * Get a logger and hard-assign the filepath location of the invoking
 * module to populate with the rest of the log data.
 *
 * Do not reuse loggers returned from this function in multiple modules.
 *
 */
logala.get = function () {
  const filePath = logala._getFilePath();

  // Do a partial application on log and return it.
  return logala.log.bind(null, filePath);
};

/**
 * The main logging method.
 *
 * @param {string} filePath The path to the logging module.
 * @param {enum} level The level of the log.
 * @param {string} message Human readable log message.
 * @param {Object|null} context Extra data to log.
 */
logala.log = function (filePath, level, message, context) {
  if (allowedLevels.indexOf(level) === -1) {
    throw new Error('Invalid log level');
  }

  const logContext = {
    message,
    context: {
      runtime: {
        application: logala._opts.appName,
        file: filePath,
      },
      source: {
        file_name: filePath,
      },
    },
    event: {},
  };

  logala._assignSystem(logContext);

  if (context && context.user) {
    logala._assignUser(logContext, context.user);
  }

  if (context && context.error) {
    logala._assignError(logContext, context.error);
  }

  if (context && context.req) {
    logala._assignRequest(logContext, context.req);
  }

  logala._pinoLogger[level](logContext);
};

/**
 * Assign system-wide details.
 *
 * @param {Object} logContext The log record context.
 * @private
 */
logala._assignSystem = function (logContext) {
  logContext.context.system = {
    hostname: logala._opts.hostname,
    pid: process.pid,
    process_nane: process.argv[0],
  };
};

/**
 * Assigns log-schema properties to the logContext for the given UDO.
 *
 * @param {Object} logContext The log record context.
 * @param {Object} user The UDO.
 * @private
 */
logala._assignUser = function (logContext, user) {
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
logala._getFilePath = function () {
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

    const filePath = invokerPath.substr(logala._opts.cwd.length);

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
logala._assignError = function (logContext, error) {
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
logala._assignRequest = function (logContext, req) {
  logContext.event.http_request = {
    headers: req.header,
    host: req.hostname,
    method: req.method,
    path: req.path,
    query_string: JSON.stringify(req.query),
    scheme: req.secure ? 'https' : 'http',
  };
};

