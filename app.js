var http = require('http');
var express = require('express');
var path = require('path');
var swig = require('swig');
var consolidate = require('consolidate');
var Dreamer = require('dreamer');
var async = require('async');
var tamejs = require('tamejs').register();

var app = express();

var views = __dirname + '/views';
swig.init({ root: views, allowErrors: true });

var errorHandler = function(req, res, next) {

	req.error = function(error) {

		if (arguments.length == 2) {
			var status = arguments[0];
			var error = arguments[1];
		} else {
			var status = 500;
			var error = arguments[0];
		}

		res.json(status, error);
	};

	next();
};

app.configure(function(){
	app.engine('.html', consolidate.swig);
	app.set('view engine', 'html');
	app.set('views', views);
	app.set('port', process.env.PORT || 3000);
	app.use(errorHandler);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('__SECRET__'));
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

var dreamer = Dreamer.initialize({
	app: app,
	schema: "spec/schema.md",
	//resources: "spec/resources.md"
});

app.dreamer = dreamer;

app.del("/admin/entities/:entity_id/items/:item_id", function(req, res) {

	var entity_id = req.params.entity_id;
	var item_id = req.params.item_id;

	dreamer.models.entity_items.find({ where: { id: item_id } })
		.error(req.error)
		.success(function(entity) {
			entity.destroy()
				.success(function() {
					res.redirect("/admin/entities/" + entity_id + "/items");
				});
		});
});

app.get("/admin/entities/:id/items", function(req, res) {

	var entity_id = req.params.id;

	dreamer.models.entity_items.findAll({ where: { entity_id: entity_id } })
		.error(req.error)
		.success(function(items) {

			var ids = items.map(function(i) { return i.id });

			dreamer.models.entity_item_data.findAll({ where: { entity_item_id: ids } })
				.success(function(item_data) {

					items = JSON.parse(JSON.stringify(items));
					items.forEach(function(item) {

						var data = JSON.parse(item_data
							.filter(function(d) { return d.entity_item_id == item.id })
							.shift()
							.data);

						for (k in data) { item[k] = data[k] }
					});

					dreamer.models.entities.find({ where: { id: entity_id } })
						.error(req.error)
						.success(function(entity) {

							dreamer.models.entity_fields.findAll({ where: { entity_id: entity_id } })
								.error(req.error)
								.success(function(fields) {

									res.render("entity_items.html", { 
										entity: entity,
										items: items,
										fields: fields
									});
								});
						});
				});
		});
});

app.get("/admin/entities/:id/items/new", function(req, res) {

	dreamer.models.entities.find({ where: { id: req.params.id } })
		.error(req.error)
		.success(function(entity) {
			dreamer.models.entity_fields.findAll({ where: { entity_id: req.params.id } })
				.success(function(fields) {
					res.render("entity_items_new.html", {
						fields: fields,
						entity: entity
					});
				});
		});
});


app.post("/admin/entities/:id/items/new", function(req, res) {

	var entity_id = req.params.id;

	dreamer.models.entity_fields.findAll({ entity_id: entity_id })
		.error(req.error)
		.success(function(fields) {

			var item_data = {};

			fields.forEach(function(field) {
				item_data[field.name] = req.body[field.name];
			});	

			var item = dreamer.models.entity_items.build({ entity_id: entity_id });

			item.save()
				.error(req.error)
				.success(function(item) {

					var data = dreamer.models.entity_item_data.build({
						entity_item_id: item.id,
						data: JSON.stringify(item_data),
						content_type: 'application/json'
					});

					data.save()
						.error(req.error)
						.success(function() {
							res.redirect("/admin/entities/" + entity_id + "/items");
						});
				});
		});
});

require('./routes/entity.tjs').initialize(app);
require('./routes/item.tjs').initialize(app);

dreamer.dream();

