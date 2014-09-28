var gx = require('gx');

exports.initialize = function(app) {

	var models = app.dreamer.models;
	var workspaceLoader = app.showcase.middleware.workspaceLoader;

	var fields = ['title', 'data_sources', 'url_path', 'template', 'css'];

	app.get("/workspaces/:workspace_handle/pages", workspaceLoader, function*(req, res) {

		var workspace = req.showcase.workspace;

		var site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		if (site) {

			var pages = yield models.pages
				.findAll({ where: { site_id: site.id } })
				.complete(gx.resume);

			pages.forEach(function(page) {
				page.preview_url = page.url_path;
			});

		}

		res.render("pages.html", {
			pages: pages,
			site: site
		});
	});

	app.get("/workspaces/:workspace_handle/pages/new", workspaceLoader, function*(req, res) {

		var workspace = req.showcase.workspace;

		var site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		res.render("page.html", { site_id: site.id });
	});

	app.get("/workspaces/:workspace_handle/pages/:page_id/edit", workspaceLoader, function*(req, res) {

		var workspace = req.showcase.workspace;

		var site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		var page_id = req.params.page_id;

		var page = yield models.pages
			.find({ where: { id: page_id } })
			.complete(gx.resume);

		res.render("page.html", { page: page });
	});

	app.post("/workspaces/:workspace_handle/pages/new", workspaceLoader, function*(req, res) {

		var workspace = req.showcase.workspace;

		var site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		var page = models.pages.build({
			site_id: site.id,
			title: req.body.title,
			data_sources: req.body.data_sources,
			url_path: req.body.url_path,
			template: req.body.template,
			css: req.body.css
		});

		var errors = page.validate();

		if (!errors) {
			yield page.save().complete(gx.resume);
			req.flash('info', 'Saved new page');
			res.redirect("/workspaces/" + workspace.handle + "/pages");
		} else {
			console.log(errors);
			req.flash('danger', 'There was an error: ' + JSON.stringify(errors));
			res.redirect("/workspaces/" + workspace.handle + "/pages/new");
		}
	});

	app.delete("/workspaces/:workspace_handle/pages/:page_id", workspaceLoader, function*(req, res) {

		var workspace = req.showcase.workspace;

		var site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		var page_id = req.params.page_id;

		var page = yield models.pages
			.find({ where: { id: page_id } })
			.complete(gx.resume);

		if (page.site_id != site.id) {
			return res.json(400, { message: "bad site_id" });
		}

		yield page.destroy().complete(gx.resume);
		req.flash('info', 'Deleted page');
		res.redirect('/workspaces/' + workspace.handle + '/pages');
	});

	app.post("/workspaces/:workspace_handle/pages/:page_id/edit", workspaceLoader, function*(req, res) {

		var workspace = req.showcase.workspace;
		var page_id = req.params.page_id;

		var site = yield models.sites
			.find({ where: { workspace_id: workspace.id } })
			.complete(gx.resume);

		var page = yield models.pages
			.find({ where: { id: page_id } })
			.complete(gx.resume);

		if (page.site_id != site.id) {
			return res.json(400, { message: "bad site_id" });
		}

		fields.forEach(function(field) {
			page[field] = req.body[field];
		});

		var errors = page.validate();

		if (!errors) {
			yield page.save().complete(gx.resume);
			req.flash('info', 'Saved page');
			res.redirect(".");
		} else {
			req.flash('danger', 'There was an error: ' + JSON.stringify(errors));
			res.redirect("/pages/" + page_id);
		}

	});
};


