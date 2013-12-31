exports.initialize = function(app) {

	var models = app.dreamer.models;

	app.get('/admin/setup', function(req, res) {
		res.render("setup.html");
	});

	app.post('/admin/setup', function* (req, res, resume) {

		var count = yield models.users.count().complete(resume());

		if (count) {
			req.flash('danger', 'Already set up');
			res.redirect('/admin/users');
		}

		// insert the one user

		yield models.users
			.create({ username: req.body.username, is_superuser: 1 })
			.complete(resume());

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

