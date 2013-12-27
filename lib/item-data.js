var assert = require('assert');
var moment = require('moment');
var dreamer = require('dreamer').instance;
var models = dreamer.models;

var ItemData = {

	find: function(args) {

		var item_id = args.item_id;
		var success = args.success;
		var error = args.error || console.warn;

		models.item_data.find({ where: { item_id: item_id } })
			.error(error)
			.success(function(item_data) {
				item_data.data = JSON.parse(item_data.data);
				success(item_data);
			});
	},

	update: function(args) {

		var item = args.item;
		var data = args.data;
		var error = args.error;
		var success = args.success;
		var user_id = args.user_id;

		var storable_data = JSON.stringify(data);

		models.item_data.find({ where: { item_id: item.id } })
			.error(error)
			.success(function(item_data) {

				var initial_data = JSON.parse(item_data.data);
				var initial_user_id = item_data.user_id;

				try {
					assert.deepEqual(initial_data, data);
					success(item_data, false);

				} catch(e) {

					item_data.data = storable_data;
					item_data.save()
						.error(error)
						.success(function(item_data) {
							success(item_data, true);
							models.item_data_revisions
								.create({
									user_id: initial_user_id,
									item_id: item.id,
									data: JSON.stringify(initial_data),
									content_type: 'application/json'
								})
								.error(error);
						})
				}
			});
	},

	create: function(args) {

		var item_id = args.item_id;
		var success = args.success;
		var error = args.error || console.warn;
		var data = args.data;
		var user_id = args.user_id;

		var data = models.item_data.build({
			item_id: item_id,
			data: JSON.stringify(data),
			content_type: 'application/json',
			user_id: user_id
		});

		data.save()
			.error(error)
			.success(function() {
				success();
			});

	},

	destroy: function(args) {

	},

	findAll: function(args) {

		var success = args.success;
		var error = args.error || console.warn;
		var item_ids = args.item_ids;

		models.item_data.findAll({ where: { item_id: item_ids } })
			.error(error)
			.success(function(item_data) {

				var data = {};

				item_data.forEach(function(item) {
					data[item.item_id] = JSON.parse(item.data);
				});

				success(data);
			});
	}
};

module.exports = ItemData;
