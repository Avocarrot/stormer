var chai = require('chai');
var _ = require('../lib/utils');
chai.should();

describe('Utils Tests', function() {

	describe('setValueAtPath() should', function() {

		it('set value in flat objects', function() {
			var obj = { firstLevel: 1 };
			_.setValueAtPath(obj, 'firstLevel', 2)
			obj.should.have.property('firstLevel', 2);
		});

		it('set value in nested objects', function() {
			var obj = { 
				firstLevel: {
					secondLevel: {
						value: 1
					}
				} 
			};
			_.setValueAtPath(obj, 'firstLevel.secondLevel.value', 3);
			obj.should.have.deep.property('firstLevel.secondLevel.value', 3);
		});

		it('create path and set value if the path did not exist', function() {
			var obj = {};
			_.setValueAtPath(obj, 'firstLevel.secondLevel.value', 3);
			obj.should.have.deep.property('firstLevel.secondLevel.value', 3);
		});
	
	});
	
});
