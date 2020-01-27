/**
 * Error Object Serializer.
 *
 * @param {Error} error Javascript Error or Exception.
 * @return {Object} Properly serialized for Logging Schema.
 */
module.exports = function (error) {
  const result = {
    path: 'event.error',
    value: {
      name: error.name,
      message: error.message,
      backtrace: null,
    },
  };

  if (error.stack) {
    result.value.backtrace = error.stack;
  }

  return result;
};
