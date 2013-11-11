var http = require('http');
var express = require('express');
var path = require('path');
var swig = require('swig');
var consolidate = require('consolidate');
var Dreamer = require('dreamer');
var async = require('async');
var tame = require('tamejs')
var flash = require('connect-flash');
var mkdirp = require('mkdirp');
var armrest = require('armrest');
var util = require('util');

tame.register({ catchExceptions : true });

var app = express();
app.showcase = {};

var views = __dirname + '/views';
swig.init({ root: views, allowErrors: true });

var dreamer = Dreamer.initialize({
	app: app,
	schema: "spec/schema.md"
});

app.dreamer = dreamer;

exports.initialize = function(config) {

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
		app.use(app.router);
	});

	app.get('/', function(req, res) {
		res.redirect("/workspaces");
	});

	require('./routes/setup.tjs').initialize(app);
	require('./routes/workspaces.tjs').initialize(app);
	require('./routes/entity.tjs').initialize(app);
	require('./routes/item.tjs').initialize(app);
	require('./routes/api.tjs').initialize(app);
	require('./routes/users.tjs').initialize(app);
	require('./routes/login.tjs').initialize(app);
	require('./routes/files.tjs').initialize(app);

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

	dreamer.dream();
};

