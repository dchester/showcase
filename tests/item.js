var fs = require('fs');
var showcase = require('../index');
var config = require('./lib/config');

showcase.initialize(config.showcase);

var dream = require('dreamer').instance;
var error = function(e) { console.warn(e) };
var models = dream.models;

var Item = require('../lib/item.tjs');
var Entity = require('../lib/entity.tjs');

exports.setUp = function(callback) {
	dream.db.drop().success(function() {
		dream.db.sync().success(function() { 
			models.users.create({ username: 'bob' })
				.success(function() {
					Entity.create({
						title: 'Books',
						description: 'Books for reading',
						name: 'books',
						workspace_handle: 'test',
						fields: config.fixtures.book_fields,
						success: function() { callback() }
					});
				});
		});
	});
};

exports.tearDown = function(callback) {
	dream.db.drop().success(function() {
		callback();
	});
};

exports.create = function(test) {

	Item.create({
		entity_id: 1,
		data: {
			title: "Rung Ho!",
			author: "Talbot Mundy",
			isbn: "1557424047"
		},
		error: error,
		invalid: error,
		user_id: 1,
		success: function(item) {
			test.equal(item.title, "Rung Ho!");
			test.equal(item.author, "Talbot Mundy");
			test.equal(item.isbn, "1557424047");
			test.done();
		}
	});
};

exports.update = function(test) {

	Item.create({
		entity_id: 1,
		data: {
			title: "Rung Ho!",
			author: "Talbot Mundy",
			isbn: "1557424047"
		},
		error: error,
		invalid: error,
		user_id: 1,
		success: function(item) {
			Item.update({
				id: item.id,
				user_id: 1,
				data: {
					title: "Rung Ho!",
					author: "Talbot Mundy",
					isbn: "9781557424044"
				},
				success: function(item) {
					test.equal(item.title, "Rung Ho!");
					test.equal(item.author, "Talbot Mundy");
					test.equal(item.isbn, "9781557424044");
					test.done();
				}
			});
		}
	});
};

exports.find = function(test) {

	Item.create({
		entity_id: 1,
		data: {
			title: "Rung Ho!",
			author: "Talbot Mundy",
			isbn: "1557424047",
			is_public_domain: true
		},
		user_id: 1,
		error: error,
		invalid: error,
		success: function(item) {

			Item.find({
				id: item.id,
				success: function(item) {
					test.equal(item.title, "Rung Ho!");
					test.equal(item.author, "Talbot Mundy");
					test.equal(item.isbn, "1557424047");
					test.strictEqual(item.is_public_domain, true);
					test.done();
				}
			});
		}
	});
};

exports.validateRequired = function(test) {

	Item.create({
		entity_id: 1,
		data: {
			title: "",
			author: "Talbot Mundy",
			isbn: "1557424047"
		},
		user_id: 1,
		error: error,
		success: error,
		invalid: function(item_data) {
			test.equal(item_data._errors.title, 'Required');
			test.done();
		}
	});
};

exports.validateType = function(test) {

	Item.create({
		entity_id: 1,
		data: {
			title: "Rung Ho!",
			author: "Talbot Mundy",
			isbn: "alpha"
		},
		user_id: 1,
		error: error,
		success: error,
		invalid: function(item_data) {
			test.equal(item_data._errors.isbn, 'Failed assertion: isNumeric');
			test.done();
		}
	});
};

exports.findAll = function(test) {

	Item.create({
		entity_id: 1,
		data: {
			title: "Rung Ho!",
			author: "Talbot Mundy",
			isbn: "1557424047"
		},
		user_id: 1,
		error: error,
		invalid: error,
		success: function(item) {

			Item.findAll({
				id: item.id,
				entity_id: 1,
				success: function(items) {
					test.equal(items.length, 1);
					test.equal(items.totalCount, 1);
					test.equal(items[0].title, "Rung Ho!");
					test.equal(items.entity.name, "books");
					test.done();
				}
			});
		}
	});
};

exports.destroy = function(test) {

	Item.create({
		entity_id: 1,
		data: {
			title: "Rung Ho!",
			author: "Talbot Mundy",
			isbn: "1557424047"
		},
		user_id: 1,
		error: error,
		invalid: error,
		success: function(item) {
			Item.destroy({
				id: item.id,
				success: function(item) {
					test.equal(item.title, "Rung Ho!");
					Item.findAll({
						entity_id: 1,
						success: function(items) {
							test.equal(items.totalCount, 0);
							test.done();
						}
					});

					
				}
			})
		}
	});
};



