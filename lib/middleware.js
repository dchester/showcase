exports.initialize = function(app) {

	var models = app.dreamer.models;

	var workspaceLoader = function(req, res, next) {

		var workspace_handle = req.params.workspace_handle;
		if (!workspace_handle) return next();

		models.workspaces.find({ where: { handle: workspace_handle } })
			.error(req.error)
			.success(function(workspace) { 

				if (!workspace) return req.error("invalid workspace handle: " + workspace_handle);

				res.locals.workspace = workspace;
				req.flight = req.flight || {};
				req.flight.workspace = workspace;
				next();
			});
	};

	var workspacePermission = function(required_permission) {

		var levels = { 'superuser': 100, 'administrator': 3, 'editor': 2 };
		var required_level = levels[required_permission];

		if (!required_level) throw new Error("Couldn't find permission level: " + required_permission);

		return function(req, res, next) {

			var workspace_handle = req.params.workspace_handle;

			if (req.session && req.session.is_superuser) {
				req.flight.workspace_user_permission = res.locals.workspace_user_permission = 'administrator';
				next();

			} else if (req.session && req.session.username) {
				models.workspace_user_permissions
					.find({ where: { user_id: req.session.user_id, workspace_handle: workspace_handle }})
					.error(req.error)
					.success(function(permission) {

						permission = permission.permission;
						req.flight.workspace_user_permission = res.locals.workspace_user_permission = permission;

						var level = levels[permission] || 0;

						if (req.method !== 'GET' && level < required_level) {
							console.warn("bad permissions: ", req.method, permission, required_level, level);
							req.flash('danger', "You don't have permissions to do that!");
							res.redirect('/');
						} else {
							next();
						}
					});
			} else {
				req.flash('info', 'Please login...');
				res.redirect("/admin/login");
			}
		};
	};

	var requireSuperuser = function(req, res, next) {

		if (req.session && req.session.is_superuser) {
			next();
		} else {
			req.flash('danger', 'Only a superuser admin can do that');
			res.redirect('/');
		}
	};

	return {
		workspacePermission: workspacePermission,
		workspaceLoader: workspaceLoader,
		requireSuperuser: requireSuperuser
	};
};
