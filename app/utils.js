const utils = module.exports = {};

/**
 * Check if object is empty
 *
 * @param {Object} obj
 * @return {boolean}
 */
utils.isObjectEmpty = function (obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Assigns the value on the target using the path.
 *
 * @param {string} path Dot notation path to save the value.
 * @param {Object} target The target object to save the value on.
 * @param {*} value The value to save.
 * @return {Object} The target object.
 */
utils.assignPath = function (path, target, value) {
  const parts = path.split('.');

  if (parts.length === 1) {
    // Save on root
    target[path] = value;
    return target;
  }

  let ref = target;
  parts.forEach(function (part, index) {
    if (index === (parts.length - 1)) {
      ref[part] = value;
    } else {
      ref[part] = ref[part] || {};
      ref = ref[part];
    }
  });

  return target;
};

/**
 * Returns the process name, required for testing.
 *
 * @return {string}
 */
utils.getProcessName = function () {
  return process.argv[0];
};

/**
 * Returns the process id, required for testing.
 *
 * @return {string}
 */
utils.getProcessId = function () {
  return process.pid;
};

/**
 * Clean HTTP Headers from secusiry sensitive data.
 *
 * @param {Object} headers The headers.
 * @return {Object} Sanitized headers.
 */
utils.sanitizeHttpHeaders = function (headers) {
  if (typeof headers !== 'object') {
    return headers;
  }
  const REMOVE = [
    'cookie',
    'authorization',
  ];

  REMOVE.forEach(function (header) {
    if (headers[header]) {
      headers[header] = '-- REMOVED FOR SAFETY --';
    }
  });

  return headers;
};
