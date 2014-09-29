var http = require('http');
var express = require('express');
var path = require('path');
var swig = require('swig');
var Dreamer = require('dreamer');
var async = require('async');
var flash = require('connect-flash');
var mkdirp = require('mkdirp');
var armrest = require('armrest');
var util = require('util');
var router = require('./lib/gx-express-router');
var gx = require('gx');
var passport = require('passport');
var strategy = require('./lib/passport-strategy');
var User = require('./lib/user');

var app = express();
app.showcase = {};

var views = __dirname + '/views';
swig.setDefaults({ views: views });

var externalMiddleware = [];

exports.middleware = function(fn) {
	externalMiddleware.push(fn);
};

exports.initialize = function(config) {

	config = config || {};
	config.files = config.files || {};
	config.auth = config.auth || {};

	if (!config.files.tmp_path) {
		throw new Error("please specify files.tmp_path in config");
	}

	if (!config.files.storage_path) {
		throw new Error("please specify files.storage_path in config");
	}

	var secret = config.secret;

	if (!secret) {
		console.warn("falling back to default session secret; please send a secret to showcase.initialize");
		secret = "arthur is fond of jimz";
	}

	var dreamer = Dreamer.initialize({
		app: app,
		schema: __dirname + "/spec/schema.md",
		resources: __dirname + "/spec/resources.md",
		fixtures: __dirname + "/spec/fixtures.md",
		database: config.database
	});

	app.dreamer = dreamer;

	config.auth.passport_strategy = config.auth.passport_strategy || strategy.local;
	passport.use(config.auth.passport_strategy);

	var storagePath;
	if (!config.files.storage_path.match(/^\//)) {
		var relativeBase = path.dirname(require.main.filename);
		storagePath = path.join(relativeBase, config.files.storage_path);
	} else {
		storagePath = config.files.storage_path; 
	}

	mkdirp.sync(config.files.storage_path + "/files");

	var File = require('./lib/file');
	File.methods(config.files);

	var middleware = require('./lib/middleware').initialize(app);
	app.showcase.middleware = middleware;

	app.showcase.config = config;

	app.configure(function(){
		app.engine('.html', swig.renderFile);
		app.set('router', router);
		app.set('view engine', 'html');
		app.set('views', views);
		app.set('port', process.env.PORT || config.port || 3000);
		app.use(middleware.errorHandler);
		app.use(middleware.staticRewrite);
		app.use(express.static(path.join(__dirname, 'public')), { maxAge: 600 });
		app.use(express.static(storagePath));
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser('__SECRET__'));
		app.use('/files', express.cookieSession({ secret: secret }));
		app.use('/workspaces', express.cookieSession({ secret: secret }));
		app.use('/admin', express.cookieSession({ secret: secret }));
		app.use(flash());
		app.use(middleware.flashLoader);
		app.use(passport.initialize());
		app.use(middleware.sessionLocalizer);
		app.use(middleware.setupChecker);
		externalMiddleware.forEach(function(fn) { fn(app) });
		app.use(middleware.fixturesLoader);
		app.use(app.router);
	});

	app.get('/', function(req, res) {
		res.redirect("/workspaces");
	});

	require('./routes/setup.js').initialize(app);
	require('./routes/workspaces.js').initialize(app);
	require('./routes/collection.js').initialize(app);
	require('./routes/item.js').initialize(app);
	require('./routes/api.js').initialize(app);
	require('./routes/users.js').initialize(app);
	require('./routes/login.js').initialize(app);
	require('./routes/files.js').initialize(app);
	require('./routes/page.js').initialize(app);
	require('./routes/site.js').initialize(app);
	require('./routes/site-preview.js').initialize(app);

	var Radio = function() {};
	util.inherits(Radio, require('events').EventEmitter);

	app.radio = new Radio();
	exports.radio = app.radio;
}

var plugins = require('./lib/plugins');
var registerPlugins = function() {

	var image_list = require('./plugins/image_list');
	plugins.register('field', image_list);

	var image = require('./plugins/image');
	plugins.register('field', image);
}

exports.plugins = plugins;
exports.registerField = function(field) {
	plugins.register('field', field);
};

exports.run = function() {
	registerPlugins();
	plugins.route(app);
	var server = app.dreamer.dream();
	return server;
};

exports.app = app;

exports.mergeUser = User.merge;

