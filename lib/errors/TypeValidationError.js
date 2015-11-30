var util = require('util');

var TypeValidationError = function (message, property, correctType) {
  Error.captureStackTrace(this, this);
  this.message = message;
  this.property = property;
  this.correctType = correctType;
};

util.inherits(TypeValidationError, Error);
TypeValidationError.prototype.name = 'TypeValidationError';

module.exports = TypeValidationError;