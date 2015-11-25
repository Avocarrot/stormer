var Promise = require('bluebird');
var util = require('util');
var Model = require('./model');

var getModel = function(store, modelName) {
	return new Promise(function(resolve, reject) {
		var model = store.models[store.alias(modelName)];
		if (!model) {
			return reject(new Error(util.format('Model %s is not defined', modelName)));
		}
		resolve(model);
	});
};

var Store = function() {
	this.models = {};
};

Store.prototype.alias = function(name) {
  return name;
};

Store.prototype.define = function(modelName, schema) {
	this.models[this.alias(modelName)] = new Model(schema);
	return this.models[this.alias(modelName)];
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
			args.push(that); // Store is the last argument
			resolve(model[funcName].apply(model, args));
		}).catch(function(err) {
			reject(err);
		});
	});
};

Store.prototype.get = function(modelName, pk) {
	return this.callModelFunction(modelName, 'get', [pk]);
};

Store.prototype.filter = function(modelName, query) {
	return this.callModelFunction(modelName, 'filter', [query]);
};

Store.prototype.create = function(modelName, obj) {
	return this.callModelFunction(modelName, 'set', [obj, 'create']);
};

Store.prototype.update = function(modelName, obj) {
	return this.callModelFunction(modelName, 'set', [obj, 'update']);
};

Store.prototype.delete = function(modelName, query) {
	return this.callModelFunction(modelName, 'delete', [query]);
};

/**
 * Handles the logic for getting an entry from the storage
 *
 * @param {String} pk - The object's primary key
 * @return {Promise} - A Promise
 *
 */

Store.prototype._get = function(pk) {
	return Promise.reject(new Error('Store.prototype._get(pk) is not implemented'));
};

/**
 * Handles the logic for filtering entries from the storage
 *
 * @param {String} query - The query object
 * @return {Promise} - A Promise. The resolved value should be an array. Return empty array if none is natching the query.
 *
 */

Store.prototype._filter = function(query) {
	return Promise.reject(new Error('Store.prototype._filter(query) is not implemented'));
};

/**
 * Handles the logic for creating or updating an entry in the storage
 *
 * @param {Object} obj - The entry
 * @return {Promise} - A Promise
 *
 */
Store.prototype._set = function(obj, operation) {
	return Promise.reject(new Error('Store.prototype._set(obj, operation) is not implemented'));
};

/**
 * Handles the logic for deleting an entry from the storage
 *
 * @param {String} query - The query object
 * @return {Promise} - A Promise
 *
 */
Store.prototype._delete = function(query) {
	return Promise.reject(new Error('Store.prototype._delete(query) is not implemented'));
};

module.exports = Store;
