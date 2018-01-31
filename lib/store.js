var Promise = require('bluebird');
var util = require('util');
var Schema = require('./schema');

var Store = function() {
	this.models = {};
        this._alias = new Map();
};

Store.prototype.define = function(name, schema) {
	if (!schema) {
		throw new Error('Cannot define model without schema');
	}

	this.models[name] = {
		schema: new Schema(schema),
    name
	};
  this.alias(name, name);
	return this.models[name];
};

Store.prototype.alias = function(alias, name) {
	this._alias.set(alias, name);
}

Store.prototype.getModel = function(name) {
	var model = this.models[this._alias.get(name)];
	if (!model) {
		throw new Error(util.format('Model %s is not defined', modelName));
	}
	return model;
};

Store.prototype.get = function(modelName, pk) {
	var model = this.getModel(modelName);
	return this._get(model, pk);
};

Store.prototype.filter = function(modelName, query) {
	var model = this.getModel(modelName);
	return this._filter(model, query);
};

Store.prototype.create = function(modelName, obj) {
	obj = obj || {};
	var that = this;
	var model = this.getModel(modelName);
	return model.schema.create(model.schema.setDefaults(obj)).then(function(instance) {
		return that._set(model, instance, 'create');
	});
};

Store.prototype.update = function(modelName, obj) {
	obj = obj || {};
	var that = this;
	var model = this.getModel(modelName);
	return model.schema.create(obj).then(function(instance) {
		return that._set(model, instance, 'update');
	});
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
