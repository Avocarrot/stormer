var util = require('util');

var CustomValidationError = function (message, property) {
  Error.captureStackTrace(this, this);
  this.message = message;
  this.property = property;
};

util.inherits(CustomValidationError, Error);
CustomValidationError.prototype.name = 'CustomValidationError';

module.exports = CustomValidationError;