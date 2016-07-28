function Cache(options) {
	this.options = options;
};

Cache.prototype.get = function(key) {
 return null;
};

Cache.prototype.set = function(key, _) { 
	return false;
};

Cache.prototype.has = function(key) {
	return false;
};

Cache.prototype.delete = function(key) {
	return false;
};

module.exports = Cache;
