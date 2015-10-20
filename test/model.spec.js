var Promise = require('bluebird');
var chai = require('chai');
var util = require('util');
var Model = require('../lib/model');
var mockStore = require('./mocks/store');
var NotFoundError = require('../lib/errors/NotFoundError');
var ValidationError = require('../lib/errors/ValidationError');

chai.should();

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
	});

	beforeEach(function() {
		mockStore.restore();	
	});

	it('Model.prototype.constructor() should throw an error if no schema is passed', function() {
		(function () {
		  new Model();
		}).should.throw('Cannot create model without schema');
	});	

	describe('Model.prototype.get() should', function() {

		it('return the instance if it is found', function(done) {
			var model = this.model;
			
			mockStore.createEntry({
				pk: '1',
				complexNumericField: 1234
			}).then(function() {
				model.get('1', mockStore).then(function(instance){
					instance.should.have.property('pk', '1');
					done();
				});
			});

		});

		it('return an error if the instance is not found', function(done) {
			this.model.get('2', mockStore).catch(function(err){
				err.message.should.equal('Instance with pk 2 is not found');
				done();
			});
		});
	
	});

	describe('Model.prototype.create() should', function() {
	
		it('not create instance with wrong field types', function(done) {
			this.model.create({
				pk: 1234,
				numericField: 'this should be a number',
				stringField: 1,
				complexNumericField: 'this should be a number too'
			}, mockStore).catch(function(err) {
				err.should.be.an.instanceOf(ValidationError);
				err.message.should.equal('Property pk should be of type String');
				done();
			});
		});

		it('not create instance without all the required fields', function(done) {
			this.model.create({}, mockStore).catch(function(err) {
				err.should.be.an.instanceOf(ValidationError);
				err.message.should.equal('Properties [complexNumericField, pk] are required');
				done();
			});
		});

		it('create an instance with the default values', function(done) {
			this.model.create({
				pk: '1234',
				numericField: 1,
				stringField: 'This is a test',
				complexNumericField: 1234
			}, mockStore).then(function(instance) {
				instance.should.have.property('complexStringField', 'This is my default value');
				done();
			}).catch(done);
		});

		it('create and save a valid instance', function(done) {
			this.model.create({
				pk: '1234',
				numericField: 1,
				stringField: 'This is a test',
				complexNumericField: 1234
			}, mockStore).then(function(instance) {
				mockStore.items.length.should.equal(1);
				done();
			}).catch(done);
		});

	});

	describe('Model.prototype.update() should', function() {
	
		it('not update an instance with wrong field types', function(done) {
			this.model.update({
				pk: 1234,
				numericField: 'this should be a number',
				stringField: 1,
				complexNumericField: 'this should be a number too'
			}, mockStore).catch(function(err) {
				err.should.be.an.instanceOf(ValidationError);
				err.message.should.equal('Property pk should be of type String');
				done();
			});
		});

		it('not update an instance without all the required fields', function(done) {
			this.model.update({}, mockStore).catch(function(err) {
				err.should.be.an.instanceOf(ValidationError);
				err.message.should.equal('Properties [complexNumericField, pk] are required');
				done();
			});
		});

		it('return an error if instance does not exist', function(done) {
			this.model.update({
				pk: '1234',
				complexNumericField: 1234
			}, mockStore).catch(function(err) {
				err.should.be.an.instanceOf(NotFoundError);
				done();
			});
		});

		it('update and save a valid instance', function(done) {
			var that = this;
			mockStore.createEntry({
				pk: '1234',
				complexNumericField: 1234
			}).then(function() {
				return that.model.update({
					pk: '1234',
					numericField: 1,
					stringField: 'This is a test',
					complexNumericField: 1234
				}, mockStore).then(function(instance) {
					mockStore.items.length.should.equal(1);
					done();
				});
			}).catch(done);

		});

	});
	
});
