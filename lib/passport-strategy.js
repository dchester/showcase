var PassportLocal = require('passport-local');

var local = new PassportLocal.Strategy(function(username, password, done) {
	var models = require('dreamer').instance.models;
	models.users
		.find({ where: { username: username } })
		.complete(function(err, user) {
			if (err) return done(err);
			if (!user) return done(null, false, { message: 'No user by that username' });
			done(null, user);
		});
});

exports.local = local;
