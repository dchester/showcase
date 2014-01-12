var dreamer = require('dreamer');
var gx = require('gx');

var API = {

	user: null,

	setupUser: function*() {

		var models = dreamer.instance.models;

		var properties = {
			username: "api",
			is_superuser: true
		};

		try {
			yield models.users
				.create(properties)
				.complete(gx.resume);

		} catch(e) {}

		var user = yield models.users
			.find({ where: { username: "api" }})
			.complete(gx.resume);

		this.user = user;

		if (!this.user) {
			console.warn("couldn't find api user");
		}
	}
};

gx.gentrify(API);

module.exports = API;
