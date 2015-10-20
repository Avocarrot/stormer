var Promise = require('bluebird');
var util = require('util');
var ValidationError = require('./errors/ValidationError');

var supportedTypes = ['String', 'Number', 'Object', 'Array'];
var reservedKeys = ['type', 'default', 'required'];

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
	var pathSteps = path.split('.');
	pathSteps.some(function(step, i) {

		// If the current obj is an array and not a schema object we need to skip and parse the array
		if (step === 'of' && Object.prototype.toString.call(obj) === "[object Array]") {

			var remainingPath = pathSteps.slice(i+1).join('.');
			if (!remainingPath) { // if this the last step
				return obj;
			}

			obj = obj.map(function(o) {
				return getValueAtPath(o, remainingPath);
			});

			return true;
		}

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

	// If simple array property convert to complex
	if (Object.prototype.toString.call(propertySchema) === "[object Array]") {
		var of = propertySchema[0];
		propertySchema = {
			type: 'Array'
		};
	}
	
	if (supportedTypes.indexOf(propertySchema.type) === -1) {
		throw new Error(util.format('Type %s is not supported', propertySchema.type));
	}

	return propertySchema;
};

var Schema = function(schema) {
	var that = this;

	if (!schema) {
		throw new Error('A schema definition object should be passed');
	}

	// pk is required by default
	schema['pk'] = schema['pk'] || {
		type: 'String',
		required: true
	};

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

			if (Object.prototype.toString.call(value) === "[object Array]" && property.key.split('.').indexOf('of') !== -1) {
				return Promise.each(value, function(v, i) {
					if (Object.prototype.toString.call(v) !== util.format("[object %s]", property.type)) {
						return reject(new ValidationError(util.format('Element at index %s of property %s should be of type %s', i, property.key, property.type)));
					}
				});
			} else if (Object.prototype.toString.call(value) !== util.format("[object %s]", property.type)) {
				return reject(new ValidationError(util.format('Property %s should be of type %s', property.key, property.type)));
			}

			setValueAtPath(instance, property.key, value);

		}).then(function() {
			resolve(instance);
		}).catch(function(err) {
			reject(err);
		});
	});
};

module.exports = Schema;