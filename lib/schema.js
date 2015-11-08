var Promise = require('bluebird');
var util = require('util');
var ValidationError = require('./errors/ValidationError');
var _ = require('./utils');


var supportedTypes = ['String', 'Number', 'Object', 'Array'];
var reservedKeys = ['type', 'default', 'required', 'of'];

var isNotReserved = function(key) {
	return reservedKeys.indexOf(key) === -1;
};

var normalizePropertySchema = function(propertyName, propertySchema) {
	// If simple property convert to complex
	if (typeof propertySchema !== 'object') {
		propertySchema = {
			type: propertySchema
		};
	}

	if (supportedTypes.indexOf(propertySchema.type) === -1) {
		throw new Error(util.format('Type %s is not supported', propertySchema.type));
	}

	// Convert arrays "of" to a sub-schema
	if (!_.isUndefined(propertySchema.of)) {
		var subSchema = new Schema({
			subSchema: propertySchema.of
		});
		propertySchema.of = subSchema;
	}

	return propertySchema;
};

var normalizeSchema = function(schema, prefix) {
	prefix = prefix || '';
	Object.keys(schema).filter(isNotReserved).forEach(function(key) {
		var value = schema[key];
		if (value.type === 'Object') {
			schema[key] = normalizeSchema(value, util.format('%s.%s', prefix, key));
		} else {
			schema[key] = normalizePropertySchema(key, value);
		}
		schema[key].path = util.format('%s.%s', prefix, key);
	});
	return schema;
};

var Schema = function(schema) {
	var that = this;

	if (!schema) {
		throw new Error('A schema definition object should be passed');
	}

	this.schema = normalizeSchema(schema);
};

Schema.prototype.create = function(obj, schema){
	var that = this;
	var instance = {};
	var schema = schema || that.schema;
	return new Promise(function(resolve, reject) {
		Promise.each(Object.keys(schema), function(key) {
			var propertySchema = schema[key];
			var value = obj[key] || propertySchema.default;

			if (_.isUndefined(value) && propertySchema.required === true) {
				return reject(new ValidationError(util.format('Property %s is required', propertySchema.path)));
			}

			// Skip if this is a not defined property
			if (_.isUndefined(value)) {
				return;
			};

			if (Object.prototype.toString.call(value) !== util.format("[object %s]", propertySchema.type)) {
				return reject(new ValidationError(util.format('Property %s should be of type %s', propertySchema.path, propertySchema.type), key, propertySchema.type));
			}

			if (propertySchema.type === 'Array') {
				return Promise.map(value, function(v, i) {
					return propertySchema.of.create({subSchema: v}).then(function(instance) {
						return instance.subSchema;
					}).catch(ValidationError, function(err) {
						var invalidPropertyName = util.format('%s[%s].%s', propertySchema.path, i, err.property);
						return reject(new ValidationError(util.format('Property %s should be of type %s', invalidPropertyName, err.correctType)));
					});
				}).then(function(values) {
					_.setValueAtPath(instance, key, values);
				}).catch(function(err) {
					return reject(err);
				});

			} else if (propertySchema.type === 'Object') {
				return that.create(value, propertySchema).then(function(value) {
					_.setValueAtPath(instance, key, value);
				});
			} else {	
				_.setValueAtPath(instance, key, value);
			}

		}).then(function() {
			resolve(instance);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = Schema;