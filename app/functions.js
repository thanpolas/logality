/**
 * @fileoverview Logality functional functions.
 */

const utils = require('./utils');

const fn = (module.exports = {});

/**
 * Simple function that returns the first argument it receives.
 *
 * @param {*} arg Any argument.
 * @return {*} The same argument.
 */
fn.returnArg = (arg) => arg;

/**
 * This is where Log Contexts are born, isn't that cute?
 *
 * @param {string} level The level of the log.
 * @param {number} levelSeverity The level expressed in an index.
 * @param {string} message Human readable log message.
 * @param {string} filePath Path of module that the log originated from.
 * @param {string} appName The application name to use.
 * @return {Object} The log Context.
 */
fn.getContext = (level, levelSeverity, message, filePath, appName) => {
  return {
    level,
    severity: levelSeverity,
    dt: utils.getDt(),
    message,
    context: {
      runtime: {
        application: appName,
      },
      source: {
        file_name: filePath,
      },
    },
    event: {},
  };
};

/**
 * Write log to process standard out.
 *
 * @param {string} logMessage The log context to write.
 */
fn.output = function (logMessage) {
  process.stdout.write(logMessage);
};

/**
 * Assign system-wide details.
 *
 * @param {Object} logContext The log record context.
 * @param {string} hostname The hostname of the machine.
 */
fn.assignSystem = (logContext, hostname) => {
  logContext.context.system = {
    hostname,
    pid: utils.getProcessId(),
    process_name: utils.getProcessName(),
  };
};

/**
 * Master serializer of object to be written to the output stream, basically
 * stringifies to JSON and adds a newline at the end.
 *
 * @param {Object} logContext The log context to write.
 * @return {string} Serialized message to output.
 */
fn.masterSerialize = (logContext) => {
  let strLogContext = JSON.stringify(logContext);
  strLogContext += '\n';

  return strLogContext;
};
