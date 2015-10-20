var chai = require('chai');
var Schema = require('../lib/schema');
chai.should();
chai.use(require('chai-things'));

describe('Schema Tests', function() {

	describe('Schema.prototype.constructor() should', function() {

		it('throw an error if no schema definition is passed', function() {
			(function () {
			  new Schema();
			}).should.throw('A schema definition object should be passed');
		});

		it('parse schemas with simple and complex types', function() {
			var schemaDef = {
				simpleField: 'String',
				complexField: {
					type: 'String',
					required: true
				},
				complexFieldWithDefault: {
					type: 'String',
					default: 'this is the default value'
				}
			};

			var schema = new Schema(schemaDef);
			schema.properties.length.should.equal(4);
			schema.properties.should.include.something.that.deep.equals({
				key: 'simpleField',
				type: 'String'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'complexField',
				type: 'String',
				required: true
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'complexFieldWithDefault',
				type: 'String',
				default: 'this is the default value'
			});
			schema.properties.should.include.something.that.deep.equals({ 
				key: 'pk',
				type: 'String', 
				required: true
			});
		});

		it('parse schemas with object types', function() {

			var schemaDef = {
				firstLevel: {
					type: 'Object',
					fieldA: 'String',
					fieldB: 'Number',
					secondLevel: {
						type: 'Object',
						fieldC: {
							type: 'String',
							required: true
						}
					}
				}
			};

			var schema = new Schema(schemaDef);
			schema.properties.length.should.equal(6);
			schema.properties.should.include.something.that.deep.equals({
				key: 'firstLevel',
				type: 'Object'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'firstLevel.fieldA',
				type: 'String'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'firstLevel.fieldB',
				type: 'Number'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'firstLevel.secondLevel',
				type: 'Object'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'firstLevel.secondLevel.fieldC',
				type: 'String',
				required: true
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'pk',
				type: 'String',
				required: true
			});
		});

	});

	describe('Schema.prototype.validate() should', function() {

		before(function() {
			var schemaDef = {
				simpleField: 'Number',
				complexField: {
					type: 'Number'
				},
				nestedObject: {
					type: 'Object',
					stringField: 'String'
				}
			};

			this.schema = new Schema(schemaDef);			
		});

		it('return an error if a simple field has the wrong type', function(done) {
			this.schema.validate({
				pk: '1234',
				simpleField: 'this should be a number'
			}).catch(function(err) {
				err.message.should.equal('Property simpleField should be of type Number');
				done();
			});
		});

		it('return an error if a complex field has the wrong type', function(done) {
			this.schema.validate({
				pk: '1234',
				complexField: 'this should be a number'
			}).catch(function(err) {
				err.message.should.equal('Property complexField should be of type Number');
				done();
			});
		});

		it('return an error if nested object has the wrong type', function(done) {
			this.schema.validate({
				pk: '1234',
				nestedObject: 'this should be an object'
			}).catch(function(err) {
				err.message.should.equal('Property nestedObject should be of type Object');
				done();
			});
		});

		it('return an error if field in nested object has the wrong type', function(done) {
			this.schema.validate({
				pk: '1234',
				nestedObject: {
					stringField: 1234
				}
			}).catch(function(err) {
				err.message.should.equal('Property nestedObject.stringField should be of type String');
				done();
			});
		});

		it('return an error if we try to create instance with not defined field', function(done) {
			this.schema.validate({
				pk: '1234',
				notDefined: 'this is not in the schema'
			}).catch(function(err) {
				err.message.should.equal('Property notDefined is not defined in the schema');
				done();
			});
		});

		it('return an error if required field is missing', function(done) {
			this.schema.validate({}).catch(function(err) {
				err.message.should.equal('Properties [pk] are required');
				done();
			});
		});

	});

	describe('Schema.prototype.setDefaults() should', function() {

		before(function() {
			var schemaDef = {
				fieldWithoutDefault: 'String',
				fieldWithDefault: {
					type: 'Number',
					default: 1234
				},
				nestedObject: {
					type: 'Object',
					nestedFieldWithDefault: {
						type: 'String',
						default: 'this is the default value'
					}
				}
			};

			this.schema = new Schema(schemaDef);
		});

		it('set the default values', function(done) {
			this.schema.setDefaults({
				pk: '1234'
			}).then(function(objWithDefaults) {
				objWithDefaults.should.not.have.property('fieldWithoutDefault');
				objWithDefaults.should.have.property('fieldWithDefault', 1234);
				objWithDefaults.should.have.deep.property('nestedObject.nestedFieldWithDefault', 'this is the default value');
				done();
			});
		});

		it('not set a default value if one is already set by the user', function(done) {
			this.schema.setDefaults({
				pk: '1234',
				fieldWithDefault: 5678
			}).then(function(objWithDefaults) {
				objWithDefaults.should.have.property('fieldWithDefault', 5678);
				done();
			});
		});

	});

	
});
