var dreamer = require('dreamer');
var models = dreamer.instance.models;
var gx = require('gx');

var statuses;
var map = { id: {}, name: {} };

var Status = {

	load: function*() {

		if (Status._loaded) return;

		var _statuses = yield models.statuses.findAll()
			.complete(gx.resume);

		statuses = JSON.parse(JSON.stringify(_statuses));

		statuses.forEach(function(status) {
			map.name[status.name] = status.id;
			map.id[status.id] = status.name;
		});

		Status._loaded = true;
	},

	id: function(name) {

		if (!Status._loaded) throw new Error("statuses not yet loaded");

		var status_id = map.name[name];
		if (!status_id) {
			throw new Error("couldn't find status id for status name " + name);
		}
		return status_id;
	},

	name: function(id) {

		if (!Status._loaded) throw new Error("statuses not yet loaded");

		var status_name = map.id[id];
		if (!status_name) {
			throw new Error("couldn't find status name for status id " + id);
		}
		return status_name;
	}
};

module.exports = Status;
gx.keys(Status, { functions: false });

