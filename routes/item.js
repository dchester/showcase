var async = require('async');
var Pagination = require('pagination').ItemPaginator;

var Deferrals = require('../lib/deferrals');
var Collection = require('../lib/collection');
var Item = require('../lib/item');

exports.initialize = function(app) {

	var models = app.dreamer.models;
	var workspaceLoader = app.showcase.middleware.workspaceLoader;
	var workspaceEditor = app.showcase.middleware.workspacePermission('editor');

	app.del("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id", workspaceLoader, workspaceEditor, function* (req, res, resume) {

		var collection_id = req.params.collection_id;
		var item_id = req.params.item_id;
		var workspace = req.showcase.workspace;

		var item = yield Item.load({ id: item_id }, resume());

		yield item.destroy(resume());

		res.redirect("/workspaces/" + workspace.handle + "/collections/" + collection_id + "/items");
	});

	app.get("/workspaces/:workspace_handle/collections/:collection_id/items", workspaceLoader, workspaceEditor, function* (req, res, resume) {

		var collection_id = req.params.collection_id;
		var page = Number(req.query.page) || 1;
		var per_page = 10;

		var items = yield Item.all({ collection_id: collection_id }, resume());

		var pagination = new Pagination({
			rowsPerPage: per_page,
			totalResult: items.totalCount,
			current: page
		});

		pagination.data = pagination.getPaginationData();
		pagination.data.prelink = pagination.preparePreLink(pagination.data.prelink);

		items.forEach(function(item) {
			item = Item._preview(item, items.collection);
			Object.keys(item).forEach(function(key) {
				if (typeof item[key] == 'string') {
					if (item[key].length > 255) {
						item[key] = item[key].substring(0, 127) + '...';
					} 
				}
			});
		});

		res.render("items.html", { 
			items: items,
			collection: items.collection,
			fields: items.collection.fields,
			pagination: pagination.data
		});
	});

	app.get("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id/edit", workspaceLoader, workspaceEditor, function* (req, res, resume) {

		var item_id = req.params.item_id;

		var collection, item, fields, item_data;

		var item = yield Item.load({ id: item_id }, resume());
		var revisions = yield item.revisions(resume());

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

	app.get("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id/revisions/:revision_id", workspaceLoader, workspaceEditor, function* (req, res, resume) {

		var item_id = req.params.item_id;
		var revision_id = req.params.revision_id;

		var item = yield Item.load({ id: item_id }, resume());
		var revision = yield item.revision({ revision_id: revision_id }, resume());

		res.render("revision.html", { revision: revision });
	});

	app.post("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id/restore", workspaceLoader, workspaceEditor, function* (req, res, resume) {

		var revision_id = req.body.revision_id;
		var workspace = req.showcase.workspace;
		var item_id = req.params.item_id;
		var user_id = req.session.user_id;

		yield Item.restore({
			id: item_id,
			user_id: user_id,
			revision_id: revision_id,
		}, resume());

		req.flash('info', "Restored prior version for item #" + item_id);
		res.redirect('/workspaces/' + workspace.handle + '/collections/' + req.params.collection_id + '/items/' + item_id + '/edit');
	});

	app.post("/workspaces/:workspace_handle/collections/:collection_id/items/:item_id/edit", workspaceLoader, workspaceEditor, function* (req, res, resume) {

		var collection_id = req.params.collection_id;
		var item_id = req.params.item_id;
		var status = req.body._status;
		var workspace = req.showcase.workspace;
		var user_id = req.session.user_id;

		var item = yield Item.load({ id: item_id }, resume());

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

		yield item.save({ user_id: user_id }, resume());

		req.flash('info', 'Saved item #' + item_id);
		res.redirect("/workspaces/" + workspace.handle + "/collections/" + collection_id + "/items");
	});

	app.get("/workspaces/:workspace_handle/collections/:collection_id/items/new", workspaceLoader, workspaceEditor, function* (req, res, resume) {

		var collection_id = req.params.collection_id;

		var collection = yield Collection.load({ id: collection_id }, resume());

		res.render("item.html", {
			collection: collection,
			fields: collection.fields,
			action: 'New'
		});
	});

	app.post("/workspaces/:workspace_handle/collections/:collection_id/items/new", workspaceLoader, workspaceEditor, function* (req, res, resume) {

		var collection_id = req.params.collection_id;
		var status = req.body._status;
		var workspace = req.showcase.workspace;
		var user_id = req.session.user_id;

		var item = yield Item.build({
			collection_id: collection_id,
			status: status,
			data: req.body,
			user_id: user_id,
		}, resume());

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

		yield item.save({ user_id: user_id }, resume());

		req.flash('info', "Created item");
		res.redirect("/workspaces/" + workspace.handle + "/collections/" + collection_id + "/items");
	});
};
