/**
 * Serializes the log message timestamp.
 *
 * @param {Date} date Date Object to serialize.
 * @return {Object} Properly serialized for Logging Schema.
 */
module.exports = function (udo) {
  return {
    path: 'context.user',
    value: {
      id: udo.id,
      email: udo.email,
    },
  };
};
