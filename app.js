var http = require('http');
var express = require('express');
var path = require('path');
var swig = require('swig');
var consolidate = require('consolidate');
var Dreamer = require('dreamer');
var async = require('async');
var tamejs = require('tamejs').register();
var flash = require('connect-flash');
var config = require('config');
var mkdirp = require('mkdirp');
var armrest = require('armrest');

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

var flashLoader = function(req, res, next) {

		var _render = res.render;

		res.render = function() {
			res.locals.messages = req.flash();
			_render.apply(res, arguments);
		};

		next();
};

var storagePath;
if (!config.files.storage_path.match(/^\//)) {
	storagePath = path.join(__dirname, config.files.storage_path); 
} else {
	storagePath = config.files.storage_path; 
}

mkdirp.sync(config.files.storage_path + "/files");

app.configure(function(){
	app.engine('.html', consolidate.swig);
	app.set('view engine', 'html');
	app.set('views', views);
	app.set('port', process.env.PORT || config.port || 3000);
	app.use(errorHandler);
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('__SECRET__'));
	app.use('/admin', express.session());
	app.use(flash());
	app.use(flashLoader);
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(express.static(storagePath));
});

var dreamer = Dreamer.initialize({
	app: app,
	schema: "spec/schema.md"
});

app.dreamer = dreamer;

app.get('/', function(req, res) {
	res.redirect("/admin/entities");
});

app.get ('/admin/fields', function(req, res) {
	var fields = require('./lib/fields');
	res.render("fields.html", { fields: fields.controls });
});

require('./routes/entity.tjs').initialize(app);
require('./routes/item.tjs').initialize(app);
require('./routes/api.tjs').initialize(app);

dreamer.dream();

