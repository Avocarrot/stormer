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

		it('throw an error if field with unsupported type is passed', function() {
			(function () {
			  new Schema({
			  	invalidField: 'InvalidType'
			  });
			}).should.throw('Type InvalidType is not supported');
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

		it('parse schemas with array types', function() {

			var schemaDef = {
				arrayOfStrings: {
					type: 'Array',
					of: 'String'
				},
				arrayOfComplexStrings: {
					type: 'Array',
					of: {
						type: 'String',
						default: 'this is the default value'
					}
				},
				nestedObject: {
					type: 'Object',
					nestedArrayOfNumbers: {
						type: 'Array',
						of: 'Number'
					}
				}
			};

			var schema = new Schema(schemaDef);
			schema.properties.length.should.equal(8);
			schema.properties.should.include.something.that.deep.equals({
				key: 'arrayOfStrings',
				type: 'Array'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'arrayOfStrings.of',
				type: 'String'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'arrayOfComplexStrings',
				type: 'Array'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'arrayOfComplexStrings.of',
				type: 'String',
				default: 'this is the default value'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'nestedObject',
				type: 'Object'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'nestedObject.nestedArrayOfNumbers',
				type: 'Array'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'nestedObject.nestedArrayOfNumbers.of',
				type: 'Number'
			});
			schema.properties.should.include.something.that.deep.equals({
				key: 'pk',
				type: 'String',
				required: true
			});
		});

	});

	describe('Schema.prototype.create() should', function() {

		before(function() {
			var schemaDef = {
				simpleField: 'Number',
				complexField: {
					type: 'Number'
				},
				fieldWithDefault: {
					type: 'String',
					default: 'this is the default value'
				},
				arrayOfStringsField: {
					type: 'Array',
					of: 'String'
				},
				arrayOfObjectsField: {
					type: 'Array',
					of: {
						type: 'Object',
						fieldA: 'String',
						fieldB: 'Number'
					}
				},
				nestedObject: {
					type: 'Object',
					stringField: 'String',
					nestedFieldWithDefault: {
						type: 'Number',
						default: 1234
					}
				}
			};

			this.schema = new Schema(schemaDef);			
		});

		it('return an error if a simple field has the wrong type', function(done) {
			this.schema.create({
				pk: '1234',
				simpleField: 'this should be a number'
			}).catch(function(err) {
				err.message.should.equal('Property simpleField should be of type Number');
				done();
			});
		});

		it('return an error if a complex field has the wrong type', function(done) {
			this.schema.create({
				pk: '1234',
				complexField: 'this should be a number'
			}).catch(function(err) {
				err.message.should.equal('Property complexField should be of type Number');
				done();
			});
		});

		it('return an error if nested object has the wrong type', function(done) {
			this.schema.create({
				pk: '1234',
				nestedObject: 'this should be an object'
			}).catch(function(err) {
				err.message.should.equal('Property nestedObject should be of type Object');
				done();
			});
		});

		it('return an error if field in nested object has the wrong type', function(done) {
			this.schema.create({
				pk: '1234',
				nestedObject: {
					stringField: 1234
				}
			}).catch(function(err) {
				err.message.should.equal('Property nestedObject.stringField should be of type String');
				done();
			});
		});

		it('ignore fields in the obj that are not defined by the schema', function(done) {
			this.schema.create({
				pk: '1234',
				notDefined: 'this is not in the schema'
			}).then(function(obj) {
				obj.should.not.have.property('notDefined');
				done();
			});
		});

		it('return an error if required field is missing', function(done) {
			this.schema.create({}).catch(function(err) {
				err.message.should.equal('Property pk is required');
				done();
			});
		});

		it('return an error if an array field has the wrong type', function(done) {
			this.schema.create({
				pk: '1234',
				arrayOfStringsField: 'this should be an array'
			}).catch(function(err) {
				err.message.should.equal('Property arrayOfStringsField should be of type Array');
				done();
			});
		});

		it('return an error if an array field has items with the wrong type', function(done) {
			this.schema.create({
				pk: '1234',
				arrayOfStringsField: ['1', 2, '3'] // The array should have items of type String
			}).catch(function(err) {
				err.message.should.equal('Element at index 1 of property arrayOfStringsField.of should be of type String');
				done();
			});
		});

		it('return an error if an array of objects has items with the wrong type', function(done) {
			this.schema.create({
				pk: '1234',
				arrayOfObjectsField: [{fieldA: 1234}, {fieldA: '1234'}] // The array should have items of type Object
			}).catch(function(err) {
				err.message.should.equal('Element at index 0 of property arrayOfObjectsField.of.fieldA should be of type String');
				done();
			});
		});

		it('set the default values', function(done) {
			this.schema.create({
				pk: '1234'
			}).then(function(objWithDefaults) {
				objWithDefaults.should.not.have.property('simpleField');
				objWithDefaults.should.not.have.property('complexField');
				objWithDefaults.should.not.have.property('arrayOfStringsField');
				objWithDefaults.should.have.property('fieldWithDefault', 'this is the default value');
				objWithDefaults.should.have.deep.property('nestedObject.nestedFieldWithDefault', 1234);
				done();
			});
		});

		it('not set a default value if one is already set by the user', function(done) {
			this.schema.create({
				pk: '1234',
				fieldWithDefault: 'do not override me'
			}).then(function(objWithDefaults) {
				objWithDefaults.should.have.property('fieldWithDefault', 'do not override me');
				done();
			});
		});

	});

	// describe.skip('Schema.prototype.create() should', function() {

	// 	it('create object with array field', function(done) {

	// 		var schemaDef = {
	// 			arrayOfStrings: {
	// 				type: 'Array',
	// 				of: 'String'
	// 			},
	// 			arrayOfObjects: {
	// 				type: 'Array',
	// 				of: {
	// 					type: 'Object',
	// 					fieldA: 'Number',
	// 					fieldB: 'String'
	// 				}
	// 			} 
	// 		};

	// 		var schema = new Schema(schemaDef);

	// 		schema.create({
	// 			pk: '1234',
	// 			arrayOfStrings: ['str1', 'str2'],
	// 			arrayOfObjects: [{fieldA: 1, fieldB: 'str1'}, {fieldA: 2, fieldB: 'str2'}]
	// 		}).then(function(obj) {
	// 			obj.should.have.property('pk', '1234');
	// 			obj.should.have.deep.property('arrayOfStrings[0]', 'str1');
	// 			obj.should.have.deep.property('arrayOfStrings[1]', 'str2');
	// 			obj.should.have.deep.property('arrayOfObjects[0].fieldA', 1);
	// 			obj.should.have.deep.property('arrayOfObjects[0].fieldB', 'str1');
	// 			obj.should.have.deep.property('arrayOfObjects[1].fieldA', 2);
	// 			obj.should.have.deep.property('arrayOfObjects[1].fieldB', 'str2');
	// 			done();
	// 		});
	// 	});

	// });
	
});
