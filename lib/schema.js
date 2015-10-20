var Promise = require('bluebird');
var util = require('util');
var ValidationError = require('./errors/ValidationError');

var reservedKeys = ['type', 'default', 'required'];

var missing = function(obj, property) {
	return (typeof obj[property] === 'undefined' || obj[property] === null); 
};

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

var traversePath = function(obj, path) {
	path.split('.').forEach(function(step) {
		obj = obj[step];
	});
	return obj;
}

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

		if (typeof propertySchema !== 'object') {
			propertySchema = {
				type: propertySchema
			};
		}

		propertySchema = pick(propertySchema, reservedKeys);
		propertySchema.key = path;
		return propertySchema;
	});

	// Populate required array
	this.required = [];
	this.properties.forEach(function(property) {
		if (property.required === true) {
			that.required.push(property.key);
		}
	});
};

Schema.prototype.setDefaults = function(obj){
	var properties = this.properties;
	return new Promise(function(resolve, reject) {
		Promise.each(properties, function(property) {
			var defaultValue = property.default;
			if (missing(obj, property.key) && typeof defaultValue !== 'undefined') {
				obj[property.key] = defaultValue;
			}
		}).then(function() {
			resolve(obj);
		});
	});
};


Schema.prototype.validate = function(obj){
	var that = this;
	return new Promise(function(resolve, reject) {

		// Get the object keys in a nice format		
		var paths = [];
		parsePaths(paths, obj);

		Promise.each(paths, function(path) {
			var value = traversePath(obj, path);
			return Promise.filter(that.properties, function(property) {
				return property.key === path;
			}).then(function(properties) {
				var property = properties.length > 0 ? properties[0] : null;
				if (!property) {
					return reject(new ValidationError(util.format('Property %s is not defined in the schema', path)));
				}

				if (Object.prototype.toString.call(value) !== util.format("[object %s]", property.type)) {
					return reject(new ValidationError(util.format('Property %s should be of type %s', path, property.type)));
				}
			});
		}).then(function() {
			return Promise.filter(that.required, missing.bind(that, obj));
		}).then(function(missingFields) {
			if (missingFields.length > 0) {
				var msg = util.format('Properties [%s] are required', missingFields.join(', '));
				return reject(new ValidationError(msg));
			}
			resolve(that);
		});
	});

};

Schema.prototype.create = function(obj){
	var that = this;
	return new Promise(function(resolve, reject) {
		that.validate(obj)
		.call('setDefaults', obj)
		.then(function() {
			resolve(obj);
		}).catch(function(err) {
			reject(err);
		})
	});
};

module.exports = Schema;