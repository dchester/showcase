var passport = require('passport');
var gx = require('gx');

exports.initialize = function(app) {

	app.get('/admin/login', function(req, res) {
		res.render("login.html");
	});

	app.post('/admin/login', function*(req, res, next) {

		// passport requires a truthy password
		req.body.password = 'password' in req.body ? req.body.password : 'password';

		var handler = function(err, user, info) {

			if (err) return req.error(err);
			if (!user) {
				req.flash('danger', info.message);
				return res.redirect('/admin/login');
			}

			req.logIn(user, gx.fn(function*(err) {

				var models = app.dreamer.models;
				var username = user.username;

				var showcase_user = yield models.users
					.findOrCreate({ username: username }, { is_superuser: false })
					.complete(gx.resume);

				req.session.username = showcase_user.username;
				req.session.user_id = showcase_user.id;
				req.session.is_superuser = showcase_user.is_superuser;
				res.redirect('/workspaces');
			}));
		};

		passport.authenticate('local', handler).call(null, req, res, next);
	});

	app.get('/admin/logout', function(req, res) {
		req.logout();
		req.session = null;
		res.redirect('/');
	});
};

