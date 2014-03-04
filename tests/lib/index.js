var showcase = require('../../index');
var config = require('../lib/config');
var gx = require('gx');

showcase.initialize(config.showcase);

var dreamer = require('dreamer');
var dream = dreamer.instance;
var error = function(e) { console.warn(e) };
var models = dream.models;
var Status = require('../../lib/status');
var Permission = require('../../lib/permission');

exports.setUp = function(callback) {

	gx(function*() {
		yield dream.db.drop().complete(gx.resume);
		yield dream.db.sync().complete(gx.resume);
		yield dreamer.Fixtures.sync(dream, dream.fixtures, gx.resume);
		yield Status.load();
		yield Permission.load();
		callback();
	});
};

exports.tearDown = function(callback) {
	dream.db.drop().success(function() {
		callback();
	});
};

process.on('uncaughtException', function(err) {
	console.warn("ERROR: " + err);
	throw new Error(err);
});

