var util = require('util');

var ValidationError = function (message, property, correctType) {
  Error.captureStackTrace(this, this);
  this.message = message;
  this.property = property;
  this.correctType = correctType;
};

util.inherits(ValidationError, Error);
ValidationError.prototype.name = 'ValidationError';

module.exports = ValidationError;