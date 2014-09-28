var fs = require('fs');
var gx = require('gx');

exports.initialize = function(app) {

	var models = app.dreamer.models;
	var requireSuperuser = app.showcase.middleware.requireSuperuser;
	var workspaceLoader = app.showcase.middleware.workspaceLoader;

	var fields = ['template', 'css'];

	app.get("/workspaces/:workspace_handle/pages/config", workspaceLoader, function*(req, res) {

		var workspace = req.showcase.workspace;

		var site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		res.render("site.html", { site: site });
	});

	app.post("/workspaces/:workspace_handle/pages/initialize", workspaceLoader, requireSuperuser, function*(req, res) {

		var workspace = req.showcase.workspace;

		var default_template = yield fs.readFile(__dirname + '/../var/default_template.html', 'utf8', gx.resume);
		var default_css = 'body { font-family: Arial, sans-serif }';

		var existing_site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		if (existing_site) {
			req.flash('info', 'There is already a site configured for this workspace');
			return res.redirect('/workspaces/' + workspace.handle + '/pages');
		}

		var site = models.sites.build({
			workspace_id: workspace.id,
			template: default_template,
			css: default_css
		});

		var errors = site.validate();

		fields.forEach(function(field) {
			if (site[field]) return;
			errors = errors || {};
			errors[field] = [field + ' is required'];
		});

		if (!errors) {
			yield site.save().complete(gx.resume);
			req.flash('info', 'Initialized pages');
			return res.redirect('/workspaces/' + workspace.handle + '/pages');
		} else {
			req.flash('danger', 'There was an error: ' + JSON.stringify(errors));
			res.redirect("/workspaces/" + workspace.handle + '/collections');
		}
	});

	app.post("/workspaces/:workspace_handle/pages/config", workspaceLoader, function*(req, res) {

		var workspace = req.showcase.workspace;

		var site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		fields.forEach(function(field) {
			site[field] = req.body[field];
		});

		var errors = site.validate();

		fields.forEach(function(field) {
			if (site[field]) return;
			errors = errors || {};
			errors[field] = [field + ' is required'];
		});

		if (!errors) {
			yield site.save().complete(gx.resume);
			req.flash('info', 'Saved configuration');
			res.redirect(".");
		} else {
			req.flash('danger', 'There was an error: ' + JSON.stringify(errors));
			res.redirect("/workspaces/" + workspace.handle + "/pages");
		}

	});
};

