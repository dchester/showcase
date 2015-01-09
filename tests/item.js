var gx = require('gx');
var suite = require('./lib');
var config = require('./lib/config');

var dream = require('dreamer').instance;
var models = dream.models;

var Item = require('../lib/item.js');
var Collection = require('../lib/collection.js');


exports.setUp = function(callback) {

	suite.setUp(function() {

		gx(function*() {

			yield models.users.create({ username: 'bob', is_superuser: true }).complete(gx.resume);

			yield Collection.create({
				title: 'Books',
				description: 'Books for reading',
				name: 'books',
				workspace_handle: 'test',
				fields: config.fixtures.book_fields,
			});


			callback();
		});
	});
};

exports.tearDown = suite.tearDown;

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
		test.equal(item.status, "draft");
		test.done();
	});
};

exports.update = function(test) {

	gx(function*() {

		var file = models.files.build({
			id: 4,
			path: '/tmp/super-cool-image.jpg',
			original_filename: 'super-cool-image.jpg',
			content_type: 'image/jpeg',
			size: 2132,
			url: '/files/0cceddac0d9ecc44b8905cbd29234e406d598d34-super-cool-image.jpg'
		});
		file.save();

		var item = yield Item.create({
			collection_id: 1,
			user_id: 1,
			data: {
				title: "Rung Ho!",
				author: "Talbot Mundy",
				isbn: "1557424047",
				book_image: {
					file_id: 4
				}
			},
		});
		var item_id = item.id;


		item.update({
			status: 'published',
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
		test.equal(item.status, "published");
		test.equal(item.data.book_image.original_filename, "super-cool-image.jpg");

		// confirm successful retrieval of image file
		item = yield Item.load({ id: item_id });
		test.equal(item.data.book_image.original_filename, "super-cool-image.jpg");
		test.equal(item.data.book_image.size, "2132");

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

exports.validateCustomType = function(test) {

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
				isbn: "55555"
			}
		});

		// temporarily override the validator for isbn/number with a custom one
		var isbn_field = item.collection.fields.filter(function(o) { return o.name === 'isbn'; }).pop();

		isbn_field.control.validator = function(value,field) {
			return { is_valid: false, error_message: "custom message: "+value };
		};
		test.deepEqual(item.validate(), { isbn: 'Failed assertion: custom message: 55555' }, 'validator returns object: invalid');

		isbn_field.control.validator = function(value,field) { return { is_valid: false, error_message: '' }; };
		test.deepEqual(item.validate(), { isbn: 'Failed assertion: invalid value' }, 'validator returns object; zero-length error message');

		isbn_field.control.validator = function(value,field) { return { is_valid: false }; };
		test.deepEqual(item.validate(), { isbn: 'Failed assertion: invalid value' }, 'validator returns object; but no error message');

		isbn_field.control.validator = function(value,field) { return { is_valid: true }; };
		test.deepEqual(item.validate(), null, 'validator returns object: valid');

		isbn_field.control.validator = function(value,field) { return false; };
		test.deepEqual(item.validate(), { isbn: 'Failed assertion: invalid value' }, 'validator returns boolean: invalid');

		isbn_field.control.validator = function(value,field) { return true; };
		test.deepEqual(item.validate(), null, 'validator returns boolean: valid');

		isbn_field.control.validator = 'isNumeric'; // restore validator
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

		yield Item.create({ collection_id: 1, user_id: 1, status: 'published', data: { title: "Rung Ho!", author: "Talbot Mundy", isbn: "1557424047" } });
		yield Item.create({ collection_id: 1, user_id: 1, status: 'draft', data: { title: "Harry Potter", author: "JK Rowling", isbn: "1532352423" } });
		yield Item.create({ collection_id: 1, user_id: 1, status: 'draft', data: { title: "Dubliners", author: "James Joyce", isbn: "1532352424" } });
		yield Item.create({ collection_id: 1, user_id: 1, status: 'draft', data: { title: "To the Lighthouse", author: "Virginia Woolf", isbn: "1532352425" } });
		yield Item.create({ collection_id: 1, user_id: 1, status: 'draft', data: { title: "The Red Badge of Courage", author: "Stephen Crane", isbn: "1532352426" } });
		yield Item.create({ collection_id: 1, user_id: 1, status: 'draft', data: { title: "2BRO2B", author: "Kurt Vonnegut", isbn: "1532352427" } });
		yield Item.create({ collection_id: 1, user_id: 1, status: 'draft', data: { title: "The War of the Worlds", author: "H.G. Wells", isbn: "1532352428" } });
		yield Item.create({ collection_id: 1, user_id: 1, status: 'draft', data: { title: "The Mysterious Island", author: "Jules Verne", isbn: "1532352429" } });

		var items = yield Item.all({ collection_id: 1 });
		test.equal(items.length, 8);
		test.equal(items.totalCount, 8);
		test.equal(items[0].data.title, "The Mysterious Island");
		test.equal(items[1].data.title, "The War of the Worlds");
		test.equal(items.collection.name, "books");

		items = yield Item.all({ collection_id: 1, criteria: { status: 'published' }});
		test.equal(items.length, 1);
		test.equal(items.totalCount, 1);
		test.equal(items[0].data.title, "Rung Ho!");
		test.equal(items.collection.name, "books");

		items = yield Item.all({ collection_id: 1, sort: { field_name: 'title' } });
		test.equal(items[0].data.title, "2BRO2B");
		test.equal(items[1].data.title, "Dubliners");

		items = yield Item.all({ collection_id: 1, sort: { field_name: 'title', order: 'desc' } });
		test.equal(items[0].data.title, "To the Lighthouse");
		test.equal(items[1].data.title, "The War of the Worlds");

		items = yield Item.all({ collection_id: 1, sort: { field_name: 'status' } });
		test.equal(items[0].status, "draft");
		test.equal(items[7].status, "published");

		items = yield Item.all({ collection_id: 1, search: 'the', per_page: 3 });
		test.equal(items.length, 3);
		test.equal(items.totalCount, 4);
		test.equal(items[0].data.title, "The Mysterious Island");

		items = yield Item.all({ collection_id: 1, search: 'the', per_page: 3, page: 2 });
		test.equal(items.length, 1);
		test.equal(items.totalCount, 4);
		test.equal(items[0].data.title, "To the Lighthouse");

		items = yield Item.all({ collection_id: 1, per_page: 3, page: 3 });
		test.equal(items.length, 2);
		test.equal(items.totalCount, 8);
		test.equal(items[0].data.title, "Harry Potter");

		items = yield Item.all({ collection_id: 1, per_page: 3, page: 5 });

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

