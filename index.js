var http = require('http');
var express = require('express');
var path = require('path');
var swig = require('swig');
var consolidate = require('consolidate');
var Dreamer = require('dreamer');
var async = require('async');
var flash = require('connect-flash');
var mkdirp = require('mkdirp');
var armrest = require('armrest');
var util = require('util');
var router = require('./lib/gx-express-router');
var api = require('./lib/api.js');
var gx = require('gx');

var app = express();
app.showcase = {};

var views = __dirname + '/views';
swig.init({ root: views, allowErrors: true });

var externalMiddleware = [];

exports.middleware = function(fn) {
	externalMiddleware.push(fn);
};

exports.initialize = function(config) {

	var dreamer = Dreamer.initialize({
		app: app,
		schema: __dirname + "/spec/schema.md",
		resources: __dirname + "/spec/resources.md",
		database: config.database
	});

	app.dreamer = dreamer;

	var storagePath;
	if (!config.files.storage_path.match(/^\//)) {
		storagePath = path.join(__dirname, config.files.storage_path); 
	} else {
		storagePath = config.files.storage_path; 
	}

	mkdirp.sync(config.files.storage_path + "/files");

	var secret = 'arthur is fond of jimz';

	var middleware = require('./lib/middleware').initialize(app);
	app.showcase.middleware = middleware;

	app.configure(function(){
		app.engine('.html', consolidate.swig);
		app.set('router', router);
		app.set('view engine', 'html');
		app.set('views', views);
		app.set('port', process.env.PORT || config.port || 3000);
		app.use(middleware.errorHandler);
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
		app.use(middleware.sessionLocalizer);
		app.use(middleware.setupChecker);
		externalMiddleware.forEach(function(fn) { fn(app) });
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

	gx(function*() {

		registerPlugins();
		plugins.route(app);
		app.dreamer.dream();
		yield api.setupUser();
	});
};

exports.app = app;

