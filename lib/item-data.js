var dreamer = require('dreamer').instance;
var models = dreamer.models;

var ItemData = {

	find: function(args) {

		var item_id = args.item_id;
		var success = args.success;
		var error = args.error || console.warn;

		models.entity_item_data.find({ where: { entity_item_id: item_id } })
			.error(error)
			.success(function(item_data) {
				var data = JSON.parse(item_data.data);
				success(data);
			});
	},

	update: function(args) {

		var item = args.item;
		var data = args.data;
		var error = args.error;
		var success = args.success;

		var storable_data = JSON.stringify(data);

		models.entity_item_data.find({ where: { entity_item_id: item.id } })
			.error(error)
			.success(function(item_data) {
				item_data.data = storable_data;
				item_data.save()
					.error(error)
					.success(function(item_data) {
						success(item_data);
					})
			});
	},

	create: function(args) {

		var item_id = args.item_id;
		var success = args.success;
		var error = args.error || console.warn;
		var data = args.data;

		var data = models.entity_item_data.build({
			entity_item_id: item_id,
			data: JSON.stringify(data),
			content_type: 'application/json'
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

		models.entity_item_data.findAll({ where: { entity_item_id: item_ids } })
			.error(error)
			.success(function(item_data) {

				var data = {};

				item_data.forEach(function(item) {
					data[item.entity_item_id] = JSON.parse(item.data);
				});

				success(data);
			});
	}
};

module.exports = ItemData;
