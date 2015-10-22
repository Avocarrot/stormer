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

		it('throw an error if property with unsupported type is passed', function() {
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
			schema.properties.length.should.equal(3);
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
			schema.properties.length.should.equal(5);
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
		});

		it('parse schemas with array types', function() {

			var schemaDef = {
				ofStrings: {
					type: 'Array',
					of: 'String'
				},
				ofComplexStrings: {
					type: 'Array',
					of: {
						type: 'String',
						default: 'this is the default value'
					}
				},
				nestedObject: {
					type: 'Object',
					nestedOfNumbers: {
						type: 'Array',
						of: 'Number'
					}
				}
			};

			var schema = new Schema(schemaDef);
			schema.properties.length.should.equal(4);

			schema.properties.should.include.a.thing.with.property('key', 'ofStrings');
			schema.properties.should.include.a.thing.with.property('type', 'Array');
			schema.properties.should.include.a.thing.with.property('of');

			schema.properties.should.include.a.thing.with.property('key', 'ofComplexStrings');
			schema.properties.should.include.a.thing.with.property('type', 'Array');
			schema.properties.should.include.a.thing.with.property('of');

			schema.properties.should.include.something.that.deep.equals({
				key: 'nestedObject',
				type: 'Object'
			});

			schema.properties.should.include.a.thing.with.property('key', 'nestedObject.nestedOfNumbers');
			schema.properties.should.include.a.thing.with.property('type', 'Array');
			schema.properties.should.include.a.thing.with.property('of');

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

		it('return an error if a simple property has the wrong type', function(done) {
			this.schema.create({
				simpleField: 'this should be a number'
			}).catch(function(err) {
				err.message.should.equal('Property simpleField should be of type Number');
				done();
			});
		});

		it('return an error if a complex property has the wrong type', function(done) {
			this.schema.create({
				complexField: 'this should be a number'
			}).catch(function(err) {
				err.message.should.equal('Property complexField should be of type Number');
				done();
			});
		});

		it('return an error if nested object has the wrong type', function(done) {
			this.schema.create({
				nestedObject: 'this should be an object'
			}).catch(function(err) {
				err.message.should.equal('Property nestedObject should be of type Object');
				done();
			});
		});

		it('return an error if property in nested object has the wrong type', function(done) {
			this.schema.create({
				nestedObject: {
					stringField: 1234
				}
			}).catch(function(err) {
				err.message.should.equal('Property nestedObject.stringField should be of type String');
				done();
			});
		});

		it('ignore properties in the obj that are not defined by the schema', function(done) {
			this.schema.create({
				notDefined: 'this is not in the schema'
			}).then(function(obj) {
				obj.should.not.have.property('notDefined');
				done();
			});
		});

		it('return an error if required property is missing', function(done) {
			var schemaDef = {
				requiredProperty: {
					type: 'Number',
					required: true
				}
			};

			var schema = new Schema(schemaDef);	
			schema.create({}).catch(function(err) {
				err.message.should.equal('Property requiredProperty is required');
				done();
			});
		});

		describe('work with Array properties and', function() {

			before(function() {
				var schemaDef = {
					ofNumbers: {
						type: 'Array',
						of: 'Number'
					},
					ofStrings: {
						type: 'Array',
						of: 'String'
					},
					ofObjects: {
						type: 'Array',
						of: {
							type: 'Object',
							fieldA: 'String',
							fieldB: 'Number'
						}
					}
				};
				this.schema = new Schema(schemaDef);
			});

			it('return an error if an array property has the wrong type', function(done) {
				this.schema.create({
					ofStrings: 'this should be an array'
				}).catch(function(err) {
					err.message.should.equal('Property ofStrings should be of type Array');
					done();
				});
			});

			it('return an error if an array property has items with the wrong type', function(done) {
				this.schema.create({
					ofStrings: ['1', 2, '3'] // The array should have items of type String
				}).catch(function(err) {
					err.message.should.equal('Property ofStrings[1].subSchema should be of type String');
					done();
				});
			});

			it('return an error if an array of objects has items with the wrong type', function(done) {
				this.schema.create({
					ofObjects: [{fieldA: 1234}, {fieldA: '1234'}] // The array should have items of type Object
				}).catch(function(err) {
					err.message.should.equal('Property ofObjects[0].subSchema.fieldA should be of type String');
					done();
				});
			});

			it('create objects with properties of type array', function(done) {
				this.schema.create({
					ofObjects: [{fieldA: '1234'}, {fieldA: '1234'}] 
				}).then(function(instance) {
					instance.should.have.deep.property('ofObjects[0].fieldA', '1234');
					instance.should.have.deep.property('ofObjects[1].fieldA', '1234');
					done();
				});
			});

		});

		it('set the default values', function(done) {
			this.schema.create({}).then(function(objWithDefaults) {
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
				fieldWithDefault: 'do not override me'
			}).then(function(objWithDefaults) {
				objWithDefaults.should.have.property('fieldWithDefault', 'do not override me');
				done();
			});
		});

	});
	
});
