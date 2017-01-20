var Promise = require('bluebird');
var util = require('util');
var Schema = require('./schema');
var Cache = require('./cache');

function cacheKey(model, pk) {
		return util.format('%s:%s', model, pk);
};

function Store(cache) {
	this.cache = (cache instanceof Cache) ? cache : false;
	this.models = {};
};

Store.prototype.define = function(modelName, schema) {
	if (!schema) {
		throw new Error('Cannot define model without schema');
	}

	this.models[modelName] = {
		schema: new Schema(schema)
	};
	return this.models[modelName];
};

Store.prototype.getModel = function(modelName) {	
	var model = this.models[modelName];
	if (!model) {
		throw new Error(util.format('Model %s is not defined', modelName));
	}
	return model;
};

Store.prototype.get = function(modelName, pk) {
	var key = cacheKey(modelName, pk);
	if (this.cache && (cached=this.cache.get(key))) {
		return cached;
	}
	var model = this.getModel(modelName);
	var instance = this._get(model, pk);
	if (this.cache) {
		this.cache.set(key, instance);
	}
	return instance;
};

Store.prototype.filter = function(modelName, query) {
	var model = this.getModel(modelName);
	return this._filter(model, query);
};

function afterCreate(action, modelName, model) {
	return function(instance) {
		var promise = this._set(model, instance, action);
		var pk = model.schema.getPkOfInstance(instance);
		if (this.cache && pk !== null) {
			var key = cacheKey(modelName, pk);
			this.cache.set(key, promise);
		}
		return promise;
	};
};

Store.prototype.create = function(modelName, obj) {
	obj = obj || {};
	var model = this.getModel(modelName);
	return model.schema.create(obj).then(afterCreate('create', modelName, model).bind(this));
};

Store.prototype.update = function(modelName, obj) {
	obj = obj || {};
	var model = this.getModel(modelName);
	return model.schema.create(obj).then(afterCreate('update', modelName, model).bind(this));
};

Store.prototype.delete = function(modelName, query) {
	var model = this.getModel(modelName);
	return this._delete(model, query);
};

/**
 * Handles the logic for getting an entry from the storage
 *
 * @param {String} pk - The object's primary key
 * @return {Promise} - A Promise
 *
 */

Store.prototype._get = function(model, pk) {
	return Promise.reject(new Error('Store.prototype._get(model, pk) is not implemented'));
};

/**
 * Handles the logic for filtering entries from the storage
 *
 * @param {String} query - The query object
 * @return {Promise} - A Promise. The resolved value should be an array. Return empty array if none is natching the query.
 *
 */

Store.prototype._filter = function(model, query) {
	return Promise.reject(new Error('Store.prototype._filter(model, query) is not implemented'));
};

/**
 * Handles the logic for creating or updating an entry in the storage
 *
 * @param {Object} obj - The entry
 * @return {Promise} - A Promise
 *
 */
Store.prototype._set = function(model, obj, operation) {
	return Promise.reject(new Error('Store.prototype._set(model, obj, operation) is not implemented'));
};

/**
 * Handles the logic for deleting an entry from the storage
 *
 * @param {String} query - The query object
 * @return {Promise} - A Promise. The resolved value should be the created obj.
 *
 */
Store.prototype._delete = function(query) {
	return Promise.reject(new Error('Store.prototype._delete(query) is not implemented'));
};

module.exports = Store;
