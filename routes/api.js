var async = require('async');
var armrest = require('armrest');
var Deferrals = require('../lib/deferrals');
var Item = require('../lib/item');

var Collection = require('../lib/collection.js');
var EXAMPLE_LENGTH = 1500;

exports.initialize = function(app) {

	var models = app.dreamer.models;
	var workspaceLoader = app.showcase.middleware.workspaceLoader;

	app.get('/api/:workspace_handle/:collection_handle', workspaceLoader, function* (req, res, resume) {

		var name = req.params.collection_handle;
		var per_page = req.query.per_page || 40;
		var page = req.query.page || 0;
		var collection, items;
		var workspace = req.showcase.workspace;

		var collection = yield Collection.load({ name: name, workspace_handle: workspace.handle }, resume());

		if (!collection) {
			return req.error(404, "collection not found");
		}

		var criteria = {};

		collection.fields.forEach(function(field) {
			if (field.name in req.query) {
				criteria[field.name] = req.query[field.name];
			}
		});

		var items = yield Item.all({
			collection_id: collection.id,
			criteria: criteria,
			page: page,
			per_page: per_page,
		}, resume());

		items.forEach(function(item) {
			item.collection = collection;
		});

		async.forEach(items, function(item, callback) {

			Item._inflate(item, function(item) {
				callback();
			});

		}, function() {

			var distilled_items = [];

			items.forEach(function(item) {
				distilled_items.push(Item.distill(item));
			});

			var totalCount = items.totalCount;
			var content_range = "items 0-" + (totalCount - 1) + "/" + totalCount;

			res.header('Content-Range', content_range);
			res.json(distilled_items);
		});
	});

	app.get('/workspaces/:workspace_handle/api', workspaceLoader, function* (req, res, resume) {

		var workspace = req.showcase.workspace;
		var api = armrest.client("localhost:" + app.get('port'));

		var collections = yield Collection.all({ workspace_handle: workspace.handle }, resume());
		console.warn("fetched collections");

		var collection_resources = [];

		async.forEach(collections, function(collection, cb) {

			var route = '/api/' + workspace.handle  + '/' + collection.name;

			api.get({
				url: route,
				params: { per_page: 1 },
				success: function(items, response) {

					var resources = [];
					resources.collection = collection;

					var example_response = response.body;
					if (example_response && example_response.length > EXAMPLE_LENGTH) {
						example_response = example_response.substring(0, EXAMPLE_LENGTH) + '...';
					}

					var resource = {
						method: 'GET',
						route: route,
						preview: route,
						description: 'Get a listing of ' + collection.title.toLowerCase(),
						example_uri: route
					};

					if (response.body !== '[]') {
						resource.example_response = example_response;
					}

					resources.push(resource);

					var write_resource = {
						method: 'POST',
						route: route,
						description: 'Create ' + collection.title.toLowerCase(),
						parameters: collection.fields
					}

					resources.push(write_resource);

					collection_resources.push(resources);
					cb();
				}
			});

		}, function() {

			collection_resources = collection_resources
				.sort(function(a, b) { return a.collection.title.localeCompare(b.collection.title); });

			res.render("api.html", { collection_resources: collection_resources });
		});
	});
};

