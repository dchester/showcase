var async = require('async');
var Pagination = require('pagination').ItemPaginator;

var Deferrals = require('../lib/deferrals');
var Collection = require('../lib/collection');
var Item = require('../lib/item');

exports.initialize = function(app) {

	var models = app.dreamer.models;
	var workspaceLoader = app.showcase.middleware.workspaceLoader;
	var workspaceEditor = app.showcase.middleware.workspacePermission('editor');

	app.del("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id", workspaceLoader, workspaceEditor, function*(req, res) {

		var collection_id = req.params.collection_id;
		var item_id = req.params.item_id;
		var workspace = req.showcase.workspace;

		var item = yield Item.load({ id: item_id });

		yield item.destroy();

		res.redirect("/workspaces/" + workspace.handle + "/collections/" + collection_id + "/items");
	});

	app.get("/workspaces/:workspace_handle/collections/:collection_id/items", workspaceLoader, workspaceEditor, function*(req, res) {

		var collection_id = req.params.collection_id;
		var page = Number(req.query.page) || 1;
		var per_page = app.showcase.config.items_per_page || 100;
		var fields_count = app.showcase.config.item_summary_display_fields_count || 8;

		var items = yield Item.all({
			collection_id: collection_id,
			per_page: per_page,
			page: page
		});

		var pagination = new Pagination({
			rowsPerPage: per_page,
			totalResult: items.totalCount,
			current: page
		});

		pagination.data = pagination.getPaginationData();
		pagination.data.prelink = pagination.preparePreLink(pagination.data.prelink);

		items.forEach(function(item) {
			item = Item._preview(item, items.collection);
			Object.keys(item.data).forEach(function(key) {
				if (typeof item.data[key] == 'string') {
					if (item.data[key].length > 255) {
						item.data[key] = item.data[key].substring(0, 127) + '...';
					} 
				}
			});
		});

		var fields = items.collection.fields.slice(0, fields_count - 1);

		res.render("items.html", { 
			items: items,
			collection: items.collection,
			fields: fields,
			pagination: pagination.data
		});
	});

	app.get("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id/edit", workspaceLoader, workspaceEditor, function*(req, res) {

		var item_id = req.params.item_id;

		var collection, item, fields, item_data;

		var item = yield Item.load({ id: item_id });
		var revisions = yield item.revisions();

		var action = 'Edit';
		var fields = item.collection.fields;

		res.render("item.html", {
			item: item,
			collection: item.collection,
			fields: item.collection.fields,
			action: action,
			revisions: revisions
		});
	});

	app.get("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id/revisions/:revision_id", workspaceLoader, workspaceEditor, function*(req, res) {

		var item_id = req.params.item_id;
		var revision_id = req.params.revision_id;

		var item = yield Item.load({ id: item_id });
		var revision = yield item.revision({ revision_id: revision_id });

		res.render("revision.html", { revision: revision });
	});

	app.post("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id/restore", workspaceLoader, workspaceEditor, function*(req, res) {

		var revision_id = req.body.revision_id;
		var workspace = req.showcase.workspace;
		var item_id = req.params.item_id;
		var user_id = req.session.user_id;

		yield Item.restore({
			id: item_id,
			user_id: user_id,
			revision_id: revision_id,
		});

		req.flash('info', "Restored prior version for item #" + item_id);
		res.redirect('/workspaces/' + workspace.handle + '/collections/' + req.params.collection_id + '/items/' + item_id + '/edit');
	});

	app.post("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id/edit", workspaceLoader, workspaceEditor, function*(req, res) {

		var collection_id = req.params.collection_id;
		var item_id = req.params.item_id;
		var status = req.body._status;
		var workspace = req.showcase.workspace;
		var user_id = req.session.user_id;

		var item = yield Item.load({ id: item_id });

		item.update({
			status: status,
			data: req.body,
			user_id: user_id,
		});

		var errors = item.validate();

		if (errors) {

			var action = "Edit";

			return res.render("item.html", {
				item: item,
				errors: errors,
				collection: item.collection,
				fields: item.collection.fields,
				action: action
			});
		}

		yield item.save({ user_id: user_id });

		req.flash('info', 'Saved item #' + item_id);
		res.redirect("/workspaces/" + workspace.handle + "/collections/" + collection_id + "/items");
	});

	app.get("/workspaces/:workspace_handle/collections/:collection_id/items/new", workspaceLoader, workspaceEditor, function*(req, res) {

		var collection_id = req.params.collection_id;

		var collection = yield Collection.load({ id: collection_id });

		res.render("item.html", {
			collection: collection,
			fields: collection.fields,
			action: 'New'
		});
	});

	app.post("/workspaces/:workspace_handle/collections/:collection_id/items/new", workspaceLoader, workspaceEditor, function*(req, res) {

		var collection_id = req.params.collection_id;
		var status = req.body._status;
		var workspace = req.showcase.workspace;
		var user_id = req.session.user_id;

		var item = yield Item.build({
			collection_id: collection_id,
			status: status,
			data: req.body,
			user_id: user_id,
		});

		var errors = item.validate();

		if (errors) {

			return res.render("item.html", {
				item: item,
				errors: errors,
				collection: item.collection,
				fields: item.collection.fields,
				action: "New"
			});
		}

		yield item.save({ user_id: user_id });

		req.flash('info', "Created item");
		res.redirect("/workspaces/" + workspace.handle + "/collections/" + collection_id + "/items");
	});
};
