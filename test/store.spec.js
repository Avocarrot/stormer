var chai = require('chai');
var sinon = require('sinon');
var Store = require('../lib/store');
var Model = require('../lib/model');
var util = require('util');
chai.should();

var sandbox = sinon.sandbox.create();

describe('Store Tests', function() {

	afterEach(function() {
		sandbox.restore();
	});

	it('Store.prototype.define() should define a new model', function() {
		var store = new Store();
		store.define('myModel', {});
		store.models.should.have.property('myModel');
		store.models.myModel.should.be.an.instanceOf(Model);
	});

	it('Store.prototype.callModelFunction() should return an error if model is not defined', function(done) {
		var store = new Store();
		store.callModelFunction('myModel', 'get', '1234').catch(function(err) {
			err.message.should.equal('Model myModel is not defined');
			done();
		});
	});

	it('Store.prototype.get() should call Model.prototype.get()', function(done) {
		var store = new Store();
		var pk = '1234';
		var getSpy = sandbox.spy();

		store.define('myModel', {});
		store.models.myModel.get = getSpy;
		store.get('myModel', pk).then(function() {
			getSpy.called.should.be.true;
			getSpy.calledWith(pk, store).should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.create() should call Model.prototype.set()', function(done) {
		var store = new Store();
		var fakeObj = { pk: '1234'};
		var createSpy = sandbox.spy();

		store.define('myModel', {});
		store.models.myModel.set = createSpy;
		store.create('myModel', fakeObj).then(function() {
			createSpy.called.should.be.true;
			createSpy.calledWith(fakeObj, 'create', store).should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.update() should call Model.prototype.set()', function(done) {
		var store = new Store();
		var fakeObj = { pk: '1234'};
		var updateSpy = sandbox.spy();

		store.define('myModel', {});
		store.models.myModel.set = updateSpy;
		store.update('myModel', fakeObj).then(function() {
			updateSpy.called.should.be.true;
			updateSpy.calledWith(fakeObj, 'update', store).should.be.true;
			done();
		}).catch(done);
	});

	it('Store.prototype.delete() should call Model.prototype.delete()', function(done) {
		var store = new Store();
		var pk= '1234';
		var deleteSpy = sandbox.spy();

		store.define('myModel', {});
		store.models.myModel.delete = deleteSpy;
		store.delete('myModel', pk).then(function() {
			deleteSpy.called.should.be.true;
			deleteSpy.calledWith(pk, store).should.be.true;
			done();
		}).catch(done);
	});

  it('Store.prototype.alias() should decoreate model name', function(done) {
    var store = new Store();
    store.alias = function(name) {
      return util.format('%s.%s', 'test', name);
    };
    var expected = 'test.x';
    var actual = store.alias('x');
    expected.should.equal(actual);

    store.define('myModel', {});
		store.models.should.have.property('test.myModel');
    store.models['test.myModel'].should.be.an.instanceOf(Model);
    done();
  });
	
});
