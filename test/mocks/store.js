var Promise = require('bluebird');
var Store = require('../../lib/store');

var store = new Store();

store.getEntry = function(pk) {
	return Promise.filter(this.items, function(item) {
		return item.pk === pk;
	}).then(function(items) {
		if (items.length === 0) {
			return Promise.resolve();
		}
		return Promise.resolve(items[0]);
	});
};

store.updateEntry = function(pk, obj) {
	var that = this;
	var updatedItem = null;
	return Promise.each(this.items, function(item, index) {
		if (item.pk === pk) {
			that.items[index] = obj;
			updatedItem = obj;
		}
	}).then(function() {
		return Promise.resolve(updatedItem);
	});
};

store.createEntry = function(obj) {
	this.items.push(obj);
	return Promise.resolve();
};

store.restore = function() {
	this.items = [];
	this.models = {};
}

module.exports = store;