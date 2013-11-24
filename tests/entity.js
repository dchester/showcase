var fs = require('fs');
var showcase = require('../index');
var config = require('./lib/config');

showcase.initialize(config.showcase);

var dream = require('dreamer').instance;
var error = function(e) { console.warn(e) };
var Entity = require('../lib/entity.tjs');

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

	var entity = Entity.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(entity) {
			test.equal(entity.title, 'Books');
			test.equal(entity.description, 'Books for reading');
			test.equal(entity.workspace_handle, 'test');
			test.done();
		}
	});
};

exports.update = function(test) {

	var entity = Entity.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(entity) {

			Entity.update({
				title: "Wonderful Books",
				description: 'Books for reading',
				name: 'books',
				workspace_handle: 'test',
				fields: config.fixtures.book_fields,
				id: entity.id,
				success: function(entity) {
					test.equal(entity.title, "Wonderful Books");
					test.done();
				}
			});

		}
	});
};

exports.find = function(test) {

	var entity = Entity.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(entity) {

			Entity.find({
				id: entity.id,
				success: function(entity) {
					test.equal(entity.title, 'Books');
					test.equal(entity.description, 'Books for reading');
					test.equal(entity.workspace_handle, 'test');
					test.done();
				}
			});

		}
	});
};

exports.findAll = function(test) {

	var entity = Entity.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(entity) {

			Entity.findAll({
				workspace_handle: 'test',
				success: function(entities) {
					test.equal(entities.length, 1);
					test.done();
				}
			});

		}
	});
};

exports.destroy = function(test) {

	var entity = Entity.create({
		title: 'Books',
		description: 'Books for reading',
		name: 'books',
		workspace_handle: 'test',
		fields: config.fixtures.book_fields,
		error: error,
		success: function(entity) {

			Entity.destroy({
				id: entity.id,
				success: function(entity) {
					test.equal(entity.title, 'Books');
					test.equal(entity.description, 'Books for reading');
					test.equal(entity.workspace_handle, 'test');
					test.done();
				}
			});

		}
	});
};

