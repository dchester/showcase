var File = require('../../lib/file');

module.exports = {
	name: 'image',
	template: 'image',
	validator: null,
	placeholder: '',
	preview: function(value) {

		if (typeof value !== 'object') {
			try { JSON.parse(value) }
			catch(e) { return '' }
		} else if (value === null) {
			return '';
		}
		return '<h4><i class="muted large icon-picture"></i></h4>';
	},
	deflate: function(field, item, models, callback) {
		if (!item.data[field.name]) return callback('');
		var json_string;
		if (typeof item.data[field.name] === 'object') {
			json_string = JSON.stringify(item.data[field.name]);
		}
		callback(json_string || item.data[field.name]);
	},
	inflate: function(field, item, models, callback) {

		if (!item.data[field.name]) return callback(null);

		try { var parsed_data = JSON.parse(item.data[field.name]); }
		catch (e) {
			console.log("couldn't parse image list data");
			return callback([]);
		}

		if (!parsed_data) return callback(null);
		var file_id = parsed_data.file_id;

		File.load({ id: file_id }, function(err, file) {

			var inflated_file = {
				url: file.url,
				size: file.size,
				original_filename: file.original_filename,
				content_type: file.content_type,
				file_id: file.id
			}

			callback(inflated_file);
		});
	}
};

