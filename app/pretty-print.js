/**
 * @fileoverview Handles pretty printing for logality, used in
 *  local development.
 */
const chalk = require('chalk');
const format = require('json-format');
const figures = require('figures');

const { isObjectEmpty } = require('./utils');

const pretty = (module.exports = {});

/** @const {Object} LEVELS_CONFIG Levels colors and icons */
const LEVELS_CONFIG = {
  emergency: {
    color: chalk.red.underline,
    icon: figures.bullet,
  },
  alert: {
    color: chalk.red.underline,
    icon: figures.warning,
  },
  critical: {
    color: chalk.red,
    icon: figures.cross,
  },
  error: {
    color: chalk.red,
    icon: figures.square,
  },
  warn: {
    color: chalk.yellow,
    icon: figures.checkboxCircleOn,
  },
  notice: {
    color: chalk.cyan,
    icon: figures.play,
  },
  info: {
    color: chalk.blue,
    icon: figures.info,
  },
  debug: {
    color: chalk.green,
    icon: figures.star,
  },
};

/**
 * Write prettified log to selected output.
 *
 * @param {Object} logContext The log context to write.
 * @private
 */
pretty.writePretty = function(logContext) {
  // current level icon and color
  const config = LEVELS_CONFIG[logContext.level];

  const file = chalk.underline.green(logContext.context.source.file_name);
  const date = chalk.white(`[${logContext.dt}]`);
  const level = config.color(`${config.icon} ${logContext.level}`);
  const message = config.color(logContext.message);
  const logs = pretty._getLogs(logContext);

  const output = `${date} ${level} ${file} - ${message}\n${logs}`;

  return output;
};

/**
 * Returns formatted logs for pretty print.
 *
 * @param {Object} logContext The log context to format.
 * @private
 */
pretty._getLogs = function(logContext) {
  const logs = {};
  const blacklist = ['runtime', 'source', 'system'];
  const { event, context } = logContext;

  // remove unnecessary keys
  blacklist.forEach(key => {
    delete context[key];
  });

  // set event if exists
  if (!isObjectEmpty(event)) {
    logs.event = event;
  }

  // set context
  if (!isObjectEmpty(context)) {
    logs.context = context;
  }

  // empty string if the logs are emtpy
  if (isObjectEmpty(logs)) {
    return '';
  }

  const prettyLogs = format(logs, { type: 'space', size: 2 });

  return `${prettyLogs}\n`;
};
