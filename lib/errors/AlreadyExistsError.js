var util = require('util');

var AlreadyExistsError = function (message) {
  Error.captureStackTrace(this, this);
  this.message = message;
};

util.inherits(AlreadyExistsError, Error);
AlreadyExistsError.prototype.name = 'AlreadyExistsError';

module.exports = AlreadyExistsError;