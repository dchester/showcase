var File = require('../../lib/file');

module.exports = {
	name: 'image',
	template: 'image',
	validator: null,
	placeholder: '',
	preview: function(value) {

		try { var parsed_data = JSON.parse(value) } 
		catch (e) { return "" }

		return '<h4><i class="muted large icon-picture"></i></h4>';
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

