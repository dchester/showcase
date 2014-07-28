var passport = require('passport');
var gx = require('gx');

exports.initialize = function(app) {

	var config = app.showcase.config;
	var strategy = config.auth.passport_strategy;

	var config_superusers = {};
	(config.auth.superusers || []).forEach(function(username) {
		config_superusers[username] = true;
	});

	app.get('/admin/login', function(req, res, next) {
		if (strategy._callbackURL) {
			// kick off the OAuth dance if there's a callback URL
			passport.authenticate(strategy.name).call(null, req, res, next);
		} else {
			// otherwise present our login page
			res.render("login.html");
		}
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
			req.session.passport.user = user;
			res.redirect('/admin/login/callback');
		};

		passport.authenticate(strategy.name, handler).call(null, req, res, next);
	});

	app.get('/admin/login/callback', function(req, res, next) {

		var handler = function(err, user, info) {

			if (!user) {
				req.flash('danger', "Failed logging in authenticated user: " + (info && info.message ? info.message : ''));
				return res.redirect('/admin/login');
			}

			req.logIn(user, function() {

				req.session.username = user.username;
				req.session.user_id = user.id;
				req.session.is_superuser = config_superusers[user.username] || user.is_superuser;

				res.redirect('/workspaces');
			});
		};

		if (req.session.passport.user) {
			// if we're already authenticated call the handler directly
			handler(null, req.session.passport.user);
		} else {
			// otherwise authenticate via passort
			passport.authenticate(strategy.name, handler).call(null, req, res, next);
		}
	});

	app.get('/admin/logout', function(req, res) {
		req.logout();
		req.session = null;
		res.redirect('/');
	});
};

