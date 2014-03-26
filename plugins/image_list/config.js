var File = require('../../lib/file');

module.exports = {
	name: 'image_list',
	template: 'image_list',
	validator: null,
	placeholder: '',
	preview: function(value) {

		try { var parsed_data = JSON.parse(value) } 
		catch (e) { return "" }

		return '<span class="badge">' + parsed_data.file_ids.length + '</span>';
		
	},
	inflate: function(field, item, models, callback) {

		if (!item.data[field.name]) return callback(null);

		try { var parsed_data = JSON.parse(item.data[field.name]); }
		catch (e) {
			console.log("couldn't parse image list data");
			return callback([]);
		}

		var file_ids = parsed_data.file_ids;
		var inflated_files = [];
		var tasks = [];
		File.all({ id: file_ids }, function(err, files) {
			var inflated_files = [];
			var sorted_files = [];
			files.forEach( function(file) {
				var inflated_file = {
					url: file.url,
					size: file.size,
					original_filename: file.original_filename,
					content_type: file.content_type,
					file_id: file.id
				}

				inflated_files.push(inflated_file);
			});
			file_ids.forEach(function(file_id) {
				var file = inflated_files.filter(function(f) { return f.file_id == file_id })[0];
				sorted_files.push(file);
			});
			return callback(sorted_files);
		});
	}
};

