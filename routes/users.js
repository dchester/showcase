var async = require('async');
var gx = require('gx');
var Permission = require('../lib/permission');
var config = require('config');

exports.initialize = function(app) {

	var models = app.dreamer.models;

	app.get("/admin/users", function*(req, res) {

		var users = yield models.users
			.findAll({})
			.complete(gx.resume);

		res.render("users.html", { users: users });
	});

	app.get("/admin/users/new", function(req, res) {

		res.render("user.html", { action: 'New' });
	});

	app.get("/admin/users/:user_id/edit", function*(req, res) {

		var user_id = req.params.user_id;
		var user, workspaces, permissions;

		models.users
			.find({ where: { id: user_id } })
			.complete(gx.resume);

		models.workspaces
			.findAll({})
			.complete(gx.resume);

		models.workspace_user_permissions
			.findAll({ where: { user_id: user_id } })
			.complete(gx.resume);

		var user = yield null;
		var workspaces = yield null;
		var permissions = yield null;

		var is_config_superuser = config.auth.superusers
			.filter(function(username) { return username === user.username })
			.length;

		workspaces.forEach(function(workspace) {

			var workspace_permission = permissions
				.filter(function(p) { return p.workspace_handle == workspace.handle; })
				.shift();

			if (workspace_permission) {
				workspace.permission = Permission.name(workspace_permission.permission_id);
			}
		});

		res.render("user.html", { 
			action: 'Edit',
			user: user,
			workspaces: workspaces,
			is_config_superuser: is_config_superuser
		});
	});

	app.post("/admin/users/:user_id/edit", function*(req, res) {

		var user_id = req.params.user_id;
		var username = req.body.username;
		var is_superuser = Number(req.body.is_superuser) || 0;

		var user = yield models.users
			.find({ where: { id: user_id } })
			.complete(gx.resume);

		user.username = username;
		user.is_superuser = is_superuser;

		var errors = user.validate();

		if (errors) {
			req.flash('danger', 'There was an error: ' + JSON.stringify(errors));
			return res.redirect("/admin/users");
		}

		var workspace_permissions = [];

		var workspace_handles = Array.isArray(req.body.workspace_handle) ? 
			req.body.workspace_handle : [ req.body.workspace_handle ];

		var permissions = Array.isArray(req.body.permission) ? 
			req.body.permission : [ req.body.permission ];

		workspace_handles.forEach(function(handle, index) {
			permission = {
				user_id: user.id,
				permission_id: Permission.id(permissions[index]),
				workspace_handle: handle
			};
			workspace_permissions.push(permission);
		});

		yield user.save().complete(gx.resume);
		req.flash('info', 'Saved user');

		var query = 'delete from workspace_user_permissions where user_id = ?';

		yield app.dreamer.db
			.query(query, null, {raw: true}, [user_id])
			.complete(gx.resume);

		async.forEach(workspace_permissions, function(permission, callback) {

			models.workspace_user_permissions
				.create(permission)
				.error(req.error)
				.success(callback);

		}, function() { 
			res.redirect("/admin/users");
		});
	});

	app.post("/admin/users/new", function*(req, res) {

		var is_superuser = Number(req.body.is_superuser) || 0;
		var username = req.body.username;

		var user = models.users.build({
			username: username,
			is_superuser: is_superuser
		});

		var errors = user.validate();

		if (!errors) {
			yield user.save().complete(gx.resume);
			req.flash('info', 'Created new user');
			res.redirect("/admin/users");
		} else {
			req.flash('error', 'There was an error');
			res.redirect("/admin/users/new");
		}
	});
};


