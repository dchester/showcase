var fs = require('fs');
var showcase = require('../index');
var config = require('./lib/config');
var gx = require('gx');

showcase.initialize(config.showcase);

var dream = require('dreamer').instance;
var error = function(e) { console.warn(e) };
var models = dream.models;

var Item = require('../lib/item.js');
var Collection = require('../lib/collection.js');

exports.setUp = function(callback) {
	dream.db.drop().success(function() {
		dream.db.sync().success(function() { 
			models.users.create({ username: 'bob' })
				.success(function() {
					Collection.create({
						title: 'Books',
						description: 'Books for reading',
						name: 'books',
						workspace_handle: 'test',
						fields: config.fixtures.book_fields,

					}, function(err, collection) {
						if (err) throw err;
						callback();
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

	gx(function*() {

		var item = yield Item.create({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047"
			},
		});

		test.equal(item.data.title, "Rung Ho!");
		test.equal(item.data.author, "Talbot Mundy");
		test.equal(item.data.isbn, "1557424047");
		test.done();
	});
};

exports.update = function(test) {

	gx(function*() {

		var item = yield Item.create({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047"
			},
		});

		item.update({
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "9781557424044"
			}
		});

		var item = yield item.save({ user_id: 1 });

		test.equal(item.data.title, "Rung Ho!");
		test.equal(item.data.author, "Talbot Mundy");
		test.equal(item.data.isbn, "9781557424044");
		test.done();
	});
};

exports.validateRequired = function(test) {

	gx(function*() {

		var item = yield Item.create({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047"
			},
		});

		item.update({
			data: {
				title: "Rung Ho!",
				author: "",
				isbn: "9781557424044"
			}
		});

		var errors = item.validate();

		test.deepEqual(errors, { author: 'Required' });
		test.done();
	});
};

exports.validateType = function(test) {

	gx(function*() {

		var item = yield Item.create({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047"
			},
		});

		item.update({
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "alpha"
			}
		});

		var errors = item.validate();

		test.deepEqual(errors, { isbn: 'Failed assertion: isNumeric' });
		test.done();
	});
};

exports.build = function(test) {

	gx(function*() {

		var item = yield Item.build({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047"
			},
		});

		test.equal(item.data.title, "Rung Ho!");
		test.equal(item.data.author, "Talbot Mundy");
		test.equal(item.data.isbn, "1557424047");

		test.done();
	});
};

exports.load = function(test) {

	gx(function*() {

		var item = yield Item.create({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047",
				is_public_domain: true
			}
		});

		item = yield Item.load({ id: item.id });

		test.equal(item.data.title, "Rung Ho!");
		test.equal(item.data.author, "Talbot Mundy");
		test.equal(item.data.isbn, "1557424047");
		test.strictEqual(item.data.is_public_domain, true);
		test.done();
	})
};

exports.all = function(test) {

	gx(function*() {

		var item = yield Item.create({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047"
			},
		});

		var items = yield Item.all({ collection_id: 1 });
			
		test.equal(items.length, 1);
		test.equal(items.totalCount, 1);
		test.equal(items[0].data.title, "Rung Ho!");
		test.equal(items.collection.name, "books");
		test.done();
	});
};

exports.destroy = function(test) {

	gx(function*() {

		var item = yield Item.create({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047"
			},
		});

		yield item.destroy();

		test.equal(item.data.title, "Rung Ho!");

		var items = yield Item.all({ collection_id: 1 });

		test.equal(items.totalCount, 0);
		test.done();

	});
};

