var Promise = require('bluebird');
var util = require('util');
var Schema = require('./schema');
var NotFoundError = require('./errors/NotFoundError');

var Model = function(schema) {
	if (!schema) {
		throw new Error('Cannot create model without schema');
	}
	this.schema = new Schema(schema);
};

Model.prototype.get = function(pk, store) {
	return new Promise(function(resolve, reject) {
		store.getEntry(pk).then(function(obj) {
			if (!obj) {
				return reject(new NotFoundError(util.format('Instance with pk %s is not found', pk)));
			}
			resolve(obj);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Model.prototype.set = function(obj, store) {
	obj = obj || {};
	var that = this;
	return new Promise(function(resolve, reject) {
		that.schema.create(obj).then(function(instance) {
			this.instance = instance;
			return store.setEntry(instance);
		}).then(function() {
			resolve(this.instance);
		}).catch(function(err) {
			reject(err);
		});
	});
};

Model.prototype.delete = function(pk, store) {		
	return store.deleteEntry(pk);
};

module.exports = Model;