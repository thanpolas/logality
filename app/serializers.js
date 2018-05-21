/**
 * @fileOverview Default serializers.
 */

const serializers = module.exports = {};

/**
 * Standard User serializer.
 *
 * @param {Object} udo User Data Object.
 * @return {Object} Properly serialized for Logging Schema.
 */
serializers.user = function (udo) {
  return {
    id: udo.id,
    email: udo.email,
    type: null, // User type
  };
};
