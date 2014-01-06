var assert = require('assert');
var moment = require('moment');
var dreamer = require('dreamer').instance;
var gx = require('gx');
var models = dreamer.models;

var ItemData = function() {
	this.initialize.apply(this, arguments);
};

ItemData.find = function*(args) {

	var item_id = args.item_id;

	var item_data = yield models.item_data
		.find({ where: { item_id: item_id } })
		.complete(gx.resume);

	item_data.data = JSON.parse(item_data.data);
	return item_data;
};

ItemData.update = function*(args) {

	var item = args.item;
	var data = args.data;
	var user_id = args.user_id;

	var storable_data = JSON.stringify(data);

	var item_data = yield models.item_data
		.find({ where: { item_id: item.id } })
		.complete(gx.resume);

	var initial_data = JSON.parse(item_data.data);
	var initial_user_id = item_data.user_id;

	try {
		assert.deepEqual(initial_data, data);
		return [item_data, false];

	} catch (e) {

		item_data.data = storable_data;
		yield item_data.save().complete(gx.resume);

		models.item_data_revisions.create({
			user_id: initial_user_id,
			item_id: item.id,
			data: JSON.stringify(initial_data),
			content_type: 'application/json'
		});

		return [item_data, true];
	}
}; 

ItemData.create = function*(args) {

	var item = args.item;
	var item_id = item.id;
	var data = args.data;
	var user_id = args.user_id;

	var data = models.item_data.build({
		item_id: item_id,
		data: JSON.stringify(data),
		content_type: 'application/json',
		user_id: user_id
	});

	yield data.save().complete(gx.resume);
};

ItemData.findAll = function*(args) {

	var success = args.success;
	var error = args.error || console.warn;
	var item_ids = args.item_ids;

	var item_data = yield models.item_data
		.findAll({ where: { item_id: item_ids } })
		.complete(gx.resume);

	var data = {};

	item_data.forEach(function(item) {
		data[item.item_id] = JSON.parse(item.data);
	});

	return data;
};

ItemData = gx.gentrify(ItemData);

module.exports = ItemData;

