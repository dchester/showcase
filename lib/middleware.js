var gx = require('gx');
var API = require('./api');
var Status = require('./status');
var Permissions = require('./permission');

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
				req.showcase = req.showcase || {};
				req.showcase.workspace = workspace;
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
				req.showcase.workspace_user_permission = res.locals.workspace_user_permission = 'administrator';
				next();

			} else if (req.method == 'GET') {
				next();

			} else if (req.session && req.session.username) {
				models.workspace_user_permissions
					.find({ where: { user_id: req.session.user_id, workspace_handle: workspace_handle }})
					.error(req.error)
					.success(function(permission) {

						permission = permission.permission;
						req.showcase.workspace_user_permission = res.locals.workspace_user_permission = permission;

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

	var errorHandler = function(req, res, next) {

		req.error = function(error) {

			if (arguments.length == 2) {
				var status = arguments[0];
				var error = arguments[1];
			} else {
				var status = 500;
				var error = arguments[0];
			}

			try {
				var response = JSON.parse(JSON.stringify(error));
				response.message = error.toString();
			} catch(e) {
				var response = { error: error };
			}

			res.json(status, response);
		};

		next();
	};

	var flashLoader = function(req, res, next) {

		var _render = res.render;

		res.render = function() {
			res.locals.messages = req.flash();
			_render.apply(res, arguments);
		};

		next();
	};

	var sessionLocalizer = function(req, res, next) {
		res.locals.session = req.session;
		next();
	};

	var setupChecker = function(req, res, next) {

		if (app.showcase.setupComplete) return next();
		if (req.path == '/admin/setup') return next();
		if (req.path.match(/\/admin\/error/)) return next();
		if (req.path.match(/\/js\//)) return next();
		if (req.path.match(/\/css\//)) return next();
		if (req.path == '/') return next();

		var models = app.dreamer.models;
		var passport_strategy = app.showcase.config.auth.passport_strategy;

		models.users.count({ where: "username != 'api'" })
			.error(function(err) {

				var message =
					err.toString ? err.toString() :
					typeof err == 'object' ? JSON.stringify(err) : 'unknown error';

				if (message.match(/no.such.table/i)) {
					req.flash('danger', message);
					res.status(500);
					res.render("error_schema.html");
				} else {
					req.flash('danger', message);
					res.status(500);
					res.render("error_db.html");
				}
			})
			.success(function(users_count) {

				gx(function*() {

					var status_count = yield models.statuses.count().complete(gx.resume);

					if (!status_count) {
						req.flash('danger', "Couldn't find 'statuses' fixtures data");
						res.status(500);
						res.render("error_fixtures.html");

					} else if (users_count) {
						app.showcase.setupComplete = true;
						next();

					} else if (passport_strategy._callbackURL) {
						// all set if we have a third-party auth strategy
						app.showcase.setupComplete = true;
						next();

					} else {
						res.redirect("/admin/setup");
					}
				});
			});
	};

	var fixturesLoader = function(req, res, next) {

		if (req.path == '/') return next();
		if (!app.showcase.setupComplete) return next();

		gx(function*() {
			yield Status.load();
			yield Permissions.load();
			yield API.setupUser();
			next();
		});
	};

	var staticRewrite = function(req, res, next) {
		var matches = req.url.match(/sites\/\d+\/preview\/files\/(.+)/);
		if (matches) {
			req.url = '/files/' + matches[1];
		}
		next();
	};

	return {
		workspacePermission: workspacePermission,
		workspaceLoader: workspaceLoader,
		requireSuperuser: requireSuperuser,
		errorHandler: errorHandler,
		flashLoader: flashLoader,
		sessionLocalizer: sessionLocalizer,
		setupChecker: setupChecker,
		fixturesLoader: fixturesLoader,
		staticRewrite: staticRewrite
	};
};
