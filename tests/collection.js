var fs = require('fs');
var gx = require('gx');

var suite = require('./lib');
var showcase = require('../index');
var config = require('./lib/config');

showcase.initialize(config.showcase);

var dream = require('dreamer').instance;
var error = function(e) { console.warn(e) };
var Collection = require('../lib/collection.js');

exports.setUp = suite.setUp;
exports.tearDown = suite.tearDown;

exports.create = function(test) {

	gx(function*() {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields,
		});

		test.equal(collection.title, 'Books');
		test.equal(collection.description, 'Books for reading');
		test.equal(collection.workspace_handle, 'test');
		test.done();

	});
};

exports.load = function(test) {

	gx(function*() {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields,
		});

		collection = yield Collection.load({ id: collection.id });

		test.equal(collection.title, 'Books');
		test.equal(collection.description, 'Books for reading');
		test.equal(collection.workspace_handle, 'test');
		test.done();
	});
};

exports.update = function(test) {

	gx(function*() {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields
		});

		collection = yield Collection.load({ id: collection.id });

		yield collection.update({ title: "Wonderful Books" });
		collection = yield Collection.load({ id: collection.id });

		test.equal(collection.title, "Wonderful Books");
		test.done();
	});
};

exports.all = function(test) {

	gx(function*() {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields,
		});

		var collections = yield Collection.all({ workspace_handle: 'test' });

		test.equal(collections.length, 1);
		test.done();
	});
};

exports.destroy = function(test) {

	gx(function*() {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields,
		});

		var collection_id = collection.id;

		yield collection.destroy();
		collection = yield Collection.load({ id: collection_id });

		test.equal(collection, undefined);
		test.done();
	});
};

