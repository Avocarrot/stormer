exports.isObject = function(obj) {
	return typeof obj === 'object';
};

exports.isUndefined = function(value) {
  return typeof value === 'undefined';
};

exports.setValueAtPath = function(obj, path, value) {
	var pathSteps = path.split('.');
	var pathLength = pathSteps.length;

	var isLastStep = function(stepDepth) {
		return stepDepth === pathLength - 1;
	};

	pathSteps.forEach(function(step, i) {
		if (!obj.hasOwnProperty(step)) {
			obj[step] = {};
		}

		if (isLastStep(i)) {
			obj[step] = value;
		} 
		obj = obj[step];
	});
};