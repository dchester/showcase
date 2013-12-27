var fs = require('fs');
var showcase = require('../index');
var config = require('./lib/config');

showcase.initialize(config.showcase);

var dream = require('dreamer').instance;
var error = function(e) { console.warn(e) };
var Collection = require('../lib/collection.tjs');

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

	var collection = Collection.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(collection) {
			test.equal(collection.title, 'Books');
			test.equal(collection.description, 'Books for reading');
			test.equal(collection.workspace_handle, 'test');
			test.done();
		}
	});
};

exports.update = function(test) {

	var collection = Collection.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(collection) {

			Collection.update({
				title: "Wonderful Books",
				description: 'Books for reading',
				name: 'books',
				workspace_handle: 'test',
				fields: config.fixtures.book_fields,
				id: collection.id,
				success: function(collection) {
					test.equal(collection.title, "Wonderful Books");
					test.done();
				}
			});

		}
	});
};

exports.find = function(test) {

	var collection = Collection.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(collection) {

			Collection.find({
				id: collection.id,
				success: function(collection) {
					test.equal(collection.title, 'Books');
					test.equal(collection.description, 'Books for reading');
					test.equal(collection.workspace_handle, 'test');
					test.done();
				}
			});

		}
	});
};

exports.findAll = function(test) {

	var collection = Collection.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(collection) {

			Collection.findAll({
				workspace_handle: 'test',
				success: function(collections) {
					test.equal(collections.length, 1);
					test.done();
				}
			});

		}
	});
};

exports.destroy = function(test) {

	var collection = Collection.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(collection) {

			Collection.destroy({
				id: collection.id,
				success: function(collection) {
					test.equal(collection.title, 'Books');
					test.equal(collection.description, 'Books for reading');
					test.equal(collection.workspace_handle, 'test');
					test.done();
				}
			});

		}
	});
};

