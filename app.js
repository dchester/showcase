var http = require('http');
var express = require('express');
var path = require('path');
var swig = require('swig');
var consolidate = require('consolidate');
var Dreamer = require('dreamer');
var async = require('async');
var tame = require('tamejs')
var flash = require('connect-flash');
var config = require('config');
var mkdirp = require('mkdirp');
var armrest = require('armrest');

tame.register({ catchExceptions : true });

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

var storagePath;
if (!config.files.storage_path.match(/^\//)) {
	storagePath = path.join(__dirname, config.files.storage_path); 
} else {
	storagePath = config.files.storage_path; 
}

mkdirp.sync(config.files.storage_path + "/files");

var secret = 'arthur is fond of jimz';

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
	app.use('/workspaces', express.cookieSession({ secret: secret }));
	app.use('/admin', express.cookieSession({ secret: secret }));
	app.use(flash());
	app.use(flashLoader);
	app.use(sessionLocalizer);
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')), { maxAge: 600 });
	app.use(express.static(storagePath));
});

var dreamer = Dreamer.initialize({
	app: app,
	schema: "spec/schema.md"
});

app.dreamer = dreamer;

app.get('/', function(req, res) {
	res.redirect("/workspaces");
});

/*
app.get('/admin/session', function(req, res) {
	res.json(req.session);
});
*/

require('./routes/workspaces.tjs').initialize(app);
require('./routes/entity.tjs').initialize(app);
require('./routes/item.tjs').initialize(app);
require('./routes/api.tjs').initialize(app);
require('./routes/users.tjs').initialize(app);
require('./routes/login.tjs').initialize(app);

dreamer.dream();

