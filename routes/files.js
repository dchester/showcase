var path = require('path');
var mv = require('mv');
var sha1 = require('sha1');
var async = require('async');

exports.initialize = function(app) {

	var models = app.dreamer.models;

	app.post('/files', function(req, res) {

		var item_id = req.params.item_id;
		var file_keys = Object.keys(req.files);

		var files = [];

		async.forEach(file_keys, function(key, callback) {

			var upload = req.files[key];

			if (upload.size == 0) return callback();

			var filename = sha1(upload.path + Math.random()) + '-' + upload.name;
			var target_path = path.join(app.showcase.config.files.storage_path, 'files', filename);

			mv(upload.path, target_path, function(err) {

				if (err) return req.error(err);

				var content_type = upload.type || upload.headers['content-type'] || 'application/octet-stream';

				var file = models.files.build({
					item_id: item_id,
					path: filename,
					original_filename: upload.name,
					size: upload.size,
					content_type: content_type,
					meta_json: '{}',
					description: ''
				});

				file.save()
					.error(req.error)
					.success(function(file) {
						files.push(file);
						callback();
					});
			});

		}, function(err) {
			if (err) return req.error(err);
			res.json(files);
		});
	});
};

