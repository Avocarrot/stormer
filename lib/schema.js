var Promise = require('bluebird');
var util = require('util');
var ValidationError = require('./errors/ValidationError');

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

		if (Object.prototype.toString.call(val) === "[object Array]") {
			return;
		}

		key = !parentKey ? key: util.format('%s.%s', parentKey, key);
		paths.push(key);

		if (typeof val === 'object') {
			return parsePaths(paths, val, key);
		}

	});
};

var traversePath = function(obj, path) {
	path.split('.').forEach(function(step) {
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
		if (!obj.hasOwnProperty(step)) {
			obj[step] = isLastStep(i) ? value : {};
		}
		obj = obj[step];
	});
};

var normalizePropertySchema = function(propertySchema) {
	if (typeof propertySchema !== 'object') {
		propertySchema = {
			type: propertySchema
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
		var propertySchema = traversePath(schema, path);

		propertySchema = normalizePropertySchema(propertySchema);

		if(propertySchema.type === 'Array' && typeof propertySchema.of !== 'object') {
			propertySchema.of = normalizePropertySchema(propertySchema.of);
		}

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
			var value;
			try {
				value = traversePath(obj, property.key);
			} catch(err) {
				if (property.required === true) {
					return reject(new ValidationError(util.format('Property %s is required', property.key)));
				}

				value = property.default;
				if (!value) {
					return;
				};
			}

			if (Object.prototype.toString.call(value) !== util.format("[object %s]", property.type)) {
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