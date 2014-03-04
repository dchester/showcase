var gx = require('gx');
var suite = require('./lib');
var Permission = require('../lib/permission');

exports.setUp = suite.setUp;
exports.tearDown = suite.tearDown;

exports.id = function(test) {

	gx(function*() {
		test.equal(Permission.id('administrator'), 1);
		test.equal(Permission.id('editor'), 2);
		test.equal(Permission.id('viewer'), 3);
		test.done();
	});
};

exports.name = function(test) {

	gx(function*() {
		test.equal(Permission.name(1), 'administrator');
		test.equal(Permission.name(2), 'editor');
		test.equal(Permission.name(3), 'viewer');
		test.done();
	});
};

