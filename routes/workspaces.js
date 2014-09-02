var gx = require('gx');

exports.initialize = function(app) {

	var models = app.dreamer.models;
	var workspaceAdmin = app.showcase.middleware.workspacePermission('administrator');
	var workspaceLoader = app.showcase.middleware.workspaceLoader;
	var requireSuperuser = app.showcase.middleware.requireSuperuser;

	var fields = ['title', 'handle', 'description'];

	app.get("/workspaces", function*(req, res) {

		var workspaces = yield models.workspaces
			.findAll({})
			.complete(gx.resume);

		res.render("workspaces.html", { workspaces: workspaces });
	});

	app.get("/workspaces/new", requireSuperuser, function(req, res) {

		var breadcrumbs = [ { text: 'New' } ];

		res.render("workspace.html", {
			breadcrumbs: breadcrumbs
		});
	});

	app.get("/workspaces/:workspace_handle/edit", workspaceLoader, workspaceAdmin, function(req, res) {

		var workspace = req.showcase.workspace;

		var breadcrumbs = [
			{ href: '/workspaces/' + workspace.handle + '/collections', text: workspace.title }
		];

		res.render("workspace.html", {
			breadcrumbs: breadcrumbs,
			workspace: workspace
		});
	});

	app.post("/workspaces/new", requireSuperuser, function*(req, res) {

		var workspace = models.workspaces.build({
			title: req.body.title,
			handle: req.body.handle,
			description: req.body.description
		});

		var errors = workspace.validate();

		fields.forEach(function(field) {
			if (workspace[field]) return;
			errors = errors || {};
			errors[field] = [field + ' is required'];
		});

		if (!errors) {
			yield workspace.save().complete(gx.resume);
			req.flash('info', 'Saved new workspace');
			res.redirect("/workspaces");
		} else {
			req.flash('danger', 'There was an error: ' + JSON.stringify(errors));
			res.redirect("/workspaces/new");
		}
	});

	app.delete("/workspaces/:workspace_handle", workspaceLoader, workspaceAdmin, function*(req, res) {

		var workspace = req.showcase.workspace;
		yield workspace.destroy().complete(gx.resume);
		req.flash('info', 'Deleted workspace');
		res.redirect('/workspaces');
	});

	app.post("/workspaces/:workspace_handle/edit", workspaceLoader, workspaceAdmin, function*(req, res) {

		var workspace = req.showcase.workspace;

		fields.forEach(function(field) {
			workspace[field] = req.body[field];
		});

		var errors = workspace.validate();

		fields.forEach(function(field) {
			if (workspace[field]) return;
			errors = errors || {};
			errors[field] = [field + ' is required'];
		});

		if (!errors) {
			yield workspace.save().complete(gx.resume);
			req.flash('info', 'Saved workspace');
			res.redirect("/workspaces");
		} else {
			req.flash('danger', 'There was an error: ' + JSON.stringify(errors));
			res.redirect("/workspaces/" + workspace.handle);
		}

	});
};
