var fs = require('fs');
var showcase = require('../index');
var config = require('./lib/config');
var execute = require('genny').run;

showcase.initialize(config.showcase);

var dream = require('dreamer').instance;
var error = function(e) { console.warn(e) };
var Collection = require('../lib/collection.js');

exports.setUp = function(callback) {
	dream.db.drop().success(function() {
		dream.db.sync().success(function() { 
			callback()
		});
	});
};

exports.tearDown = function(callback) {
	dream.db.drop().success(function() {
		callback();
	});
};

exports.create = function(test) {

	execute (function* (resume) {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields,
		}, resume());

		test.equal(collection.title, 'Books');
		test.equal(collection.description, 'Books for reading');
		test.equal(collection.workspace_handle, 'test');
		test.done();
	});
};

exports.load = function(test) {

	execute (function* (resume) {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields,
		}, resume());

		collection = yield Collection.load({ id: collection.id }, resume());

		test.equal(collection.title, 'Books');
		test.equal(collection.description, 'Books for reading');
		test.equal(collection.workspace_handle, 'test');
		test.done();
	});
};

exports.update = function(test) {

	execute (function* (resume) {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields
		}, resume());

		collection = yield Collection.load({ id: collection.id }, resume());

		yield collection.update({ title: "Wonderful Books" }, resume());
		collection = yield Collection.load({ id: collection.id }, resume());

		test.equal(collection.title, "Wonderful Books");
		test.done();
	});
};

exports.all = function(test) {

	execute (function* (resume) {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields,
		}, resume());

		var collections = yield Collection.all({ workspace_handle: 'test' }, resume());

		test.equal(collections.length, 1);
		test.done();
	});
};

exports.destroy = function(test) {

	execute (function* (resume) {

		var collection = yield Collection.create({
			title: 'Books',
			description: 'Books for reading',
			name: 'books',
			workspace_handle: 'test',
			fields: config.fixtures.book_fields,
		}, resume());

		var collection_id = collection.id;

		yield collection.destroy({ id: collection_id }, resume());
		collection = yield Collection.load({ id: collection_id }, resume());

		test.equal(collection, undefined);
		test.done();
	})
};

