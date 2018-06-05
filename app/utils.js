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
