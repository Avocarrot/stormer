var Promise = require('bluebird');
var util = require('util');
var Model = require('./model');

var getModel = function(store, modelName) {
	return new Promise(function(resolve, reject) {
		var model = store.models[modelName];
		if (!model) {
			return reject(new Error(util.format('Model %s is not defined', modelName)));
		}
		resolve(model);
	});
};

var Store = function() {
	this.models = {};
};

Store.prototype.define = function(modelName, schema) {
	this.models[modelName] = new Model(schema);
	return this.models[modelName];
};

Store.prototype.callModelFunction = function(modelName, funcName, args) {
	var that = this;
	return new Promise(function(resolve, reject) {
		getModel(that, modelName).then(function(model) {
			var func = model[funcName];
			if (typeof func === 'undefined') {
				return reject(new Error(util.format('Cannot call function %s of %s', funcName, modelName)));
			}

			if (typeof func !== 'function') {
				return reject(new Error(util.format('Property %s of %s is not a function', funcName, modelName)));
			}
			resolve(model[funcName].call(model, args, that));
		}).catch(function(err) {
			reject(err);
		});
	});
};

Store.prototype.get = function(modelName, query) {
	return this.callModelFunction(modelName, 'get', query);
};

Store.prototype.create = function(modelName, obj) {
	return this.callModelFunction(modelName, 'set', obj);
};

Store.prototype.update = function(modelName, obj) {
	return this.callModelFunction(modelName, 'set', obj);
};

Store.prototype.delete = function(modelName, query) {
	return this.callModelFunction(modelName, 'delete', query);
};

/**
 * Handles the logic for getting an entry from the storage
 *
 * @param {String} query - The query object
 * @return {Promise} - A Promise
 *
 */

Store.prototype.getEntry = function(query) {
	return Promise.reject(new Error('Store.prototype.getEntry(query) is not implemented'));
};

/**
 * Handles the logic for creating or updating an entry in the storage
 *
 * @param {Object} obj - The entry
 * @return {Promise} - A Promise
 *
 */
Store.prototype.setEntry = function(obj) {
	return Promise.reject(new Error('Store.prototype.setEntry(obj) is not implemented'));
};

/**
 * Handles the logic for deleting an entry from the storage
 *
 * @param {String} query - The query object
 * @return {Promise} - A Promise
 *
 */
Store.prototype.deleteEntry = function(query) {
	return Promise.reject(new Error('Store.prototype.deleteEntry(query) is not implemented'));
};

module.exports = Store;