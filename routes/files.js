var async = require('async');
var path = require('path');
var File = require('../lib/file');

exports.initialize = function(app) {

	var models = app.dreamer.models;
	var storage_path = app.showcase.config.files.storage_path;

	app.post('/files', function(req, res) {

		var item_id = req.params.item_id;
		var file_keys = Object.keys(req.files);

		var files = [];

		async.forEach(file_keys, function(key, callback) {

			var upload = req.files[key];

			if (upload.size == 0) return callback();
			var content_type = upload.type || upload.headers['content-type'] || 'application/octet-stream';

			File.create({ 
				original_filename: upload.name,
				source_path: upload.path,
				size: upload.size,
				item_id: item_id,
				content_type: content_type,
				storage_path: storage_path

			}, function(err, file) {
				files.push(File.distill(file));
				callback();
			});

		}, function(err) {
			if (err) return req.error(err);
			res.json(files);
		});
	});
};

