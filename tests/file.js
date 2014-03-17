var gx = require('gx');
var mkdirp = require('mkdirp');
var suite = require('./lib');
var showcase = require('../index');
var config = require('./lib/config');
var fs = require('fs');

showcase.initialize(config.showcase);

var dream = require('dreamer').instance;
var error = function(e) { console.warn(e) };

var File = require('../lib/file.js');

exports.tearDown = suite.tearDown;

exports.setUp = function(callback) {

	suite.setUp(function() {
		fs.writeFileSync('/tmp/showcase-file1', 'contents1');
		fs.writeFileSync('/tmp/showcase-file2', 'contents2');
		mkdirp.sync('/var/tmp/showcase-test/files');
		callback();
	});
};

exports.create = function(test) {

	gx(function*() {

		var file = yield File.create({
			source_path: '/tmp/showcase-file1',
			size: 100,
			item_id: 3,
			content_type: 'text/plain',
			original_filename: 'file.txt',
			storage_path: '/var/tmp/showcase-test'
		});

		test.equal(file.item_id, 3);
		test.equal(file.original_filename, 'file.txt');
		test.equal(file.content_type, 'text/plain');
		test.equal(file.size, 100);

		test.done();
	});
};

exports.load = function(test) {

	gx(function*() {

		var file = yield File.create({
			source_path: '/tmp/showcase-file1',
			size: 100,
			item_id: 7,
			content_type: 'text/plain',
			original_filename: 'file.txt',
			storage_path: config.showcase.files.storage_path
		});

		var loaded_file = yield File.load({ id: file.id });

		test.equal(loaded_file.id, 1);
		test.equal(loaded_file.item_id, 7);
		test.equal(loaded_file.original_filename, 'file.txt');
		test.equal(loaded_file.content_type, 'text/plain');
		test.equal(loaded_file.size, 100);

		test.done();
	});
};

exports.retrieve = function(test) {

	gx(function*() {

		var file = yield File.create({
			source_path: '/tmp/showcase-file1',
			size: 100,
			item_id: 7,
			content_type: 'text/plain',
			original_filename: 'file.txt',
			storage_path: config.showcase.files.storage_path
		});

		var stream = file.retrieve();
		var buffer = '';

		stream.on('data', function(chunk) {
			buffer += chunk;
		});

		stream.on('end', function() {
			test.equal(buffer, 'contents1');
			test.done();
		});
	});
};


