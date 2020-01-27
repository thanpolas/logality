/**
 * Express Request Object Serializer.
 *
 * @param {Express.Request} req Express request object.
 * @return {Object} Properly serialized for Logging Schema.
 */
module.exports = function (req) {
  const result = {
    path: 'event.http_request',
    value: {
      headers: req.header,
      host: req.hostname,
      method: req.method,
      path: req.path,
      query_string: JSON.stringify(req.query),
      scheme: req.secure ? 'https' : 'http',
    },
  };

  return result;
};
