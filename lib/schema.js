var Promise = require('bluebird');
var util = require('util');
var TypeValidationError = require('./errors/TypeValidationError');
var CustomValidationError = require('./errors/CustomValidationError');
var _ = require('./utils');


var supportedTypes = ['String', 'Number', 'Object', 'Array', 'Boolean', 'Date' ];
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

		// Attach key path
		schema[key].path = util.format('%s.%s', prefix, key);

		// Check validator
		if (schema[key].hasOwnProperty('validate') && typeof schema[key].validate !== 'function') {
			throw new Error(util.format('Validator for property %s should be function', schema[key].path));
		}
	});
	return schema;
};

var Schema = function(schema) {
	var that = this;

	if (!schema) {
		throw new Error('A schema definition object should be passed');
	}

	this.schema = normalizeSchema(schema);

	var primaryKey = Object.keys(schema).filter(function(key) {
		return schema[key].primaryKey === true;
	});

	if (primaryKey.length > 1) {
		throw new Error('Only one field can be designated as the primary key');
	}

	this.primaryKey = primaryKey.pop();
};

Schema.prototype.create = function(obj, schema){
	var that = this;
	var instance = {};
	var schema = schema || that.schema;
	return new Promise(function(resolve, reject) {
		Promise.each(Object.keys(schema), function(key) {
			var propertySchema = schema[key];
			var value = obj[key];
			if (_.isUndefined(value) && (propertySchema.required === true || propertySchema.primaryKey === true)) {
				return reject(new TypeValidationError(util.format('Property %s is required', propertySchema.path)));
			}

			// Skip if this is a not defined property
			if (_.isUndefined(value)) {
				return;
			};

			// Check if value has valid type
			if (Object.prototype.toString.call(value) !== util.format("[object %s]", propertySchema.type)) {
				return reject(new TypeValidationError(util.format('Property %s should be of type %s', propertySchema.path, propertySchema.type), key, propertySchema.type));
			}

			// Apply custom validators (if any)
			if (propertySchema.hasOwnProperty('validate')) {
				if (!propertySchema.validate(value)) {
					return reject(new CustomValidationError(util.format('Property %s failed custom validation', propertySchema.path), key));
				}
			}

			if (propertySchema.type === 'Array') {
				return Promise.map(value, function(v, i) {
					return propertySchema.of.create({subSchema: v}).then(function(instance) {
						return instance.subSchema;
					}).catch(TypeValidationError, function(err) {
						var invalidPropertyName = util.format('%s[%s].%s', propertySchema.path, i, err.property);
						return reject(new TypeValidationError(util.format('Property %s should be of type %s', invalidPropertyName, err.correctType)));
					}).catch(CustomValidationError, function(err) {
						var invalidPropertyName = util.format('%s[%s].%s', propertySchema.path, i, err.property);
						return reject(new CustomValidationError(util.format('Property %s failed custom validation', invalidPropertyName)));
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

Schema.prototype.setDefaults = function(obj, schema) {
	var that = this;
	var instance = {};
	var schema = schema || that.schema;
	return Object.keys(schema).reduce(function(acc, el, idx) {
		var propertySchema = schema[el];
		var value = obj.hasOwnProperty(el) ? obj[el] : schema[el].default;
		acc[el] = value;
		return acc;
	}, {});
}

module.exports = Schema;
