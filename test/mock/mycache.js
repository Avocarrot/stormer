var Cache = require('../../lib/cache');
var util = require('util');

function MyCache() {
	Cache.call(this);
	this._internal = new Map();
};

util.inherits(MyCache, Cache);

MyCache.prototype.get = function(key) {
	return this._internal.get(key);
};

MyCache.prototype.set = function(key, obj) { 
	return this._internal.set(key, obj);
};

MyCache.prototype.has = function(key) {
	return this._internal.has(key);
};

MyCache.prototype.delete = function(key) {
	return this._internal.delete(key);;
};

module.exports = MyCache;
