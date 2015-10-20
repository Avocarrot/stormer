var util = require('util');

var ValidationError = function (message) {
  Error.captureStackTrace(this, this);
  this.message = message;
};

util.inherits(ValidationError, Error);
ValidationError.prototype.name = 'ValidationError';

module.exports = ValidationError;