var Promise = require('bluebird');
var sinon = require('sinon');
var chai = require('chai');
var Model = require('../lib/model');
var Store = require('../lib/store');
var NotFoundError = require('../lib/errors/NotFoundError');

chai.should();

var sandbox = sinon.sandbox.create();

describe('Model Tests', function() {

	before(function() {
		var schema = {
			numericField: 'Number',
			stringField: 'String',
			complexNumericField: {
				type: 'Number',
				required: true
			},
			complexStringField: {
				type: 'String',
				default: 'This is my default value'
			}
		};

		this.model = new Model(schema);
		this.mockStore = new Store();
		this.instance = {
			pk: '1234'
		};
	});

	beforeEach(function() {
		sandbox.restore();
	});

	it('Model.prototype.constructor() should throw an error if no schema is passed', function() {
		(function () {
		  new Model();
		}).should.throw('Cannot create model without schema');
	});	

	describe('Model.prototype.get() should', function() {

		it('return the instance if it is found', function(done) {
			var that = this;
			sandbox.stub(this.mockStore, '_get').returns(Promise.resolve(this.instance));

			this.model.get('1234', this.mockStore).then(function(instance){
				that.mockStore._get.calledOnce.should.be.true;
				that.mockStore._get.calledWith(that.instance.pk).should.be.true;
				instance.should.equal(that.instance);
				done();
			});

		});

		it('return an error if the instance is not found', function(done) {
			var that = this;

			sandbox.stub(this.mockStore, '_get').returns(Promise.reject(new NotFoundError('Instance with pk 1234 is not found')));

			this.model.get('1234', this.mockStore).catch(function(err){
				that.mockStore._get.calledOnce.should.be.true;
				that.mockStore._get.calledWith(that.instance.pk).should.be.true;
				err.message.should.equal('Instance with pk 1234 is not found');
				done();
			});

		});
	
	});

	it('Model.prototype.filter(query) should call Store.prototype._filter(query)', function() {
		var that = this;
		var query = {
			fieldA: 1
		};
		sandbox.stub(this.mockStore, '_filter').returns(Promise.resolve([this.instance, this.instance]));

		this.model.filter(query, this.mockStore).then(function(instances){
			that.mockStore._filter.calledOnce.should.be.true;
			that.mockStore._filter.calledWith(query).should.be.true;
			instances.length.should.equal(2);
			done();
		});
	});

	describe('Model.prototype.set() should', function() {

		it('return an error if schema has failed to create new instance', function(done) {
			var that = this;
			var schema = this.model.schema;

			sandbox.stub(schema, 'create').returns(Promise.reject(new Error('Schema.prototype.create() failed')));

			this.model.set(this.instance, 'create', this.mockStore).catch(function(err) {
				schema.create.calledOnce.should.be.true;
				schema.create.calledWith(that.instance).should.be.true;
				err.message.should.equal('Schema.prototype.create() failed');
				done();
			}).catch(done);
		});

		it('save a valid instance', function(done) {
			var that = this;
			var schema = this.model.schema;

			sandbox.stub(this.mockStore, '_set').returns(Promise.resolve(this.instance));
			sandbox.stub(schema, 'create').returns(Promise.resolve(this.instance));

			this.model.set(this.instance, 'create', this.mockStore).then(function(createdInstance) {
				that.mockStore._set.calledOnce.should.be.true;	
				that.mockStore._set.calledWith(that.instance).should.be.true;
				schema.create.calledOnce.should.be.true;
				schema.create.calledWith(that.instance).should.be.true;
				createdInstance.should.equal(that.instance);
				done();
			}).catch(done);
		});

	});
	
});
