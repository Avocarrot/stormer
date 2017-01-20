var chai = require('chai');
var sinon = require('sinon');
var Store = require('../lib/store');
var MyCache = require('./mock/mycache');
chai.should();

var sandbox = sinon.sandbox.create();

describe('Store Tests', function() {

	var store;

	beforeEach(function() {
		store = new Store();		
	});

	afterEach(function() {
		sandbox.restore();
	});

	describe('Store.prototype.define() should', function() {

		it('throw an error if no schema is passed', function() {
			(function () {
				store.define('myModel');
			}).should.throw('Cannot define model without schema');
		});

		it('define a new model', function() {
			store.define('myModel', {});
			store.models.should.have.property('myModel');
		});

	});

	it('Store.prototype.get() should call Store.prototype._get()', function(done) {
		var pk = '1234';
		var getStub = sandbox.stub(store, '_get').returns(Promise.resolve());

		var model = store.define('myModel', {});
		store.get('myModel', pk).then(function() {
			getStub.called.should.be.true;
			getStub.calledWith(model, pk).should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.filter() should call Store.prototype._filter()', function(done) {
		var query = {
			fieldA: 1
		};
		var filterStub = sandbox.stub(store, '_filter').returns(Promise.resolve([{}, {}]));

		var model = store.define('myModel', {});
		store.filter('myModel', query).then(function() {
			filterStub.called.should.be.true;
			filterStub.calledWith(model, query).should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.create() should call Store.prototype._set()', function(done) {
		var fakeObj = { pk: '1234'};
		var createStub = sandbox.stub(store, '_set').returns(Promise.resolve());

		var model = store.define('myModel', { pk: { type: 'String', primaryKey: true } });
		store.create('myModel', fakeObj).then(function() {
			createStub.called.should.be.true;
			createStub.calledWith(model, fakeObj, 'create').should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.update() should call Store.prototype._set()', function(done) {
		var fakeObj = { pk: '1234'};
		var updateSpy = sandbox.stub(store, '_set').returns(Promise.resolve());

		var model = store.define('myModel', { pk: { type: 'String', primaryKey: true } });
		store.update('myModel', fakeObj).then(function() {
			updateSpy.called.should.be.true;
			updateSpy.calledWith(model, fakeObj, 'update').should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.delete() should call Model.prototype.delete()', function(done) {
		var pk= '1234';
		var deleteSpy = sandbox.stub(store, '_delete').returns(Promise.resolve());

		var model = store.define('myModel', {});
		store.delete('myModel', pk).then(function() {
			deleteSpy.called.should.be.true;
			deleteSpy.calledWith(model, pk).should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype._filter() should return a Promise rejected', function(done) {
		store._filter().catch(function(err) {
			err.message.should.equal('Store.prototype._filter(model, query) is not implemented');
			done();
		});
	});

	it('Store.prototype._get() should return a Promise rejected', function(done) {
		store._get().catch(function(err) {
			err.message.should.equal('Store.prototype._get(model, pk) is not implemented');
			done();
		});
	});

	it('Store.prototype._set() should return a Promise rejected', function(done) {
		store._set().catch(function(err) {
			err.message.should.equal('Store.prototype._set(model, obj, operation) is not implemented');
			done();
		});
	});

	it('Store.prototype._delete() should return a Promise rejected', function(done) {
		store._delete().catch(function(err) {
			err.message.should.equal('Store.prototype._delete(query) is not implemented');
			done();
		});
	});

	describe('Cache Integration should', function() {

		var cache;

		beforeEach(function() {
			cache = new MyCache();
		});

		it('have cache objext', function(done) {
			var store = new Store();
			store.cache.should.equal(false);

			var store = new Store(cache);
			store.cache.should.equal(cache);
			done();
		});

		it('return from cache when get', function(done) {
			var store = new Store(cache);

			var pk = '1234';
			var instance = Promise.resolve({ foo: 'bar' });
			var getStub = sandbox.stub(store, '_get').returns(instance);

			var model = store.define('myModel', {});

			store.get('myModel', pk).then(function(expected) {
				store.get('myModel', pk).then(function(actual) {
					(getStub.calledOnce == true).should.equal(true);
					(getStub.calledWith(model, pk) == true).should.equal(true);
					actual.should.equal(expected);
					done();
				}).catch(done);
			}).catch(done);
		});

		it('set to cache when create', function(done) {
			var obj = { pk: '1234' };
			var resolved = Promise.resolve(obj);

			var store = new Store(cache);
			var model = store.define('myModel', { pk: { type: 'String', primaryKey: true } });

			var createStub = sandbox.stub(store, '_set').returns(resolved);
			var getStub = sandbox.stub(store, '_get').returns(resolved);

			store.create('myModel', obj).then(function(actual) {
				store.get('myModel', obj.pk).then(function(expected) {
					getStub.called.should.equal(false);
					expected.should.equal(actual);
					done();
				}).catch(done);
			}).catch(done);
		});

		it('set to cache when update', function(done) {
			var obj = { pk: '1234' };
			var resolved = Promise.resolve(obj);

			var store = new Store(cache);
			var model = store.define('myModel', { pk: { type: 'String', primaryKey: true } });

			var createStub = sandbox.stub(store, '_set').returns(resolved);
			var getStub = sandbox.stub(store, '_get').returns(resolved);

			store.update('myModel', obj).then(function(actual) {
				store.get('myModel', obj.pk).then(function(expected) {
					getStub.called.should.equal(false);
					expected.should.equal(actual);
					done();
				}).catch(done);
			}).catch(done);
		});
	});
	
});
