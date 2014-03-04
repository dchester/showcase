var dreamer = require('dreamer');
var models = dreamer.instance.models;
var gx = require('gx');

var permissions;
var map = { id: {}, name: {} };

var Permission = {

	load: function*() {

		if (Permission._loaded) return;

		var _permissions = yield models.permissions.findAll()
			.complete(gx.resume);

		permissions = JSON.parse(JSON.stringify(_permissions));

		permissions.forEach(function(permission) {
			map.name[permission.name] = permission.id;
			map.id[permission.id] = permission.name;
		});

		Permission._loaded = true;
	},

	id: function(name) {

		if (!Permission._loaded) throw new Error("permissions not yet loaded");

		var permission_id = map.name[name];
		if (!permission_id) {
			throw new Error("couldn't find permission id for permission name " + name);
		}
		return permission_id;
	},

	name: function(id) {

		if (!Permission._loaded) throw new Error("permissions not yet loaded");

		var permission_name = map.id[id];
		if (!permission_name) {
			throw new Error("couldn't find permission name for permission id " + id);
		}
		return permission_name;
	}
};

module.exports = Permission;
gx.keys(Permission, { functions: false });

