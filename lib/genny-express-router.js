var express = require('express');
var genny = require('genny');

var _set = express.application.set;

express.application.set = function(setting, val) {

	// punch this in since it's otherwise inaccessible
	if (setting == 'router' && val) {
		this._router = val;
	}
	return _set.apply(this, arguments);
};

var router = new express.Router(); 
var _route = router.route;

router.route = function(method, path, callbacks) {

	var functions = [];
	var callbacks = flatten([].slice.call(arguments, 2));

	callbacks.forEach(function(callback) {

		if (callback.constructor.name == 'GeneratorFunction') {
			functions.push(function(req, res) { genny.fn(callback)(req, res) });
		} else {
			functions.push(callback);
		}
	});

	_route.call(this, method, path, functions);
};

// from express utils
function flatten(arr, ret) {

	var ret = ret || [];
	var len = arr.length;

	for (var i = 0; i < len; ++i) {
		if (Array.isArray(arr[i])) {
			flatten(arr[i], ret);
		} else {
			ret.push(arr[i]);
		}
	}
	return ret;
};

module.exports = router;
