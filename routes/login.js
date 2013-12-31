exports.initialize = function(app) {

	var models = app.dreamer.models;

	app.get('/admin/login', function(req, res) {
		res.render("login.html");
	});

	app.post('/admin/login', function(req, res) {

		var username = req.body.username;
		models.users.find({ where: { username: username } })
			.error(req.error)
			.success(function(user) {

				if (user) {
					req.session.username = user.username;
					req.session.user_id = user.id;
					req.session.is_superuser = user.is_superuser;
					res.redirect('/workspaces');
				} else {
					req.flash('danger', 'No user by that username');
					res.redirect('/admin/login');
				}
			});
	});

	app.get('/admin/logout', function(req, res) {
		req.session = null;
		res.redirect('/');
	});
};

