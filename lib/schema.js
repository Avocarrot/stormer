var Promise = require('bluebird');
var util = require('util');
var ValidationError = require('./errors/ValidationError');
var _ = require('./utils');


var supportedTypes = ['String', 'Number', 'Object', 'Array'];
var reservedKeys = ['type', 'default', 'required', 'of'];

var isNotReserved = function(key) {
	return reservedKeys.indexOf(key) === -1;
};

var pick = function(obj, keys) {
	var newObj = {};
	keys.forEach(function(key) {
		if (obj.hasOwnProperty(key)) {
			newObj[key] = obj[key];
		}
	});
	return newObj;
};

var parsePaths = function(paths, obj, parentKey) {
	Object.keys(obj).filter(isNotReserved).forEach(function(key) {
		var val = obj[key];

		key = !parentKey ? key: util.format('%s.%s', parentKey, key);
		paths.push(key);

		if (typeof val === 'object') {
			return parsePaths(paths, val, key);
		}
	});
};

var getValueAtPath = function(obj, path) {
	path.split('.').forEach(function(step, i) {
		if (!obj.hasOwnProperty(step)) {
			throw new Error(util.format('Failed to traverse step %s of path %s', step, path));
		}
		obj = obj[step];
	});
	return obj;
};

var setValueAtPath = function(obj, path, value) {
	var pathSteps = path.split('.');
	var pathLength = pathSteps.length;

	var isLastStep = function(stepDepth) {
		return stepDepth === pathLength - 1;
	};

	pathSteps.forEach(function(step, i) {

		if (step === 'of') {
			var remainingPath = pathSteps.slice(i+1).join('.');
			return setValueAtPath(obj, remainingPath, value);
		}

		if (!obj.hasOwnProperty(step)) {
			obj[step] = isLastStep(i) ? value : {};
		}
		obj = obj[step];
	});
};

var normalizePropertySchema = function(propertySchema) {

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

var Schema = function(schema) {
	var that = this;

	if (!schema) {
		throw new Error('A schema definition object should be passed');
	}

	var paths = [];
	parsePaths(paths, schema);

	// Parse schema and populate properties
	this.properties = paths.map(function(path) {
		var propertySchema = getValueAtPath(schema, path);
		propertySchema = normalizePropertySchema(propertySchema);
		propertySchema = pick(propertySchema, reservedKeys);
		propertySchema.key = path;
		return propertySchema;
	});
};

Schema.prototype.create = function(obj){
	var that = this;
	var instance = {};
	return new Promise(function(resolve, reject) {
		Promise.each(that.properties, function(property) {
			try {
				var value = getValueAtPath(obj, property.key);
			} catch(err) {
				if (property.required === true) {
					return reject(new ValidationError(util.format('Property %s is required', property.key)));
				}
				var value = property.default;
				// Skip if this is a not defined property
				if (!value) {
					return;
				};
			}

			if (Object.prototype.toString.call(value) !== util.format("[object %s]", property.type)) {
				return reject(new ValidationError(util.format('Property %s should be of type %s', property.key, property.type), property.key, property.type));
			}

			if (Array.isArray(value)) {
				return Promise.each(value, function(v, i) {
					this.i = i;
					return property.of.create({subSchema: v});
				}).then(function(values) {
					setValueAtPath(instance, property.key, values);
				}).catch(ValidationError, function(err) {
					var invalidPropertyName = util.format('%s[%s].%s', property.key, this.i, err.property);
					return reject(new ValidationError(util.format('Property %s should be of type %s', invalidPropertyName, err.correctType)));
				}).catch(function(err) {
					return reject(err);
				});
			} else {
				setValueAtPath(instance, property.key, value);
			}

		}).then(function() {
			resolve(instance);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = Schema;