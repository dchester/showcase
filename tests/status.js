var gx = require('gx');
var suite = require('./lib');
var Status = require('../lib/status');

exports.setUp = suite.setUp;
exports.tearDown = suite.tearDown;

exports.id = function(test) {

	gx(function*() {
		test.equal(Status.id('draft'), 1);
		test.equal(Status.id('published'), 2);
		test.done();
	});
};

exports.name = function(test) {

	gx(function*() {
		test.equal(Status.name(1), 'draft');
		test.equal(Status.name(2), 'published');
		test.done();
	});
};

