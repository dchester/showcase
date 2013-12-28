var execute = require('genny').run;
var Collection = require('../lib/_collection.js');
var controls = require('../lib/fields').controls;

var coalesceArray = function(data) {
	return Array.isArray(data) ? data : [ data ];
};

exports.initialize = function(app) {

	var models = app.dreamer.models;
	var workspaceLoader = app.showcase.middleware.workspaceLoader;
	var workspaceAdmin = app.showcase.middleware.workspacePermission('administrator');

	app.get("/workspaces/:workspace_handle/collections", workspaceLoader, workspaceAdmin, function(req, res) {

		execute (function* (resume) {

			var collections, collection_counts;
			var workspace_handle = req.params.workspace_handle;

			var collections = yield Collection.all({ workspace_handle: workspace_handle }, resume());
			var collection_counts = yield Collection.itemCounts(null, resume());

			res.render("collections.html", { 
				collections: collections,
				collection_counts: collection_counts
			});
		});
	});

	app.get("/workspaces/:workspace_handle/collections/new", workspaceLoader, workspaceAdmin, function(req, res) {

		var workspace = req.showcase.workspace;
		var workspace_handle = req.params.workspace_handle;

		var subtitle = ' › New';
		res.render("collection.html", {
			subtitle: subtitle,
			controls: controls
		});
	});

	app.post("/workspaces/:workspace_handle/collections/new", workspaceLoader, workspaceAdmin, function(req, res) {

		execute (function* (resume) {

			var title = req.body.title;
			var description = req.body.description;
			var name = req.body.name;
			var workspace = req.showcase.workspace;

			var fields = [];
			var field_attributes = {};

			Collection.field_attribute_names.forEach(function(name) {
				var data = req.body["field_" + name];
				field_attributes[name] = Array.isArray(data) ? data : [ data ];
			});

			field_attributes.name.forEach(function(field_name, index) {

				var field_data = { name: field_name };

				Collection.field_attribute_names.forEach(function(name) {
					if (name == 'name') return;
					field_data[name] = field_attributes[name][index];
				});

				field_data.is_required = Number(field_data.is_required) ? true : false;
				fields.push(field_data);
			});

			var collection = new Collection({
				title: title,
				description: description,
				name: name,
				workspace_handle: workspace.handle,
				fields: fields,
			});

			yield collection.save(resume());

			req.flash('info', 'Created new collection');
			res.redirect('/workspaces/' + workspace.handle + '/collections');
		});
	});

	app.post("/workspaces/:workspace_handle/collections/:id/edit", workspaceLoader, workspaceAdmin, function(req, res) {

		execute (function* (resume) {

			var collection_id = req.params.id;

			var title = req.body.title;
			var description = req.body.description;
			var name = req.body.name;
			var workspace = req.showcase.workspace;

			var fields = [];
			var field_attributes = {};

			Collection.field_attribute_names.forEach(function(name) {
				var data = req.body["field_" + name];
				field_attributes[name] = Array.isArray(data) ? data : [ data ];
			});

			field_attributes.name.forEach(function(field_name, index) {

				var field_data = { name: field_name, collection_id: collection_id };

				Collection.field_attribute_names.forEach(function(name) {
					if (name == 'name') return;
					field_data[name] = field_attributes[name][index];
				});

				field_data.is_required = Number(field_data.is_required) ? true : false;
				fields.push(field_data);
			});

			var collection = yield Collection.load({ id: collection_id }, resume());

			collection.update({
				title: title,
				description: description,
				name: name,
				fields: fields,
			}, resume());

			req.flash('info', 'Saved ' +  collection.title + ' Collection');
			res.redirect('/workspaces/' + workspace.handle + '/collections');
		});
	});

	app.get("/workspaces/:workspace_handle/collections/:id/edit", workspaceLoader, workspaceAdmin, function(req, res) {

		execute (function* (resume) {

			var collection_id = req.params.id;
			var collection = yield Collection.load({ id: collection_id }, resume());

			console.log("FDS", collection.fields);

			res.render("collection.html", {
				controls: controls,
				collection: collection,
				fields: collection.fields,
				subtitle: " › " + collection.title 
			});
		});
	});

	app.del("/workspaces/:workspace_handle/collections/:id", workspaceLoader, workspaceAdmin, function(req, res) {

		execute (function* (resume) {

			var workspace = req.showcase.workspace;
			var collection_id = req.params.id;
			var collection = yield Collection.load({ id: collection_id }, resume());

			yield collection.destroy(resume());

			res.redirect("/workspaces/" + workspace.handle + "/collections");
		});
	});

};

