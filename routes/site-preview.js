var URL = require('url');
var md5 = require('MD5');
var gx = require('gx');
var express = require('express');
var Route = express.Route;
var request = require('request');
var swig = require('swig');
var marked = require('marked');
var marked_section = require('../lib/marked-section');
var m_tag = require('../lib/swig-markdown');
var Loader = require('../lib/swig-loader');

exports.initialize = function(app) {

	var models = app.dreamer.models;

	app.get(/^\/sites\/(\w+)\/preview\/static\/(\w+)\/site.css/, function*(req, res) {

		var site_id = req.params[0];
		var site = yield models.sites
			.find({ where: { id: site_id } })
			.complete(gx.resume);

		res.set('Content-Type', 'text/css');
		res.send(site.css);
	});

	app.get(/^\/sites\/(\w+)\/preview\/static\/(\w+)\/page-(\w+).css/, function*(req, res) {

		var site_id = req.params[0];
		var page_id = req.params[2];
		var page = yield models.pages
			.find({ where: { id: page_id } })
			.complete(gx.resume);

		if (!page) return res.send(404);
		if (page.site_id != site_id) return res.send(404);

		res.set('Content-Type', 'text/css');
		res.send(page.css);
	});

	app.get(/^\/sites\/(\w+)\/preview\/(.*)/, function*(req, res) {

		var site_id = req.params[0];
		var url_path = "/" + req.params[1];
		var route;

		var swig = _swig(site_id);

		// find the route

		var site = yield models.sites
			.find({ where: { id: site_id } })
			.complete(gx.resume);

		var pages = yield models.pages
			.findAll({ where: { site_id: site_id } })
			.complete(gx.resume);

		var page = pages.filter(function(p) {
			var r = new Route('GET', p.url_path);
			if (r.match(url_path)) {
				route = r;
				return true;
			}
		}).shift();

		if (!page) return res.send(404);

		site_css_hash = md5(site.css);
		site_css_url = 'static/' + site_css_hash + '/site.css';
		page_css_hash = md5(page.css);
		page_css_url = 'static/' + page_css_hash + '/page-' + page.id + '.css';

		// fetch the data

		var queue = [];
		var data = { site_css_url: site_css_url, page_css_url: page_css_url };

		page.data_sources
			.split("\n")
			.forEach(function(source_record) {
				var source = source_record.split(/\s+/);
				var name = source[0];
				var url = source[1];
				if (!url || !name) return;
				var url_data = URL.parse(url);
				if (!url_data.hostname) {
					url_data.hostname = url_data.hostname || 'localhost';
					url_data.protocol = url_data.protocol || 'http';
					url_data.port = app.get('port');
				}
				url_data.pathname = interpolatePath(url_data.pathname, route.params);
				url = URL.format(url_data);
				queue.push({ name: name, url: url });
			});

		for (var i = 0; i < queue.length; i++) {
			// kick off requests
			var source = queue[i];
			request(source.url, { json: true }, complete());
		}

		for (var i = 0; i < queue.length; i++) {
			// harvest the results
			data[queue[i].name] = yield null;
		}

		var layout_filename = '/site-' + site.id + '-layout.html'
		swig._loader.set(layout_filename, site.template);
		var layout_template = swig.compileFile(layout_filename, site.template);

		var preamble = "{% extends '" + layout_filename + "' %}\n";
		if (!String(page.template).match(/\{% block content %\}/)) {
			page.template = "\n{% block content %}\n" + page.template + "\n{% endblock %}";
		}

		var page_template_key = '/page-' + page.id;
		swig._loader.set(page_template_key, preamble + page.template);
		var content_template = swig.compileFile(page_template_key, preamble + page.template);

		var output = content_template(data);

		res.send(output);
		res.end();

	});

	var _swig = function(site_id) {

		var instance = _swig.instances[site_id];

		if (!instance) {
			var loader = new Loader();
			instance = new swig.Swig({ loader: loader, cache: false });
			instance._loader = loader;
			_swig.instances[site_id] = instance;
			instance.setTag('block', m_tag.parse, m_tag.compile, m_tag.ends, m_tag.block);
			instance.setExtension('block', marked);

		}

		return instance;
	}

	_swig.instances = {};
};

function complete() {
	var callback = gx.resume;
	// fish out the data param
 	return function(err, response, data) {
		if (err) console.warn(err);
		callback(err, data);
	}
}

function interpolatePath(path, params) {

	return path.replace(/\/:(\w+)/g, function(match, name) {
		var value;
		if (name in params) {
			value = params[name];
			delete params[name];
		} else {
			value = ':' + name;
		}
		return '/' + value;
	});
};

