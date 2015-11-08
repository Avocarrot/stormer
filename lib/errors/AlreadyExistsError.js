var util = require('util');

var AlreadyExists = function (message) {
  Error.captureStackTrace(this, this);
  this.message = message;
};

util.inherits(AlreadyExists, Error);
AlreadyExists.prototype.name = 'AlreadyExists';

module.exports = AlreadyExists;