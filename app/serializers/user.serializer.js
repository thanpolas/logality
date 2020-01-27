/**
 * Standard User serializer.
 *
 * @param {Object} udo User Data Object.
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
