/**
 * Custom Object Serializer.
 *
 * @param {*} custom Any value.
 * @return {Object} Properly serialized for Logging Schema.
 */
module.exports = function(custom) {
  const result = {
    path: 'context.custom',
    value: custom,
  };

  return result;
};
