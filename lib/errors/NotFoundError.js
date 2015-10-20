var util = require('util');

var NotFoundError = function (message) {
  Error.captureStackTrace(this, this);
  this.message = message;
};

util.inherits(NotFoundError, Error);
NotFoundError.prototype.name = 'NotFoundError';

module.exports = NotFoundError;