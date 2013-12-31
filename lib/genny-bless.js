var genny = require('genny');

var is_generator = function(fn) {

	if (typeof fn != "function") return;
	if (fn.constructor.name != "GeneratorFunction") return;

	return true;
};

var gentrify_keys = function(obj) {

	Object.keys(obj).forEach(function(key) {

		var fn = obj[key];
		if (!is_generator(fn)) return;

		obj[key] = genny.fn(fn);
	});
};

var gentrify = function(klass) {

	gentrify_keys(klass);
	gentrify_keys(klass.prototype);

	return klass;
};

module.exports = gentrify;

