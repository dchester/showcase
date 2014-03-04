var gx = require('gx');

exports.initialize = function(app) {

	var models = app.dreamer.models;

	app.get('/admin/setup', function(req, res) {
		res.render("setup.html");
	});

	app.post('/admin/setup', function*(req, res) {

		var count = yield models.users
			.count({ where: "username != 'api'" })
			.complete(gx.resume);

		if (count) {
			req.flash('danger', 'Already set up');
			return res.redirect('/admin/users');
		}

		yield models.users
			.create({ username: req.body.username, is_superuser: 1 })
			.complete(gx.resume);

		req.flash('info', 'Created superuser.  Time to log in now...');
		res.redirect('/admin/login');
	});

	app.get('/admin/error/schema', function(req, res) {
		res.render("error_schema.html");
	});

	app.get('/admin/error/db', function(req, res) {
		res.render("error_db.html");
	});
};

