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
      ref = ref[part];
    }
  });

  return target;
};
