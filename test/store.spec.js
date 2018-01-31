var chai = require('chai');
var sinon = require('sinon');
var Store = require('../lib/store');
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

  describe('Store.prototype.alias() should', function() {
		it('set an alias for a model', function(done) {
			store.define('myModel', {});
			store.models.should.have.property('myModel');
      store.alias('aliasModel', 'myModel');
      store.getModel('aliasModel').should.equal(store.getModel('myModel'));
      done();
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

		var model = store.define('myModel', { pk: 'String' });
		store.create('myModel', fakeObj).then(function() {
			createStub.called.should.be.true;
			createStub.calledWith(model, fakeObj, 'create').should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.create() should honor schema defaults', function(done) {
		var fakeObj = { pk: '1234' };
		var createStub = sandbox.stub(store, '_set').returns(Promise.resolve());

		var model = store.define('myModel', { pk: 'String', foo: { type: 'String', default: 'bar' } });
		store.create('myModel', fakeObj).then(function() {
			createStub.calledWith(model, { pk: '1234', foo: 'bar' }, 'create').should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.update() should call Store.prototype._set()', function(done) {
		var fakeObj = { pk: '1234'};
		var updateSpy = sandbox.stub(store, '_set').returns(Promise.resolve());

		var model = store.define('myModel', { pk: 'String' });
		store.update('myModel', fakeObj).then(function() {
			updateSpy.called.should.be.true;
			updateSpy.calledWith(model, fakeObj, 'update').should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.update() should ignore schema defaults', function(done) {
		var fakeObj = { pk: '1234' };
		var createStub = sandbox.stub(store, '_set').returns(Promise.resolve());

		var model = store.define('myModel', { pk: 'String', foo: { type: 'String', default: 'bar' } });
		store.update('myModel', fakeObj).then(function() {
			createStub.calledWith(model, { pk: '1234' }, 'update').should.be.true;
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

});
