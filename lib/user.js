var User = {

	merge: function(user_data, done) {

		var models = require('dreamer').instance.models;
		var username = user_data.username;
		var is_superuser = user_data.is_superuser;

		models.users
			.findOrCreate({ username: username }, { is_superuser: is_superuser })
			.complete(function(err, data) {
				if (err) return done(err);
				var showcase_user = JSON.parse(JSON.stringify(data));
				done(null, showcase_user);
			});
	}
};

module.exports = User;

