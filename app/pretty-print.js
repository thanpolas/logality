/* eslint-disable security/detect-object-injection */
/**
 * @fileoverview Handles pretty printing for logality, used in
 *  local development.
 */
const chalk = require('chalk');
const format = require('json-format');

const { isObjectEmpty, safeStringify } = require('./utils');

/** @const {Object} LEVELS_CONFIG Levels colors and icons */
const LEVELS_CONFIG = {
  emergency: {
    color: chalk.red.underline,
    icon: '●',
  },
  alert: {
    color: chalk.red.underline,
    icon: '◆',
  },
  critical: {
    color: chalk.red,
    icon: '✖',
  },
  error: {
    color: chalk.red,
    icon: '■',
  },
  warn: {
    color: chalk.yellow,
    icon: '⚠',
  },
  notice: {
    color: chalk.cyan,
    icon: '▶',
  },
  info: {
    color: chalk.blue,
    icon: 'ℹ',
  },
  debug: {
    color: chalk.green,
    icon: '★',
  },
};

/**
 * Keys to ignore on context object when pretty printing
 *
 * @const {Array<string>} CONTEXT_IGNORE_KEYS
 */
const CONTEXT_IGNORE_KEYS = ['runtime', 'source', 'system'];

/**
 * Keys to ignore on context object when pretty printing
 *
 * @const {Array<string>} EVENT_IGNORE_KEYS
 */
const EVENT_IGNORE_KEYS = ['http_request'];

/**
 * Write prettified log to selected output.
 *
 * @param {Object} logContext The log context to write.
 * @param {Object=} prettyOpts Rendering options.
 * @param {boolean=} prettyOpts.noTimestamp Set to true to not log timestamps.
 * @param {boolean=} prettyOpts.noFilename Set to true to not log filename.
 * @param {boolean=} prettyOpts.onlyMessage Set to true to only log the message
 *    and not the context.
 * @param {boolean=} prettyOpts.noColor Do not color the logs.
 * @return {string} Formatted output.
 * @private
 */
exports.writePretty = function (logContext, prettyOpts = {}) {
  const { noTimestamp, noFilename, onlyMessage, noColor } = prettyOpts;

  // current level icon and color
  const levelsConfig = LEVELS_CONFIG[logContext.level];

  const file = noFilename
    ? ''
    : ` ${exports._applyColor(
        chalk.underline.green,
        logContext.context.source.file_name,
        noColor,
      )}`;

  const date = noTimestamp
    ? ''
    : exports._applyColor(chalk.white, `[${logContext.dt}] `, noColor);

  const level = exports._applyColor(
    levelsConfig.color,
    `${levelsConfig.icon} ${logContext.level}`,
    noColor,
  );
  const message = exports._applyColor(
    levelsConfig.color,
    logContext.message,
    noColor,
  );

  const logs = onlyMessage ? '' : exports._getLogs(logContext);

  const output = `${date}${level}${file} - ${message}\n${logs}`;

  return output;
};

/**
 * Will apply the color conditionally upon the provided noColor argument/
 *
 * @param {function} colorFn The color function.
 * @param {string} string The string to color or not.
 * @param {boolean} noColor Set to true to not apply color.
 * @return {string} formatted string.
 * @private
 */
exports._applyColor = (colorFn, string, noColor) => {
  if (noColor) {
    return string;
  }

  return colorFn(string);
};

/**
 * Returns formatted logs for pretty print.
 *
 * @param {Object} logContext The log context to format.
 * @return {string} Log output.
 * @private
 */
exports._getLogs = function (logContext) {
  const logs = {};

  const { event, context } = logContext;

  const eventKeys = Object.keys(event);
  const contextKeys = Object.keys(context);

  contextKeys.forEach((key) => {
    if (CONTEXT_IGNORE_KEYS.includes(key)) {
      return;
    }

    if (logs.context) {
      logs.context[key] = context[key];
    } else {
      logs.context = {
        [key]: context[key],
      };
    }
  });

  eventKeys.forEach((eventKey) => {
    if (EVENT_IGNORE_KEYS.includes(eventKey)) {
      return;
    }

    if (logs.event) {
      logs.event[eventKey] = event[eventKey];
    } else {
      logs.event = {
        [eventKey]: event[eventKey],
      };
    }
  });

  // empty string if the logs are emtpy
  if (isObjectEmpty(logs)) {
    return '';
  }

  // Perform a safe serialization so that any BigInt values are safely serialized
  // into strings, and then deserialize back to object.
  //
  // The performance hit can be afforded when pretty printing as it is only
  // used on development.
  const logsSerialized = safeStringify(logs);
  const logsSafe = JSON.parse(logsSerialized);

  const prettyLogs = format(logsSafe, { type: 'space', size: 2 });

  return `${prettyLogs}\n`;
};
