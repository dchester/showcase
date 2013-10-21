var fs = require('fs');
var path = require('path');
var swig = require('swig');

var fields = require('./fields');

var plugins = { field: [], auth: [], behavior: [], middleware: [] };

var style = '';
var script = '';

exports.slurp = function(dir) {
	var config = require(path.join(dir, './config'));

	var script = fs.readFileSync(path.join(dir, 'script.js'), 'utf-8');
	var template = fs.readFileSync(path.join(dir, 'template.html'), 'utf-8');
	var style = fs.readFileSync(path.join(dir, 'style.css'), 'utf-8');

	return {
		config: config,
		script: script,
		template: template,
		style: style
	};
}

exports.register = function(type, plugin) {

	if (!plugins[type]) throw new Error('bad plugin type: ' + type);

	plugins[type].push(plugin);

	if (type == 'field') {
		fields.register(plugin.config);
	}
	
	if (plugin.style) style += '\n' + plugin.style;
	if (plugin.script) script += ';' + plugin.script;

	if (plugin.template) {
		var template_path = path.join('plugins', type, plugin.config.name);
		swig.compile(plugin.template, { filename: template_path });
		plugin.config.template = template_path;
	}
};

exports.route = function(app) {

	app.get('/css/plugins.css', function(req, res) {
		res.set('content-type', 'text/css');
		res.send(style);
	});

	app.get('/js/plugins.js', function(req, res) {
		res.set('content-type', 'application/javascript');
		res.send(script);
	});
};
